const express = require('express');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const port = 5000;

// Middleware
app.use(express.json());
app.use(cors());

// File storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
}).single('file');

// Authentication middleware (JWT)
const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(403).send('Access Denied');
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).send('Invalid Token');
    req.user = user;
    next();
  });
};

// File upload route
app.post('/upload', authenticateToken, upload, (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded.');
  
  // You can store metadata in a database if needed
  res.json({ message: 'File uploaded successfully', file: req.file });
});

// Authentication route (to generate JWT for users)
app.post('/login', (req, res) => {
  const username = req.body.username;
  const user = { name: username };
  const token = jwt.sign(user, process.env.JWT_SECRET);
  res.json({ token });
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
