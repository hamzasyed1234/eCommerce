const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const authenticateToken = require('../middleware/auth');
const jwt = require('jsonwebtoken');

// Get all products with category info
router.get('/', async (req, res) => {
  let connection;
  let currentUserId = null;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const secret = process.env.JWT_SECRET || 'your_jwt_secret';
      const decoded = jwt.verify(token, secret);
      currentUserId = decoded.userId;
    } catch (err) {
      console.debug('Token invalid or expired, ignoring userId.');
    }
  }

  try {
    connection = await oracledb.getConnection();

    let query = `
      SELECT p.product_id, p.name, p.price, p.description, p.stock,
             p.seller_id, u.username AS seller_name, p.total_sold,
             p.category_id, c.category_name
      FROM products p
      JOIN users u ON p.seller_id = u.user_id
      LEFT JOIN product_categories c ON p.category_id = c.category_id
      WHERE p.stock > 0
    `;

    const binds = [];

    if (currentUserId) {
      query += ` AND p.seller_id != :currentUserId`;
      binds.push(currentUserId);
    }

    query += ` ORDER BY p.listed_at DESC`;

    const result = await connection.execute(query, binds);

    const products = result.rows.map(row => ({
      id: row[0],
      name: row[1],
      price: row[2],
      description: row[3],
      stock: row[4],
      sellerId: row[5],
      sellerName: row[6],
      totalSold: row[7] || 0,
      categoryId: row[8],
      categoryName: row[9] || 'Uncategorized'
    }));

    res.json(products);

  } catch (err) {
    console.error('Get products error:', err);
    res.status(500).json({ message: 'Server error' });
  } finally {
    if (connection) await connection.close();
  }
});

// Create product (logged-in users)
router.post('/', authenticateToken, async (req, res) => {
  const { name, price, description, stock, categoryId } = req.body;
  const sellerId = req.user.userId;

  let connection;
  try {
    connection = await oracledb.getConnection();

    const result = await connection.execute(
      `INSERT INTO products (product_id, name, price, description, stock, seller_id, total_sold, category_id)
       VALUES (product_seq.NEXTVAL, :name, :price, :description, :stock, :sellerId, 0, :categoryId)
       RETURNING product_id INTO :id`,
      {
        name,
        price,
        description,
        stock,
        sellerId,
        categoryId: categoryId || null,
        id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
      }
    );

    await connection.commit();

    let categoryName = null;
    if (categoryId) {
      const catResult = await connection.execute(
        `SELECT category_name FROM product_categories WHERE category_id = :categoryId`,
        [categoryId]
      );
      categoryName = catResult.rows.length > 0 ? catResult.rows[0][0] : null;
    }

    res.json({
      id: result.outBinds.id[0],
      name,
      price,
      description,
      stock,
      sellerId,
      totalSold: 0,
      categoryId,
      categoryName
    });

  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// ----------------------
// NEW ROUTE: /mine
// ----------------------
router.get('/mine', authenticateToken, async (req, res) => {
  const sellerId = req.user.userId;
  let connection;

  try {
    connection = await oracledb.getConnection();

    const result = await connection.execute(
      `SELECT p.product_id, p.name, p.price, p.description, p.stock, p.total_sold,
              p.category_id, c.category_name
       FROM products p
       LEFT JOIN product_categories c ON p.category_id = c.category_id
       WHERE p.seller_id = :sellerId
       ORDER BY p.listed_at DESC`,
      [sellerId]
    );

    const products = result.rows.map(row => ({
      id: row[0],
      name: row[1],
      price: row[2],
      description: row[3],
      stock: row[4],
      totalSold: row[5] || 0,
      categoryId: row[6],
      categoryName: row[7] || 'Uncategorized'
    }));

    res.json(products);

  } catch (err) {
    console.error('Get my products error:', err);
    res.status(500).json({ message: 'Server error' });
  } finally {
    if (connection) await connection.close();
  }
});

// ----------------------
// Update product (logged-in users)
// ----------------------
router.put('/:productId', authenticateToken, async (req, res) => {
  const { productId } = req.params;
  const { name, price, description, stock, categoryId } = req.body;
  const sellerId = req.user.userId;

  let connection;
  try {
    connection = await oracledb.getConnection();

    const check = await connection.execute(
      `SELECT seller_id FROM products WHERE product_id = :productId`,
      [productId]
    );

    if (check.rows.length === 0) return res.status(404).json({ message: 'Product not found' });
    if (check.rows[0][0] !== sellerId) return res.status(403).json({ message: 'Not authorized' });

    await connection.execute(
      `UPDATE products
       SET name = :name,
           price = :price,
           description = :description,
           stock = :stock,
           category_id = :categoryId
       WHERE product_id = :productId`,
      { name, price, description, stock, categoryId: categoryId || null, productId }
    );

    await connection.commit();

    res.json({ message: 'Product updated successfully' });

  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// ----------------------
// Delete product (logged-in users)
// ----------------------
router.delete('/:productId', authenticateToken, async (req, res) => {
  const { productId } = req.params;
  const sellerId = req.user.userId;

  let connection;
  try {
    connection = await oracledb.getConnection();

    const check = await connection.execute(
      `SELECT seller_id FROM products WHERE product_id = :productId`,
      [productId]
    );

    if (check.rows.length === 0) return res.status(404).json({ message: 'Product not found' });
    if (check.rows[0][0] !== sellerId) return res.status(403).json({ message: 'Not authorized' });

    await connection.execute(`DELETE FROM cart WHERE product_id = :productId`, [productId]);
    await connection.execute(`DELETE FROM order_items WHERE product_id = :productId`, [productId]);
    await connection.execute(`DELETE FROM transactions WHERE product_id = :productId`, [productId]);

    await connection.execute(`DELETE FROM products WHERE product_id = :productId`, [productId]);

    await connection.commit();
    res.json({ message: 'Product deleted successfully' });

  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

module.exports = router;
