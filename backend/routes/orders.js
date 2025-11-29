// backend/routes/orders.js
const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');

// Utility to normalize incoming buyer id
function getBuyerIdFromBody(body) {
  // accept either userId or buyerId to be tolerant of existing frontend
  return body.buyerId ?? body.userId ?? null;
}

// Get all orders
router.get('/', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();

    const result = await connection.execute(
      `SELECT o.order_id, o.buyer_id, u.username, o.order_date, o.total_amount
       FROM orders o
       LEFT JOIN users u ON o.buyer_id = u.user_id
       ORDER BY o.order_date DESC`
    );

    const orders = (result.rows || []).map(row => ({
      orderId: row[0],
      buyerId: row[1],
      username: row[2] || null,
      orderDate: row[3],
      totalAmount: row[4]
    }));

    res.json(orders);

  } catch (err) {
    console.error('Get orders error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  } finally {
    if (connection) try { await connection.close(); } catch (e) { console.error(e); }
  }
});

// Get single order by ID
router.get('/:orderId', async (req, res) => {
  const { orderId } = req.params;
  let connection;
  try {
    connection = await oracledb.getConnection();

    const result = await connection.execute(
      `SELECT o.order_id, o.buyer_id, u.username, o.order_date, o.total_amount
       FROM orders o
       LEFT JOIN users u ON o.buyer_id = u.user_id
       WHERE o.order_id = :orderId`,
      { orderId }
    );

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found', orderId });
    }

    const row = result.rows[0];
    res.json({
      orderId: row[0],
      buyerId: row[1],
      username: row[2] || null,
      orderDate: row[3],
      totalAmount: row[4]
    });

  } catch (err) {
    console.error('Get order error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  } finally {
    if (connection) try { await connection.close(); } catch (e) { console.error(e); }
  }
});

// Create a new order
router.post('/', async (req, res) => {
  // Accept both buyerId and userId for compatibility
  const buyerId = getBuyerIdFromBody(req.body);
  const { totalAmount } = req.body;

  if (!buyerId) {
    return res.status(400).json({ message: 'buyerId (or userId) is required' });
  }

  if (totalAmount == null) {
    return res.status(400).json({ message: 'totalAmount is required' });
  }

  let connection;
  try {
    connection = await oracledb.getConnection();

    // ORDER_DATE has DEFAULT SYSDATE at the DB level — we can omit it or explicitly use SYSDATE.
    const result = await connection.execute(
      `INSERT INTO orders (order_id, buyer_id, order_date, total_amount)
       VALUES (order_seq.NEXTVAL, :buyerId, SYSDATE, :totalAmount)
       RETURNING order_id INTO :id`,
      {
        buyerId,
        totalAmount,
        id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
      }
    );

    await connection.commit();

    res.status(201).json({
      message: 'Order created successfully',
      orderId: result.outBinds.id[0],
      buyerId,
      totalAmount
    });

  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  } finally {
    if (connection) try { await connection.close(); } catch (e) { console.error(e); }
  }
});

// Update order (only total_amount and/or order_date supported here to match schema)
router.put('/:orderId', async (req, res) => {
  const { orderId } = req.params;
  const { totalAmount, orderDate } = req.body; // orderDate optional (ISO string) if you want to override

  if (totalAmount == null && !orderDate) {
    return res.status(400).json({ message: 'Nothing to update. Provide totalAmount and/or orderDate.' });
  }

  let connection;
  try {
    connection = await oracledb.getConnection();

    // Build dynamic SET clause safely using binds
    const setClauses = [];
    const binds = { orderId };

    if (totalAmount != null) {
      setClauses.push('total_amount = :totalAmount');
      binds.totalAmount = totalAmount;
    }
    if (orderDate) {
      setClauses.push('order_date = TO_DATE(:orderDate, \'YYYY-MM-DD"T"HH24:MI:SS"Z"\')'); // expecting ISO UTC string
      binds.orderDate = orderDate;
    }

    const sql = `UPDATE orders SET ${setClauses.join(', ')} WHERE order_id = :orderId`;

    const result = await connection.execute(sql, binds);
    await connection.commit();

    if (result.rowsAffected === 0) {
      return res.status(404).json({ message: 'Order not found', orderId });
    }

    res.json({ message: 'Order updated', orderId, totalAmount, orderDate });

  } catch (err) {
    console.error('Update order error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  } finally {
    if (connection) try { await connection.close(); } catch (e) { console.error(e); }
  }
});

// Delete an order
router.delete('/:orderId', async (req, res) => {
  const { orderId } = req.params;
  let connection;
  try {
    connection = await oracledb.getConnection();

    const result = await connection.execute(
      `DELETE FROM orders WHERE order_id = :orderId`,
      { orderId }
    );

    await connection.commit();

    if (result.rowsAffected === 0) {
      return res.status(404).json({ message: 'Order not found', orderId });
    }

    res.json({ message: 'Order deleted', orderId });

  } catch (err) {
    console.error('Delete order error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  } finally {
    if (connection) try { await connection.close(); } catch (e) { console.error(e); }
  }
});

module.exports = router;
