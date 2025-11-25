// backend/routes/transactions.js
const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const authenticateToken = require('../middleware/auth');

router.post('/checkout', authenticateToken, async (req, res) => {
  const { cartItems } = req.body;
  const userId = req.user.userId;

  if (!cartItems || cartItems.length === 0) {
    return res.status(400).json({ message: 'Cart is empty' });
  }

  let connection;
  try {
    connection = await oracledb.getConnection();

    // Calculate total cost
    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Check buyer balance
    const balanceResult = await connection.execute(
      `SELECT balance FROM users WHERE user_id = :userId`,
      [userId]
    );

    if (!balanceResult.rows.length || balanceResult.rows[0][0] < total) {
      return res.status(400).json({ message: 'Insufficient funds' });
    }

    // Process each cart item
    for (const item of cartItems) {
      // Update stock
      const updateResult = await connection.execute(
        `UPDATE products 
         SET stock = stock - :qty, total_sold = total_sold + :qty
         WHERE product_id = :productId AND stock >= :qty`,
        { qty: item.quantity, productId: item.productId }
      );

      if (updateResult.rowsAffected === 0) {
        await connection.rollback();
        return res.status(400).json({ message: `Product "${item.name}" out of stock` });
      }

      // Credit seller
      await connection.execute(
        `UPDATE users SET balance = balance + :amount WHERE user_id = :sellerId`,
        { amount: item.price * item.quantity, sellerId: item.sellerId }
      );

      // Record transaction
      await connection.execute(
        `INSERT INTO transactions (transaction_id, buyer_id, seller_id, product_id, amount)
         VALUES (transaction_seq.NEXTVAL, :buyerId, :sellerId, :productId, :amount)`,
        { buyerId: userId, sellerId: item.sellerId, productId: item.productId, amount: item.price * item.quantity }
      );

      // Remove purchased item from cart using cart_id
      await connection.execute(
        `DELETE FROM cart WHERE cart_id = :cartId`,
        { cartId: item.cartId }
      );
    }

    // Deduct total from buyer
    await connection.execute(
      `UPDATE users SET balance = balance - :total WHERE user_id = :userId`,
      { total, userId }
    );

    await connection.commit();

    // Fetch new balance
    const newBalanceResult = await connection.execute(
      `SELECT balance FROM users WHERE user_id = :userId`,
      [userId]
    );

    res.json({
      message: 'Purchase successful',
      newBalance: newBalanceResult.rows[0][0]
    });

  } catch (err) {
    if (connection) await connection.rollback();
    console.error('Checkout error:', err);
    res.status(500).json({ message: 'Transaction failed', error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

module.exports = router;
