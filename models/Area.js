const mongoose = require('mongoose');

const areaSchema = new mongoose.Schema({
  address: { type: String, required: true },
  oldPeopleCount: { type: Number, default: null },
  lastVisitedDate: { type: Date, default: null },
  visitProofPhoto: { type: String, default: null },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true });

module.exports = mongoose.model('Area', areaSchema);