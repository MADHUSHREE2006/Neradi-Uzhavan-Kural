import mongoose from 'mongoose';

const stockByPinSchema = new mongoose.Schema({
  pinCode: { type: String, required: true },
  quantity: { type: Number, required: true, default: 0 },
});

const productSchema = new mongoose.Schema(
  {
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    price: { type: Number, required: true },
    unit: { type: String, default: 'kg' }, // kg, piece, litre, etc.
    images: [{ type: String }],
    // Location-based stock (India PIN codes)
    stockByPin: [stockByPinSchema],
    totalStock: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    // Ratings
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Full-text search index
productSchema.index({ name: 'text', description: 'text' });

export default mongoose.model('Product', productSchema);
