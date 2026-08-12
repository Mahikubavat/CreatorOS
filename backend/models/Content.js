const mongoose = require('mongoose');
const { Schema } = mongoose;

const ContentSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true },
  platform: { 
    type: String, 
    enum: ['YouTube', 'TikTok', 'Blog', 'Instagram', 'Other'], 
    required: true 
  },
  description: { type: String },
  stage: { 
    type: String, 
    enum: ['Idea', 'Scripting', 'Editing', 'Scheduled', 'Published'], 
    default: 'Idea' 
  },
  publishDate: { type: Date } // Null if unscheduled
}, { timestamps: true });
