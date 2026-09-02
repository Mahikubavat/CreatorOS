<<<<<<< HEAD
const mongoose = require('mongoose');
const { Schema } = mongoose;

const TimeBlockSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  label: { type: String, required: true, trim: true },
  startTime: { type: String, required: true }, // Format: "HH:mm" (e.g., "09:00")
  endTime: { type: String, required: true },   // Format: "HH:mm" (e.g., "11:00")
  date: { type: Date, required: true }         // Date to apply the block
}, { timestamps: true });

=======
const mongoose = require('mongoose');
const { Schema } = mongoose;

const TimeBlockSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  label: { type: String, required: true, trim: true },
  startTime: { type: String, required: true }, // Format: "HH:mm" (e.g., "09:00")
  endTime: { type: String, required: true },   // Format: "HH:mm" (e.g., "11:00")
  date: { type: Date, required: true }         // Date to apply the block
}, { timestamps: true });

>>>>>>> 36f0ca9d4ee803daab395736d0e8470b32ab600f
module.exports = mongoose.models.TimeBlock || mongoose.model('TimeBlock', TimeBlockSchema);