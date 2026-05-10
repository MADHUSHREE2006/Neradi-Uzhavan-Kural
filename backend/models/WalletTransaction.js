import mongoose from 'mongoose';

const walletTransactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['credit', 'debit'], required: true },
    amount: { type: Number, required: true },
    description: { type: String },
    reference: { type: String }, // order ID or refund ID
    balanceAfter: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model('WalletTransaction', walletTransactionSchema);
