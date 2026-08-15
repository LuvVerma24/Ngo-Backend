const express = require('express');
const multer = require('multer');
const Area = require('../models/Area');
const User = require('../models/User');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');
const { storage } = require('../config/cloudinary');

const router = express.Router();
const upload = multer({ storage: storage });

// 1. CREATE AREA — manager only
router.post('/areas', verifyToken, checkRole('manager'), async (req, res) => {
  try {
    const { address } = req.body;
    const newArea = new Area({ address });
    await newArea.save();
    res.status(201).json({ message: 'Area created', area: newArea });
  } catch (err) {
    res.status(500).json({ message: 'Error', error: err.message });
  }
});

// 2. GET LIST OF VOLUNTEERS — manager only (for the assignment dropdown)
router.get('/volunteers', verifyToken, checkRole('manager'), async (req, res) => {
  try {
    const volunteers = await User.find({ role: 'volunteer' }).select('name email');
    res.status(200).json({ volunteers });
  } catch (err) {
    res.status(500).json({ message: 'Error', error: err.message });
  }
});

// 3. ASSIGN VOLUNTEER TO AREA — manager only
router.put('/areas/:id/assign', verifyToken, checkRole('manager'), async (req, res) => {
  try {
    const { volunteerId } = req.body;
    const area = await Area.findByIdAndUpdate(
      req.params.id,
      { assignedTo: volunteerId },
      { new: true }
    );
    res.status(200).json({ message: 'Volunteer assigned', area });
  } catch (err) {
    res.status(500).json({ message: 'Error', error: err.message });
  }
});

// 4. SUBMIT VISIT — volunteer only, and only for THEIR assigned area
// upload.single('photo') is wrapped manually so we can catch its errors (e.g. bad file type)
router.put('/areas/:id/visit', verifyToken, checkRole('volunteer'), (req, res, next) => {
  upload.single('photo')(req, res, (err) => {
    if (err) {
      console.error('Upload error:', err.message);
      return res.status(400).json({ message: 'Photo upload failed', error: err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    const area = await Area.findById(req.params.id);

    if (area.assignedTo.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'This area is not assigned to you' });
    }

    const { oldPeopleCount } = req.body;
    area.oldPeopleCount = oldPeopleCount;
    area.lastVisitedDate = new Date();

    if (req.file) {
      area.visitProofPhoto = req.file.path;
    }

    await area.save();

    res.status(200).json({ message: 'Visit submitted', area });
  } catch (err) {
    res.status(500).json({ message: 'Error', error: err.message });
  }
});

// 5. GET AREAS — behavior depends on role
router.get('/areas', verifyToken, async (req, res) => {
  try {
    let areas;
    if (req.user.role === 'manager') {
      areas = await Area.find().populate('assignedTo', 'name email');
    } else {
      areas = await Area.find({ assignedTo: req.user.userId });
    }
    res.status(200).json({ areas });
  } catch (err) {
    res.status(500).json({ message: 'Error', error: err.message });
  }
});

module.exports = router;