const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');

// Get all products
router.get('/', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    
    const result = await connection.execute(
      `SELECT p.product_id, p.name, p.price, p.description, p.stock, 
              p.seller_id, u.username as seller_name, p.total_sold
       FROM products p
       JOIN users u ON p.seller_id = u.user_id
       WHERE p.stock > 0
       ORDER BY p.listed_at DESC`
    );
    
    const products = result.rows.map(row => ({
      id: row[0],
      name: row[1],
      price: row[2],
      description: row[3],
      stock: row[4],
      sellerId: row[5],
      sellerName: row[6],
      totalSold: row[7] || 0
    }));
    
    res.json(products);
    
  } catch (err) {
    console.error('Get products error:', err);
    res.status(500).json({ message: 'Server error' });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
});

// Create product
router.post('/', async (req, res) => {
  const { name, price, description, stock, sellerId } = req.body;
  
  let connection;
  try {
    connection = await oracledb.getConnection();
    
    const result = await connection.execute(
      `INSERT INTO products (product_id, name, price, description, stock, seller_id, total_sold)
       VALUES (product_seq.NEXTVAL, :name, :price, :description, :stock, :sellerId, 0)
       RETURNING product_id INTO :id`,
      {
        name,
        price,
        description,
        stock,
        sellerId,
        id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
      }
    );
    
    await connection.commit();
    
    res.json({
      id: result.outBinds.id[0],
      name,
      price,
      description,
      stock,
      sellerId,
      totalSold: 0
    });
    
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
});

// Get user's products
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;
  
  let connection;
  try {
    connection = await oracledb.getConnection();
    
    const result = await connection.execute(
      `SELECT product_id, name, price, description, stock, total_sold
       FROM products
       WHERE seller_id = :userId
       ORDER BY listed_at DESC`,
      [userId]
    );
    
    const products = result.rows.map(row => ({
      id: row[0],
      name: row[1],
      price: row[2],
      description: row[3],
      stock: row[4],
      totalSold: row[5] || 0
    }));
    
    res.json(products);
    
  } catch (err) {
    console.error('Get user products error:', err);
    res.status(500).json({ message: 'Server error' });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
});

module.exports = router;