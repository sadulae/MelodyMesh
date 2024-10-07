const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS  // Your email password or app password
  }
});

// Sign Up
router.post('/signup',
  [
    body('firstName').not().isEmpty().withMessage('First name is required'),
    body('lastName').not().isEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('dob').not().isEmpty().withMessage('Date of birth is required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, password, dob } = req.body;

    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).send('User already exists');
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        dob: new Date(dob), // Ensure dob is stored as a Date object
        isAdmin: false // default to regular user
      });

      await newUser.save();
      res.status(201).send('User created');
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).send('Server error');
    }
  }
);

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send('User not found');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send('Invalid credentials');
    }

    // Log the user data to ensure isAdmin is available
    console.log('User:', user);
    

    // Include firstName and isAdmin in the token payload
    const token = jwt.sign(
      { id: user._id, firstName: user.firstName, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }

    );

    console.log('Generated Token:', token);

    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).send('Server error');
  }
});


// Forgot Password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send('User with this email does not exist.');
    }

    const token = crypto.randomBytes(32).toString('hex');
    user.resetToken = token;
    user.resetTokenExpiration = Date.now() + 3600000; // 1 hour expiration
    await user.save();

    const resetURL = `http://localhost:3000/reset-password/${token}`;
    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: 'Password Reset',
      text: `You requested a password reset. Click the following link to reset your password: ${resetURL}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        return res.status(500).send('Error sending email.');
      }
      res.send('Password reset email sent.');
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).send('Server error.');
  }
});

// Reset Password
router.post('/reset-password/:token',
  [
    body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
  ],
  async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findOne({
        resetToken: token,
        resetTokenExpiration: { $gt: Date.now() } // Check if the token has not expired
      });

      if (!user) {
        return res.status(400).send('Invalid or expired token.');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      user.resetToken = undefined;
      user.resetTokenExpiration = undefined;
      await user.save();

      res.send('Password has been reset.');
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).send('Server error.');
    }
  }
);


module.exports = router;
