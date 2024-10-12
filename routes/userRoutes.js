const express = require('express');
const jwt = require('jsonwebtoken');
const formidable = require('formidable');
const path = require('path');
const User = require('../models/user');
const router = express.Router();

// Middleware to authenticate users
const authenticate = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).send('Access denied');
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(400).send('Invalid token');
    }
};

// Register a new user
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = new User({ username, password });
        await user.save();
        res.status(201).send('User registered successfully');
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).send('Authentication failed');
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get user profile
router.get('/profile', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).send('User not found');
        res.json({
            username: user.username,
            profilePicture: user.profilePicture,
            images: user.images,
            logbook: user.logbook
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Upload images
router.post('/upload', authenticate, (req, res) => {
    const form = new formidable.IncomingForm({
        uploadDir: path.join(__dirname, '../uploads'),
        keepExtensions: true
    });

    form.parse(req, async (err, fields, files) => {
        if (err) {
            return res.status(500).json({ message: 'File upload error', error: err });
        }
        const uploadedFiles = Object.values(files).map(file => file.newFilename);
        try {
            const user = await User.findById(req.user.userId);
            user.images.push(...uploadedFiles);
            await user.save();
            res.status(201).json({ message: 'Files uploaded successfully', files: uploadedFiles });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });
});

// Add logbook entry
router.post('/logbook', authenticate, async (req, res) => {
    const { entry } = req.body;
    if (!entry) {
        return res.status(400).json({ message: 'Log entry cannot be empty' });
    }

    try {
        const user = await User.findById(req.user.userId);
        user.logbook.push({ entry });
        await user.save();
        res.status(201).json({ message: 'Log entry added successfully', logbook: user.logbook });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = { router, authenticate };
