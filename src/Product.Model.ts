import mongoose from "mongoose";

/*
{id:,name:"Parl G",imgUrl:"",price:"",commission:""}
*/

const productSchema = new mongoose.Schema({
  productTitle: { type: String, required: false },
  scrappedSource: { type: String, required: false },
  scrappedUrl: { type: String, required: false },
  weight: { type: String, required: false },
  price: { type: String, required: false },
  scrappedSellingPrice: { type: String, required: false },
  category: { type: [String], required: false },
  ean: { type: String, required: false },
  packDesc: { type: String, required: false },
  brand: { type: String, required: false },
  unit: { type: String, required: false },
  variantIds: { type: [mongoose.Schema.Types.ObjectId], required: false },
  imagesUrl: { type: [String], required: false },
  commission: { type: String, required: false },
  searchTokens: { type: [String], required: false },
});

const Product = mongoose.model("Product", productSchema);

export default Product;
