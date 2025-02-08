import Business from "./Business.Model";
import Product from "./Product.Model";

// @todo: Create a generic ts  type for businessId
export const CheckIfBusinessExists = async (businessId: Number | String) => {
  const businessExists = await Business.exists({ _id: businessId });

  return businessExists;
};

export const CheckIfProductExists = async (productId: Number | String) => {
  const productExists = await Product.exists({ _id: productId });

  return productExists;
};
