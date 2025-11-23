// backend/routes/reviews.js
const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');

// Get all reviews for a product
router.get('/product/:productId', async (req, res) => {
  const { productId } = req.params;
  let connection;
  try {
    connection = await oracledb.getConnection();

    const result = await connection.execute(
      `SELECT r.review_id, r.user_id, u.username, r.product_id, r.rating, r.comment, r.created_at
       FROM reviews r
       JOIN users u ON r.user_id = u.user_id
       WHERE r.product_id = :productId
       ORDER BY r.created_at DESC`,
      [productId]
    );

    const reviews = result.rows.map(row => ({
      reviewId: row[0],
      userId: row[1],
      username: row[2],
      productId: row[3],
      rating: row[4],
      comment: row[5],
      createdAt: row[6]
    }));

    res.json(reviews);

  } catch (err) {
    console.error('Get reviews error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Add a review for a product
router.post('/', async (req, res) => {
  const { userId, productId, rating, comment } = req.body;
  let connection;
  try {
    connection = await oracledb.getConnection();

    const result = await connection.execute(
      `INSERT INTO reviews (review_id, user_id, product_id, rating, comment, created_at)
       VALUES (review_seq.NEXTVAL, :userId, :productId, :rating, :comment, SYSDATE)
       RETURNING review_id INTO :id`,
      {
        userId,
        productId,
        rating,
        comment,
        id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
      }
    );

    await connection.commit();

    res.json({
      message: 'Review added successfully',
      reviewId: result.outBinds.id[0],
      userId,
      productId,
      rating,
      comment
    });

  } catch (err) {
    console.error('Add review error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Update a review
router.put('/:reviewId', async (req, res) => {
  const { reviewId } = req.params;
  const { rating, comment } = req.body;
  let connection;
  try {
    connection = await oracledb.getConnection();

    await connection.execute(
      `UPDATE reviews
       SET rating = :rating, comment = :comment
       WHERE review_id = :reviewId`,
      { rating, comment, reviewId }
    );

    await connection.commit();

    res.json({ message: 'Review updated', reviewId, rating, comment });

  } catch (err) {
    console.error('Update review error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Delete a review
router.delete('/:reviewId', async (req, res) => {
  const { reviewId } = req.params;
  let connection;
  try {
    connection = await oracledb.getConnection();

    await connection.execute(
      `DELETE FROM reviews WHERE review_id = :reviewId`,
      [reviewId]
    );

    await connection.commit();

    res.json({ message: 'Review deleted', reviewId });

  } catch (err) {
    console.error('Delete review error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

module.exports = router;
