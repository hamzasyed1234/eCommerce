// backend/routes/cart.js
const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');

// Get cart items for a user
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  let connection;
  try {
    connection = await oracledb.getConnection();

    const result = await connection.execute(
      `SELECT ci.cart_item_id, ci.product_id, ci.quantity, ci.selected_options,
              p.name, p.price, p.stock, u.username as seller_name
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.product_id
       JOIN users u ON p.seller_id = u.user_id
       WHERE ci.user_id = :userId`,
      [userId]
    );

    const cartItems = result.rows.map(row => ({
      id: row[0],
      productId: row[1],
      quantity: row[2],
      selectedOptions: row[3],
      productName: row[4],
      price: row[5],
      stock: row[6],
      sellerName: row[7]
    }));

    res.json(cartItems);

  } catch (err) {
    console.error('Get cart items error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Add item to cart
router.post('/', async (req, res) => {
  const { userId, productId, quantity, selectedOptions } = req.body;
  let connection;
  try {
    connection = await oracledb.getConnection();

    const result = await connection.execute(
      `INSERT INTO cart_items (cart_item_id, user_id, product_id, quantity, selected_options)
       VALUES (cart_items_seq.NEXTVAL, :userId, :productId, :quantity, :selectedOptions)
       RETURNING cart_item_id INTO :id`,
      {
        userId,
        productId,
        quantity,
        selectedOptions,
        id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
      }
    );

    await connection.commit();

    res.json({
      message: 'Item added to cart',
      cartItemId: result.outBinds.id[0],
      productId,
      quantity,
      selectedOptions
    });

  } catch (err) {
    console.error('Add cart item error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Update cart item quantity or options
router.put('/:cartItemId', async (req, res) => {
  const { cartItemId } = req.params;
  const { quantity, selectedOptions } = req.body;
  let connection;
  try {
    connection = await oracledb.getConnection();

    await connection.execute(
      `UPDATE cart_items
       SET quantity = :quantity,
           selected_options = :selectedOptions
       WHERE cart_item_id = :cartItemId`,
      { quantity, selectedOptions, cartItemId }
    );

    await connection.commit();

    res.json({ message: 'Cart item updated', cartItemId, quantity, selectedOptions });

  } catch (err) {
    console.error('Update cart item error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Remove cart item
router.delete('/:cartItemId', async (req, res) => {
  const { cartItemId } = req.params;
  let connection;
  try {
    connection = await oracledb.getConnection();

    await connection.execute(
      `DELETE FROM cart_items WHERE cart_item_id = :cartItemId`,
      [cartItemId]
    );

    await connection.commit();

    res.json({ message: 'Cart item removed', cartItemId });

  } catch (err) {
    console.error('Delete cart item error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

module.exports = router;
