import mongoose from "mongoose";
const { SchemaTypes } = mongoose;

/*
{businessId:"",productList:[],lastUpdatedOn:date}

modifiedStructure
{businessId:"",lastUpdatedOn:date,product:{ref:Product},quantity:123,markUnavailable:}
*/

const inventorySchema = new mongoose.Schema({
  businessId: {
    type: SchemaTypes.ObjectId,
    ref: "Business",
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: { type: Number, required: true },
  markUnavailable: { type: Boolean },
  zoneId: {
    type: String, // to be changed to mongoose.Schema.Types.ObjectId
    required: true
  }
});

const Inventory = mongoose.model("Inventory", inventorySchema);

export default Inventory;
