const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');

// Checkout - Purchase products
router.post('/checkout', async (req, res) => {
  const { userId, cartItems } = req.body;
  
  let connection;
  try {
    connection = await oracledb.getConnection();
    
    // Calculate total
    const total = cartItems.reduce((sum, item) => sum + item.price, 0);
    
    // Check user balance
    const balanceResult = await connection.execute(
      `SELECT balance FROM users WHERE user_id = :userId`,
      [userId]
    );
    
    if (balanceResult.rows[0][0] < total) {
      return res.status(400).json({ message: 'Insufficient funds' });
    }
    
    // Process each item
    for (const item of cartItems) {
      // Update product stock
      await connection.execute(
        `UPDATE products 
         SET stock = stock - 1, total_sold = total_sold + 1
         WHERE product_id = :productId AND stock > 0`,
        [item.id]
      );
      
      // Add money to seller
      await connection.execute(
        `UPDATE users SET balance = balance + :price WHERE user_id = :sellerId`,
        { price: item.price, sellerId: item.sellerId }
      );
      
      // Record transaction
      await connection.execute(
        `INSERT INTO transactions (transaction_id, buyer_id, seller_id, product_id, amount)
         VALUES (transaction_seq.NEXTVAL, :buyerId, :sellerId, :productId, :amount)`,
        {
          buyerId: userId,
          sellerId: item.sellerId,
          productId: item.id,
          amount: item.price
        }
      );
    }
    
    // Deduct from buyer
    await connection.execute(
      `UPDATE users SET balance = balance - :total WHERE user_id = :userId`,
      { total, userId }
    );
    
    await connection.commit();
    
    // Get updated balance
    const newBalanceResult = await connection.execute(
      `SELECT balance FROM users WHERE user_id = :userId`,
      [userId]
    );
    
    res.json({
      message: 'Purchase successful',
      newBalance: newBalanceResult.rows[0][0]
    });
    
  } catch (err) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Checkout error:', err);
    res.status(500).json({ message: 'Transaction failed', error: err.message });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
});

// Update balance (for gambling)
router.post('/update-balance', async (req, res) => {
  const { userId, amount } = req.body;
  
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
    if (connection) {
      await connection.close();
    }
  }
});

module.exports = router;