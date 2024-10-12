const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const router = express.Router();

// Input validation function
const validateInput = (username, password) => {
    const errors = [];
    if (!username || username.length < 3) {
        errors.push('Username must be at least 3 characters long.');
    }
    if (!password || password.length < 6) {
        errors.push('Password must be at least 6 characters long.');
    }
    return errors;
};

// Register a new user
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate input
        const errors = validateInput(username, password);
        if (errors.length > 0) {
            return res.status(400).json({ message: errors });
        }

        // Check if the username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new User({ username, password: hashedPassword });
        await user.save();
        res.status(201).send('User registered successfully');
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate input
        const errors = validateInput(username, password);
        if (errors.length > 0) {
            return res.status(400).json({ message: errors });
        }

        const user = await User.findOne({ username });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).send('Authentication failed');
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = { router };
