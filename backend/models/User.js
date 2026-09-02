<<<<<<< HEAD
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

=======
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

>>>>>>> 36f0ca9d4ee803daab395736d0e8470b32ab600f
module.exports = mongoose.models.User || mongoose.model('User', UserSchema);