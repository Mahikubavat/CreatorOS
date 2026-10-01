const mongoose = require('mongoose');
const { Schema } = mongoose;

const TaskSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true },
  dueDate: { type: Date },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  status: { type: String, enum: ['Active', 'Completed'], default: 'Active' },
  completedAt: { type: Date, default: null },
  contentId: { type: Schema.Types.ObjectId, ref: 'Content', default: null } // Optional content link
}, { timestamps: true });

module.exports = mongoose.models.Task || mongoose.model('Task', TaskSchema);