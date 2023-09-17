const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');


router.post('/register', async (req, res) => {
  try {

    const { username, email, password } = req.body;

  
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }


    const hashedPassword = await bcrypt.hash(password, 10);


    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.post('/login', async (req, res) => {
  try {

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Authentication failed' });
    }


    const passwordMatch = await bcrypt.compare(password, user.password);


    if (!passwordMatch) {
      return res.status(401).json({ message: 'Authentication failed' });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      'your-secret-key',
      { expiresIn: '1h' }
    );

    res.status(200).json({ token, userId: user._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

const authMiddleware = (req, res, next) => {
  try {

    const token = req.headers.authorization.split(' ')[1];


    const decodedToken = jwt.verify(token, 'your-secret-key');

    req.userData = { userId: decodedToken.userId, email: decodedToken.email };

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Authentication failed' });
  }
};

module.exports = {
  authRoutes: router,
  authMiddleware,
};
