const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true },
    colors: { type: [String], default: [] },
    flowers: { type: [String], default: [] },
    size: { type: String, default: '' },
    occasion: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    available: { type: Boolean, default: true },
    deliveryInfo: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
