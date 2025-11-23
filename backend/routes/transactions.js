// backend/routes/transactions.js
const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const authenticateToken = require('../middleware/auth');

// Checkout - Purchase products
router.post('/checkout', authenticateToken, async (req, res) => {
  const { cartItems } = req.body;
  const userId = req.user.userId;

  let connection;
  try {
    connection = await oracledb.getConnection();

    const total = cartItems.reduce((sum, item) => sum + item.price, 0);

    // Check user balance
    const balanceResult = await connection.execute(
      `SELECT balance FROM users WHERE user_id = :userId`,
      [userId]
    );

    if (balanceResult.rows[0][0] < total) {
      return res.status(400).json({ message: 'Insufficient funds' });
    }

    for (const item of cartItems) {
      // Update stock
      const updateResult = await connection.execute(
        `UPDATE products 
         SET stock = stock - 1, total_sold = total_sold + 1
         WHERE product_id = :productId AND stock > 0`,
        [item.id]
      );

      if (updateResult.rowsAffected === 0) {
        await connection.rollback();
        return res.status(400).json({ message: `Product ${item.name} out of stock` });
      }

      // Add money to seller
      await connection.execute(
        `UPDATE users SET balance = balance + :price WHERE user_id = :sellerId`,
        { price: item.price, sellerId: item.sellerId }
      );

      // Record transaction
      await connection.execute(
        `INSERT INTO transactions (transaction_id, buyer_id, seller_id, product_id, amount)
         VALUES (transaction_seq.NEXTVAL, :buyerId, :sellerId, :productId, :amount)`,
        { buyerId: userId, sellerId: item.sellerId, productId: item.id, amount: item.price }
      );
    }

    // Deduct from buyer
    await connection.execute(
      `UPDATE users SET balance = balance - :total WHERE user_id = :userId`,
      { total, userId }
    );

    await connection.commit();

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

// Update balance (gambling or adjustments)
router.post('/update-balance', authenticateToken, async (req, res) => {
  const { amount } = req.body;
  const userId = req.user.userId;

  let connection;
  try {
    connection = await oracledb.getConnection();

    await connection.execute(
      `UPDATE users SET balance = balance + :amount WHERE user_id = :userId`,
      { amount, userId }
    );

    await connection.commit();

    const result = await connection.execute(
      `SELECT balance FROM users WHERE user_id = :userId`,
      [userId]
    );

    res.json({ newBalance: result.rows[0][0] });

  } catch (err) {
    console.error('Update balance error:', err);
    res.status(500).json({ message: 'Server error' });
  } finally {
    if (connection) await connection.close();
  }
});

// GET all transactions (for viewing/testing)
router.get('/', authenticateToken, async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();

    const result = await connection.execute(
      `SELECT t.transaction_id, t.buyer_id, b.username as buyer_name,
              t.seller_id, s.username as seller_name,
              t.product_id, p.name as product_name, t.amount, t.transaction_date
       FROM transactions t
       JOIN users b ON t.buyer_id = b.user_id
       JOIN users s ON t.seller_id = s.user_id
       JOIN products p ON t.product_id = p.product_id
       ORDER BY t.transaction_date DESC`
    );

    const transactions = result.rows.map(row => ({
      transactionId: row[0],
      buyerId: row[1],
      buyerName: row[2],
      sellerId: row[3],
      sellerName: row[4],
      productId: row[5],
      productName: row[6],
      amount: row[7],
      transactionDate: row[8]
    }));

    res.json(transactions);

  } catch (err) {
    console.error('Get transactions error:', err);
    res.status(500).json({ message: 'Server error' });
  } finally {
    if (connection) await connection.close();
  }
});

module.exports = router;
