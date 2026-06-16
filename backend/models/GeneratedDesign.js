const mongoose = require('mongoose');

const generatedDesignSchema = new mongoose.Schema(
  {
    prompt: { type: String, required: true },
    generatedImages: { type: [String], default: [] },
    selectedImageUrl: { type: String, default: '' },
    style: { type: String, default: '' },
    occasion: { type: String, default: '' },
    preferredFlowers: { type: [String], default: [] },
    preferredColors: { type: [String], default: [] },
    bouquetSize: { type: String, default: '' },
    wrappingStyle: { type: String, default: '' },
    estimatedPrice: { type: Number, default: 0 },
    orderType: { type: String, default: 'AI-generated bouquet' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('GeneratedDesign', generatedDesignSchema);
