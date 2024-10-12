require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const formidable = require('formidable');
const path = require('path');
const fs = require('fs');
const { router: userRoutes } = require('./routes/userRoutes');

const app = express();

// Serve static files from the uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware
app.use(express.json());
app.use(helmet());

// CORS setup
app.use(cors({
    origin: 'https://vwbeetle.vercel.app',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Authorization', 'Content-Type'],
}));

app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
}));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('MongoDB connected successfully');
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
    });

// Create the uploads folder if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('Created uploads directory');
}

// File Upload Route
app.post('/upload', (req, res) => {
    const form = new formidable.IncomingForm({
        uploadDir: uploadDir,
        keepExtensions: true,
    });

    form.parse(req, (err, fields, files) => {
        if (err) {
            console.error('File upload error:', err);
            return res.status(500).json({ message: 'File upload error', error: err });
        }
        const uploadedFiles = Object.values(files).map(file => file.newFilename);
        res.status(201).json({
            message: 'Files uploaded successfully',
            files: uploadedFiles,
        });
    });
});

// Delete an image
app.delete('/upload/:imageName', (req, res) => {
    const imageName = req.params.imageName;
    const filePath = path.join(uploadDir, imageName);

    fs.unlink(filePath, (err) => {
        if (err) {
            console.error('Failed to delete image:', err);
            return res.status(500).json({ message: 'Failed to delete image', error: err });
        }
        res.status(200).json({ message: 'Image deleted successfully' });
    });
});

// Basic route for root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));  // Serve the homepage
});

// Integrate the user authentication routes
app.use('/api/users', userRoutes);

// Listen on port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

