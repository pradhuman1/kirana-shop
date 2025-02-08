import mongoose from "mongoose";

/*
{id:,name:"Parl G",imgUrl:"",price:"",commission:""}
*/

const productSchema = new mongoose.Schema({
  productTitle: { type: String, required: true },
  imgCDNUrl: { type: String, required: true },
  price: { type: String, require: true },
  commission: { type: String, require: true },
});

const Product = mongoose.model("Product", productSchema);

export default Product;
