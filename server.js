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

// Define the uploads directory
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Middleware
app.use(express.json());
app.use(helmet());
app.use(cors({
  origin: 'https://vwbeetle.vercel.app',  // Allow requests from your Vercel frontend
  credentials: true,
  methods: ['GET', 'POST', 'DELETE'],  // Allowed methods
  allowedHeaders: ['Content-Type', 'Authorization'],  // Allow necessary headers
}));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,
}));

// Serve static files (images) from the uploads directory
app.use('/uploads', express.static(uploadDir));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI).then(() => {
  console.log('MongoDB connected successfully');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});

// File Upload Route
app.post('/upload', (req, res) => {
  const form = new formidable.IncomingForm({
    uploadDir: uploadDir,
    keepExtensions: true,
  });

  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(500).json({ message: 'File upload error', error: err });
    }
    const uploadedFiles = Object.values(files).map(file => path.basename(file.filepath));
    res.status(201).json({
      message: 'Files uploaded successfully',
      files: uploadedFiles,
    });
  });
});

// Route to delete an image
app.delete('/upload/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadDir, filename);

  fs.unlink(filePath, (err) => {
    if (err) {
      return res.status(500).json({ message: 'File deletion error', error: err });
    }
    res.status(200).json({ message: 'File deleted successfully' });
  });
});

// Basic route for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Integrate the user authentication routes
app.use('/api/users', userRoutes);

// Listen on port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
