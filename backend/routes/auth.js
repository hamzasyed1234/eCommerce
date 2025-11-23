// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authenticateToken = require('../middleware/auth');

// Sign Up
router.post('/signup', async (req, res) => {
  const { username, password } = req.body;

  let connection;
  try {
    connection = await oracledb.getConnection();

    // Check if username exists
    const checkUser = await connection.execute(
      `SELECT user_id FROM users WHERE username = :username`,
      [username]
    );

    if (checkUser.rows.length > 0) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user and return values
    const result = await connection.execute(
      `INSERT INTO users (user_id, username, password, balance)
       VALUES (user_seq.NEXTVAL, :username, :password, 2000)
       RETURNING user_id, username, balance INTO :idOut, :usernameOut, :balanceOut`,
      {
        username,
        password: hashedPassword,
        idOut: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        usernameOut: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 50 },
        balanceOut: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      }
    );

    await connection.commit();

    const token = jwt.sign(
      { userId: result.outBinds.idOut[0] },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: result.outBinds.idOut[0],
        username: result.outBinds.usernameOut[0],
        balance: result.outBinds.balanceOut[0]
      }
    });

  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  let connection;
  try {
    connection = await oracledb.getConnection();

    const result = await connection.execute(
      `SELECT user_id, username, password, balance FROM users WHERE username = :username`,
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user[2]);

    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user[0] },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user[0],
        username: user[1],
        balance: user[3]
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Get current user balance
router.get('/balance', authenticateToken, async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();

    const result = await connection.execute(
      `SELECT balance FROM users WHERE user_id = :userId`,
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ balance: result.rows[0][0] });

  } catch (err) {
    console.error('Balance fetch error:', err);
    res.status(500).json({ message: 'Server error' });
  } finally {
    if (connection) await connection.close();
  }
});

module.exports = router;
