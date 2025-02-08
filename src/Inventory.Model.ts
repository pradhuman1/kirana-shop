import mongoose from "mongoose";
const { SchemaTypes } = mongoose;

/*
{businessId:"",productList:[],lastUpdatedOn:date}
*/

const inventorySchema = new mongoose.Schema({
  businessId: {
    type: SchemaTypes.ObjectId,
    ref: "Business",
    required: true,
  },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: { type: Number, required: true },
      markUnavaliable: { type: Boolean },
    },
  ],
});

const Inventory = mongoose.model("Inventory", inventorySchema);

export default Inventory;
