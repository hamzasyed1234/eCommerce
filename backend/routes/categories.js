// backend/routes/categories.js
const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');

// Get all product categories
router.get('/', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();

    const result = await connection.execute(
      `SELECT CATEGORY_ID, CATEGORY_NAME
       FROM product_categories
       ORDER BY CATEGORY_NAME`
    );

    const categories = result.rows.map(row => ({
      CATEGORY_ID: row[0],
      CATEGORY_NAME: row[1]
    }));

    res.json(categories);

  } catch (err) {
    console.error('Get categories error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Create a new category
router.post('/', async (req, res) => {
  const { CATEGORY_NAME } = req.body; // Match your table column
  let connection;
  try {
    connection = await oracledb.getConnection();

    const result = await connection.execute(
      `INSERT INTO product_categories (CATEGORY_ID, CATEGORY_NAME)
       VALUES (category_seq.NEXTVAL, :CATEGORY_NAME)
       RETURNING CATEGORY_ID INTO :id`,
      {
        CATEGORY_NAME,
        id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
      }
    );

    await connection.commit();

    res.json({
      message: 'Category created successfully',
      CATEGORY_ID: result.outBinds.id[0],
      CATEGORY_NAME
    });

  } catch (err) {
    console.error('Create category error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Update category
router.put('/:CATEGORY_ID', async (req, res) => {
  const { CATEGORY_ID } = req.params;
  const { CATEGORY_NAME } = req.body;
  let connection;
  try {
    connection = await oracledb.getConnection();

    await connection.execute(
      `UPDATE product_categories
       SET CATEGORY_NAME = :CATEGORY_NAME
       WHERE CATEGORY_ID = :CATEGORY_ID`,
      { CATEGORY_NAME, CATEGORY_ID }
    );

    await connection.commit();

    res.json({ message: 'Category updated successfully', CATEGORY_ID, CATEGORY_NAME });

  } catch (err) {
    console.error('Update category error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Delete category
router.delete('/:CATEGORY_ID', async (req, res) => {
  const { CATEGORY_ID } = req.params;
  let connection;
  try {
    connection = await oracledb.getConnection();

    await connection.execute(
      `DELETE FROM product_categories WHERE CATEGORY_ID = :CATEGORY_ID`,
      [CATEGORY_ID]
    );

    await connection.commit();

    res.json({ message: 'Category deleted successfully', CATEGORY_ID });

  } catch (err) {
    console.error('Delete category error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

module.exports = router;
