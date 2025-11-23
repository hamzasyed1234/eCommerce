// backend/routes/categories.js
const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');

// Get all categories
router.get('/', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();

    const result = await connection.execute(
      `SELECT category_id, name, description
       FROM categories
       ORDER BY name`
    );

    const categories = result.rows.map(row => ({
      id: row[0],
      name: row[1],
      description: row[2]
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
  const { name, description } = req.body;
  let connection;
  try {
    connection = await oracledb.getConnection();

    const result = await connection.execute(
      `INSERT INTO categories (category_id, name, description)
       VALUES (category_seq.NEXTVAL, :name, :description)
       RETURNING category_id INTO :id`,
      {
        name,
        description,
        id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
      }
    );

    await connection.commit();

    res.json({
      message: 'Category created successfully',
      categoryId: result.outBinds.id[0],
      name,
      description
    });

  } catch (err) {
    console.error('Create category error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Update category
router.put('/:categoryId', async (req, res) => {
  const { categoryId } = req.params;
  const { name, description } = req.body;
  let connection;
  try {
    connection = await oracledb.getConnection();

    await connection.execute(
      `UPDATE categories
       SET name = :name, description = :description
       WHERE category_id = :categoryId`,
      { name, description, categoryId }
    );

    await connection.commit();

    res.json({ message: 'Category updated successfully', categoryId, name, description });

  } catch (err) {
    console.error('Update category error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Delete category
router.delete('/:categoryId', async (req, res) => {
  const { categoryId } = req.params;
  let connection;
  try {
    connection = await oracledb.getConnection();

    await connection.execute(
      `DELETE FROM categories WHERE category_id = :categoryId`,
      [categoryId]
    );

    await connection.commit();

    res.json({ message: 'Category deleted successfully', categoryId });

  } catch (err) {
    console.error('Delete category error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

module.exports = router;
