const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  contentNiche: { type: String, required: true },
  displayName: { type: String, trim: true },
  bio: { type: String, maxLength: 500 },
  profilePicture: { type: String, default: '' },
  socialMediaLinks: {
    youtube: { type: String, default: '' },
    tiktok: { type: String, default: '' },
    instagram: { type: String, default: '' },
    blog: { type: String, default: '' }
  },
  preferredBaseCurrency: { type: String, default: 'USD' }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);