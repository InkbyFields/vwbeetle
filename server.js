require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const formidable = require('formidable');
const path = require('path');
const fs = require('fs');
const { S3 } = require('aws-sdk');
const { router: userRoutes } = require('./routes/userRoutes');

const app = express();
const s3 = new S3();

// Middleware setup
app.use(express.json());
app.use(helmet());
app.use(cors({
  origin: 'https://vwbeetle.vercel.app', // Adjust based on your frontend URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Authorization', 'Content-Type'],
}));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
}));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI).then(() => {
  console.log('MongoDB connected successfully');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});

// AWS S3 configuration for image uploads
const uploadToS3 = (file) => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET, // Your S3 bucket name
    Key: `uploads/${file.newFilename}`, // Folder and file name
    Body: fs.createReadStream(file.filepath),
    ContentType: file.mimetype,
    ACL: 'public-read', // Make the file publicly accessible
  };

  return s3.upload(params).promise();
};

// File Upload Route using AWS S3 for scalable storage
app.post('/upload', (req, res) => {
  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('File upload error:', err);
      return res.status(500).json({ message: 'File upload error', error: err });
    }

    try {
      const uploadedFiles = await Promise.all(
        Object.values(files).map(file => uploadToS3(file))
      );

      const fileURLs = uploadedFiles.map(file => file.Location); // Get the S3 file URLs
      res.status(201).json({ message: 'Files uploaded successfully', files: fileURLs });
    } catch (uploadErr) {
      console.error('S3 upload error:', uploadErr);
      return res.status(500).json({ message: 'Failed to upload to S3', error: uploadErr });
    }
  });
});

// Delete an image from AWS S3
app.delete('/upload/:imageName', (req, res) => {
  const imageName = req.params.imageName;

  const params = {
    Bucket: process.env.AWS_S3_BUCKET, // Your S3 bucket name
    Key: `uploads/${imageName}`,
  };

  s3.deleteObject(params, (err) => {
    if (err) {
      console.error('Failed to delete image:', err);
      return res.status(500).json({ message: 'Failed to delete image', error: err });
    }
    res.status(200).json({ message: 'Image deleted successfully' });
  });
});

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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


