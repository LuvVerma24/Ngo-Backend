const express = require('express');
const Area = require('../models/Area');
const User = require('../models/User');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

const router = express.Router();

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

router.get('/volunteers', verifyToken, checkRole('manager'), async (req, res) => {
  try {
    const volunteers = await User.find({ role: 'volunteer' }).select('name email');
    res.status(200).json({ volunteers });
  } catch (err) {
    res.status(500).json({ message: 'Error', error: err.message });
  }
});

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

router.put('/areas/:id/visit', verifyToken, checkRole('volunteer'), async (req, res) => {
  try {
    const area = await Area.findById(req.params.id);
    if (area.assignedTo.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'This area is not assigned to you' });
    }
    const { oldPeopleCount } = req.body;
    area.oldPeopleCount = oldPeopleCount;
    area.lastVisitedDate = new Date();
    await area.save();
    res.status(200).json({ message: 'Visit submitted', area });
  } catch (err) {
    res.status(500).json({ message: 'Error', error: err.message });
  }
});

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
cd path\to\ngo
git init
git add .
git commit -m "Initial NGO backend commit"
git branch -M main
git remote add origin https://github.com/LuvVerma24/Ngo-Backend
git push -u origin main