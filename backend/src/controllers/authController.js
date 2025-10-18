const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database'); // add this line


const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';
const JWT_EXPIRES = '1h'; // token expires in 1 hour

const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { Op } = require('sequelize'); // for expiry check

 function createTransporter() {
  // env fallback sensible defaults
  const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const port = process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT, 10) : 465;
  const secure = typeof process.env.EMAIL_SECURE !== 'undefined'
    ? process.env.EMAIL_SECURE === 'true'
    : (port === 465);

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    // still create, but will fail verify; we log later
    console.warn('EMAIL_USER or EMAIL_PASS is not set in env; email sending will fail.');
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
}

exports.signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required' });
    }

   
    // check if email already exists
    console.log('DB check: sequelize is connected?', sequelize ? true : false);

    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    // let User model hook hash the password
    const user = await User.create({ username, email, password });

    // generate JWT
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    return res.status(201).json({
      message: 'User created',
      token,
      user: { id: user.id, username: user.username, email: user.email }
    });

  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};


exports.login = async (req, res) => {
  try {
    console.log('--- LOGIN REQUEST ---');
    console.log('Body:', req.body);

    const { email, password } = req.body;
    if (!email || !password) {
      console.warn('Login validation failed: missing email or password');
      return res.status(400).json({ message: 'Email and password are required.' });
    }
    console.log('DB check: sequelize is connected?', sequelize ? true : false);

    const user = await User.findOne({ where: { email } });
    console.log('DB user found:', !!user);
    if (!user) {
      console.log('No user for email:', email);
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    // Log stored password hash (DEBUG ONLY — remove after fixing)
    console.log('Stored hash (first 60 chars):', typeof user.password === 'string' ? user.password.slice(0, 60) + (user.password.length>60?'...':'') : user.password);

    // Compare password with bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('bcrypt.compare result:', isMatch);

    if (!isMatch) {
      // extra info for debugging (DO NOT leak in production)
      console.warn('Password mismatch for user id=', user.id);
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    console.log('Login successful for user id=', user.id);
    return res.json({ token, user: { id: user.id, username: user.username || user.name, email: user.email } });
  } catch (err) {
    console.error('Login exception:', err && err.stack ? err.stack : err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


// Forgot Password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ where: { email } });
    // always respond with the same message to avoid leaking user existence
    const genericMsg = 'If that email is registered, you will receive a password reset link.';

    if (!user) {
      // do not reveal existence
      return res.json({ message: genericMsg });
    }

    // generate token (hex)
    const token = crypto.randomBytes(32).toString('hex');

    // Save token + expiry on user
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // build reset link using frontend url
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:4200'}/reset-password/${token}`;

    const transporter = createTransporter();

    // verify transporter connectivity/auth before attempting send
    try {
      await transporter.verify();
    } catch (verifyErr) {
      console.error('Nodemailer verify failed:', verifyErr && verifyErr.message ? verifyErr.message : verifyErr);
      // For safety: don't delete token, but inform admin-level error
      return res.status(500).json({ message: 'Email service not available. Please try again later.' });
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <p>You requested a password reset.</p>
        <p>Click the link below to reset your password (valid 1 hour):</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>If you did not request this, please ignore this email.</p>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      return res.json({ message: genericMsg });
    } catch (sendErr) {
      console.error('sendMail error', sendErr && sendErr.message ? sendErr.message : sendErr);
      // We don't want to leak token or user state to client; report generic message
      return res.status(500).json({ message: 'Failed to send reset email. Please try again later.' });
    }
  } catch (err) {
    console.error('forgotPassword error', err && err.stack ? err.stack : err);
    return res.status(500).json({ message: 'Server error' });
  }
};
// POST /api/auth/reset-password
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ message: 'Token and new password are required' });

    // Find user with token and not expired
    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { [Op.gt]: new Date() } // expiry in future
      }
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    // Use model hooks to hash (we assume model will hash on update)
    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return res.json({ message: 'Password has been reset successfully' });
  } catch (err) {
    console.error('resetPassword error', err);
    return res.status(500).json({ message: 'Server error resetting password' });
  }
};

// Middleware to protect routes
exports.authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Authorization header missing' });

  const token = authHeader.split(' ')[1]; // Bearer token
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Invalid token' });
    req.user = decoded;
    next();
  });
};
