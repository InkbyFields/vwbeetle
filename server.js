require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const formidable = require('formidable');
const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk'); // Import AWS SDK
const { router: userRoutes } = require('./routes/userRoutes');

const app = express();

// Middleware
app.use(express.json());
app.use(helmet());
app.use(cors({
  origin: 'https://vwbeetle.vercel.app', // Allow requests from your Vercel frontend
  credentials: true
}));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI).then(() => {
  console.log('MongoDB connected successfully');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});

// AWS S3 Configuration
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

// File Upload Route to S3
app.post('/upload', (req, res) => {
  const form = new formidable.IncomingForm();

  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error('Error during file parsing:', err);
      return res.status(500).json({ message: 'File upload error', error: err });
    }

    if (!files || Object.keys(files).length === 0) {
      return res.status(400).json({ message: 'No files were uploaded.' });
    }

    const file = files.images;
    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `${Date.now()}_${file.originalFilename}`,
      Body: fs.createReadStream(file.filepath),
      ContentType: file.mimetype
    };

    s3.upload(uploadParams, (s3Err, data) => {
      if (s3Err) {
        console.error('Error uploading to S3:', s3Err);
        return res.status(500).json({ message: 'S3 upload error', error: s3Err });
      }

      res.status(201).json({
        message: 'Files uploaded successfully',
        fileUrl: data.Location
      });
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

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

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

