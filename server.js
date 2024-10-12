require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const formidable = require('formidable'); // For file uploads
const path = require('path');
const fs = require('fs'); // For deleting files
const { router: userRoutes } = require('./routes/userRoutes');

const app = express();

// CORS setup to allow requests from your frontend on Vercel
app.use(cors({
    origin: 'https://vwbeetle.vercel.app', // Frontend URL
    methods: ['GET', 'POST', 'DELETE', 'PUT'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Middleware
app.use(express.json());
app.use(helmet());

// Serve static files (e.g., uploaded images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch((err) => console.error('MongoDB connection error:', err));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// File Upload Route
app.post('/upload', (req, res) => {
    const form = new formidable.IncomingForm({
        uploadDir: uploadsDir,
        keepExtensions: true,
    });

    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(500).json({ message: 'File upload error', error: err });
        }

        const uploadedFiles = Object.values(files).map(file => file.newFilename);
        res.status(201).json({
            message: 'Files uploaded successfully',
            files: uploadedFiles,
        });
    });
});

// Logbook Entry Route
app.post('/api/users/logbook', (req, res) => {
    const { entry } = req.body;

    if (!entry) {
        return res.status(400).json({ message: 'Log entry cannot be empty' });
    }

    // Save the log entry to the database (if needed)
    res.status(201).json({ message: 'Log entry added successfully', entry });
});

// Basic route for root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Delete Image Route
app.delete('/upload/:filename', (req, res) => {
    const filename = req.params.filename;
    const filepath = path.join(uploadsDir, filename);

    fs.unlink(filepath, (err) => {
        if (err) {
            return res.status(500).json({ message: 'Error deleting file', error: err });
        }
        res.status(200).json({ message: 'File deleted successfully' });
    });
});

// Integrate user authentication routes
app.use('/api/users', userRoutes);

// Listen on port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
