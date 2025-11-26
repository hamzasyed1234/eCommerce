// backend/routes/orders.js
const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');

// Get all orders
router.get('/', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();

    const result = await connection.execute(
      `SELECT o.order_id, o.user_id, u.username, o.product_id, p.name AS product_name,
              o.quantity, o.total_amount, o.status, o.ordered_at
       FROM orders o
       JOIN users u ON o.user_id = u.user_id
       JOIN products p ON o.product_id = p.product_id
       ORDER BY o.ordered_at DESC`
    );

    const orders = result.rows.map(row => ({
      orderId: row[0],
      userId: row[1],
      username: row[2],
      productId: row[3],
      productName: row[4],
      quantity: row[5],
      totalAmount: row[6],
      status: row[7],
      orderedAt: row[8]
    }));

    res.json(orders);

  } catch (err) {
    console.error('Get orders error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Create a new order
router.post('/', async (req, res) => {
  const { userId, productId, quantity, totalAmount, status } = req.body;
  let connection;
  try {
    connection = await oracledb.getConnection();

    const result = await connection.execute(
      `INSERT INTO orders (order_id, user_id, product_id, quantity, total_amount, status, ordered_at)
       VALUES (order_seq.NEXTVAL, :userId, :productId, :quantity, :totalAmount, :status, SYSDATE)
       RETURNING order_id INTO :id`,
      {
        userId,
        productId,
        quantity,
        totalAmount,
        status,
        id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
      }
    );

    await connection.commit();

    res.json({
      message: 'Order created successfully',
      orderId: result.outBinds.id[0],
      userId,
      productId,
      quantity,
      totalAmount,
      status
    });

  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Update order status
router.put('/:orderId', async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;
  let connection;
  try {
    connection = await oracledb.getConnection();

    await connection.execute(
      `UPDATE orders
       SET status = :status
       WHERE order_id = :orderId`,
      { status, orderId }
    );

    await connection.commit();

    res.json({ message: 'Order status updated', orderId, status });

  } catch (err) {
    console.error('Update order error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Delete an order
router.delete('/:orderId', async (req, res) => {
  const { orderId } = req.params;
  let connection;
  try {
    connection = await oracledb.getConnection();

    await connection.execute(
      `DELETE FROM orders WHERE order_id = :orderId`,
      [orderId]
    );

    await connection.commit();

    res.json({ message: 'Order deleted', orderId });

  } catch (err) {
    console.error('Delete order error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

module.exports = router;
