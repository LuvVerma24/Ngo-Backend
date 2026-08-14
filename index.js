require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const uploadRoutes = require('./routes/uploadRoutes');
const authRoutes = require('./routes/authRoutes');
const areaRoutes = require('./routes/areaRoutes');

const app = express();
app.use(express.json());
app.use(cors());

app.use('/api', uploadRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', areaRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB error:', err));

app.listen(process.env.PORT || 5000, () => console.log('Server running'));