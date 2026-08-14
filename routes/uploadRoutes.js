const express = require('express');
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();
const upload = multer({ storage: storage });

router.post('/upload-proof', verifyToken, upload.single('photo'), async (req, res) => {
  try {
    res.status(200).json({ message: 'Upload successful', imageUrl: req.file.path });
  } catch (err) {
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
});

module.exports = router;