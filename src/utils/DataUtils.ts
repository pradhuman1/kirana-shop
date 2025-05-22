import Business from "../models/Business.Model";
import Product from "../models/Product.Model";
import Inventory from "../models/Inventory.Model";
import mongoose from "mongoose";


// @todo: Create a generic ts  type for businessId

const validateMongoId = (id: number | string) => {
  return mongoose.Types.ObjectId.isValid(id);
}

export const CheckIfBusinessExists = async (businessId: string | number) => {
  if (!validateMongoId(businessId)) {
    return false;
  }
  const businessExists = await Business.exists({ _id: businessId });

  return businessExists;
};

export const CheckIfProductExists = async (productId: string | number) => {
  if (!validateMongoId(productId)) {
    return false;
  }
  const productExists = await Product.exists({ _id: productId });
  return productExists;
};

export const CheckIfInventoryExists = async (productId: string | number, businessId: string | number ) => {
  if (!validateMongoId(businessId) || !validateMongoId(productId)) {
    return false;
  }
  const inventoryExists = await Inventory.exists({ productId, businessId });

  return inventoryExists;
};

