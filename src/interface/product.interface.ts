import { ObjectId } from "mongoose";

export interface SearchProductResult {
  productID: string,
  productTitle: string,
  weight: string,
  price: string,
  brand: string,
  variants?: SearchProductResult[],
  imagesUrl: string[],
}

export interface ProductData {
  _id: ObjectId,
  productTitle: string,
  weight: string,
  price: string,
  brand: string,
  variants?: SearchProductResult[],
  imagesUrl: string[],
}