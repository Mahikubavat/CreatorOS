const mongoose = require('mongoose');
const { Schema } = mongoose;

const SponsorshipSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  brandName: { type: String, required: true, trim: true },
  dealValue: { type: Number, required: true, min: 0 },
  deliverables: [{ type: String }],
  contractStatus: { 
    type: String, 
    enum: ['Lead', 'Negotiating', 'Contract Signed', 'Completed', 'Cancelled'], 
    default: 'Lead' 
  },
  invoiceStatus: { 
    type: String, 
    enum: ['Pending', 'Invoiced', 'Paid', 'Overdue'], 
    default: 'Pending' 
  },
  dueDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.models.Sponsorship || mongoose.model('Sponsorship', SponsorshipSchema);