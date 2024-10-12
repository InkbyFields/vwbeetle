require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const formidable = require('formidable');
const path = require('path');
const fs = require('fs'); // Added to ensure folder creation
const { router: userRoutes } = require('./routes/userRoutes');

const app = express();

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Middleware
app.use(express.json());
app.use(helmet());
app.use(cors({
  origin: 'https://vwbeetle.vercel.app',  // Adjusted to allow requests from your frontend
  credentials: true,
}));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,
}));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI).then(() => {
  console.log('MongoDB connected successfully');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});

// Ensure the uploads folder exists
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
      console.error('File upload error:', err); // Log the error
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

  res.status(201).json({ message: 'Log entry added successfully', entry });
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

