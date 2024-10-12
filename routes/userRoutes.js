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

// User registration route
router.post('/register', async (req, res) => {
    try {
        const { username, password, email } = req.body;

        // Validate input
        const errors = validateInput(username, password);
        if (errors.length > 0) {
            return res.status(400).json({ message: errors });
        }

        // Check if the username or email already exists
        const existingUser = await User.findOne({ username });
        const existingEmail = await User.findOne({ email });
        if (existingUser || existingEmail) {
            return res.status(400).json({ message: 'Username or email already exists.' });
        }

        // Create a new user
        const user = new User({ username, password, email });
        await user.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error during registration' });
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

        // Find the user by username
        const user = await User.findOne({ username });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token, message: 'Login successful' });
    } catch (error) {
        res.status(500).json({ message: 'Server error during login' });
    }
});

// Password reset route
router.post('/reset-password', async (req, res) => {
    const { username, newPassword } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.password = newPassword;
        await user.save();
        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error during password reset' });
    }
});

// Profile update route
router.put('/update-profile', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { email, bio, profilePicture } = req.body;

        // Update the profile with valid inputs
        if (email) user.email = email;
        if (bio) user.bio = bio;
        if (profilePicture) user.profilePicture = profilePicture;

        await user.save();
        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error during profile update' });
    }
});

// Route to fetch user profile data
router.get('/profile', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            username: user.username,
            email: user.email,
            bio: user.bio,
            profilePicture: user.profilePicture,
            images: user.images || []
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error during profile fetch' });
    }
});

// Middleware to protect routes
const authenticate = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Access denied, no token provided' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(400).json({ message: 'Invalid token' });
    }
};

module.exports = { router, authenticate };
