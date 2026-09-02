const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcryptjs');

const UserSchema = new Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  contentNiche: { type: String, required: true },
  displayName: String,
  bio: String,
  profilePicture: String,
  socialMediaLinks: { youtube: String, tiktok: String, instagram: String, blog: String },
  preferredBaseCurrency: { type: String, default: 'USD' }
}, { timestamps: true });

// Hash password before saving to DB
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare entered password with hashed password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);