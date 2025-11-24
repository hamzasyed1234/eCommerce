const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const authenticateToken = require('../middleware/auth');

// Get cart items for logged-in user
router.get('/', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  let connection;
  try {
    connection = await oracledb.getConnection();

    const result = await connection.execute(
      `SELECT c.cart_id, c.product_id, c.quantity, p.name, p.price, p.stock, u.username AS seller_name, p.seller_id
       FROM cart c
       JOIN products p ON c.product_id = p.product_id
       JOIN users u ON p.seller_id = u.user_id
       WHERE c.user_id = :userId`,
      [userId]
    );

    const cartItems = result.rows.map(row => ({
      cartId: row[0],
      productId: row[1],
      quantity: row[2],
      name: row[3],
      price: row[4],
      stock: row[5],
      sellerName: row[6],
      sellerId: row[7]
    }));

    res.json(cartItems);
  } catch (err) {
    console.error('Get cart error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Add or update cart item
router.post('/', authenticateToken, async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user.userId;
  let connection;
  try {
    connection = await oracledb.getConnection();

    // Check product existence, ownership, and stock
    const productCheck = await connection.execute(
      `SELECT seller_id, stock FROM products WHERE product_id = :productId`,
      [productId]
    );

    if (productCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const [sellerId, stock] = productCheck.rows[0];

    // Check existing cart quantity
    const existing = await connection.execute(
      `SELECT cart_id, quantity FROM cart WHERE user_id = :userId AND product_id = :productId`,
      [userId, productId]
    );

    let existingQty = 0;
    if (existing.rows.length > 0) {
      existingQty = existing.rows[0][1];
    }

    if (sellerId === userId) return res.status(400).json({ message: "You can't add your own product" });
    if (stock < existingQty + quantity) return res.status(400).json({ message: 'Not enough stock' });

    if (existing.rows.length > 0) {
      // Update quantity
      const newQty = existingQty + quantity;
      await connection.execute(
        `UPDATE cart SET quantity = :quantity WHERE cart_id = :cartId`,
        { quantity: newQty, cartId: existing.rows[0][0] }
      );
    } else {
      // Insert new cart item
      await connection.execute(
        `INSERT INTO cart (cart_id, user_id, product_id, quantity)
         VALUES (cart_seq.NEXTVAL, :userId, :productId, :quantity)`,
        { userId, productId, quantity }
      );
    }

    await connection.commit();
    res.json({ message: 'Cart updated' });
  } catch (err) {
    console.error('Add to cart error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Remove cart item
router.delete('/:cartId', authenticateToken, async (req, res) => {
  const { cartId } = req.params;
  let connection;
  try {
    connection = await oracledb.getConnection();
    await connection.execute(
      `DELETE FROM cart WHERE cart_id = :cartId`,
      [cartId]
    );
    await connection.commit();
    res.json({ message: 'Cart item removed', cartId });
  } catch (err) {
    console.error('Delete cart item error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

module.exports = router;
