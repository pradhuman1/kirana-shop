import mongoose from "mongoose";

const shopOrderSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Business",
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'fulfilled'],
    default: 'pending',
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    quantity: {
      type: Number,
      required: true
    }
  }],
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true
  },
}, {
  timestamps: true // auto-manages createdAt and updatedAt
});

const ShopOrder = mongoose.model("ShopOrder", shopOrderSchema);

export default ShopOrder;