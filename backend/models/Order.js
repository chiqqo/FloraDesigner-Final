const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    imageUrl: { type: String, default: '' },
    quantity: { type: Number, required: true, min: 1 },
    category: { type: String, default: '' },
    itemType: { type: String, default: 'ready-made' },
    // AI-generated bouquet fields (empty string default keeps ready-made items clean)
    prompt: { type: String, default: '' },
    style: { type: String, default: '' },
    occasion: { type: String, default: '' },
    generatedDesignId: { type: String, default: '' },
    bouquetSize: { type: String, default: '' },
    wrappingStyle: { type: String, default: '' },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    deliveryDate: { type: String, required: true },
    deliveryTime: { type: String, required: true },
    paymentMethod: { type: String, required: true },
    note: { type: String, default: '' },
    items: { type: [orderItemSchema], default: [] },
    totalPrice: { type: Number, required: true, min: 0 },
    status: { type: String, default: 'Pending' },
    orderType: { type: String, default: 'ready-made' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
