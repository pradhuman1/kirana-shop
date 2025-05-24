import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer", // Update if your customer model has a different name
    required: true
  },
  status: {
    type: String,
    enum: ['placed', 'accepted', 'rejected', 'delivered', 'cancelled', 'partially_accepted'],
    default: 'placed',
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
  shopOrders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "ShopOrder"
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  deliveryFee: {
    type: Number,
    required: true
  },
  unAvailableItems: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    quantity: {
      type: Number,
      required: true
    }
  }]
}, {
  timestamps: true // adds createdAt and updatedAt
});

const Order = mongoose.model("Order", orderSchema);

export default Order;