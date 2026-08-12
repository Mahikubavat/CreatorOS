const mongoose = require('mongoose');
const { Schema } = mongoose;

const TransactionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['Income', 'Expense'], required: true },
  amount: { type: Number, required: true, min: 0 },
  category: { type: String, required: true }, // e.g., "AdSense", "Gear Upgrades"
  date: { type: Date, default: Date.now },
  description: { type: String }
}, { timestamps: true });
