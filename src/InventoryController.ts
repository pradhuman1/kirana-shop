import { Request, Response, NextFunction } from "express";
import { CheckIfBusinessExists, CheckIfProductExists } from "./DataUtils";

import Business from "./Business.Model";
import Inventory from "./Inventory.Model";

type productId = Number | string;

interface ProductBody {
  productId: productId;
  quantity?: Number;
  markUnavaliable?: Boolean;
}

interface InventoryBody {
  businessId: Number | string;
  productList: ProductBody[];
}

export const addInventory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { businessId, productList = [] }: InventoryBody = req.body;
    const invalidProductIds: productId[] = [];
    const validProductData: String | Number[] = [];

    console.log("data received at inventory body");
    console.log(productList);
    if (!CheckIfBusinessExists(businessId)) {
      res
        .send(500)
        .json({ message: `Business with ${businessId} dosent exists ` });

      return;
    }

    productList.forEach(async (productItem: ProductBody) => {
      const {
        productId,
        quantity,
        markUnavaliable = false,
      }: ProductBody = productItem;
      if (!CheckIfProductExists(productId)) {
        invalidProductIds.push(productId);
      } else {
        const inventoryId = await Inventory.create({
          businessId: businessId,
          productInfo: productId,
          quantity: quantity,
          markUnavaliable: markUnavaliable,
        });
      }
    });

    res.status(200).json({
      invalidProductIds: invalidProductIds,
    });
  } catch (error) {
    next();
    res.status(500).json({
      message: `Something went wrong  ${error}`,
    });
  }

  /*
      Get the infromation about the shop
     check shop in the shopdatabase,if shop dosenot exists reject the request saying shop does not exists
    */
};

export const getInventory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { businessId } = req.body;
    console.log(`gettig inventory for ${businessId}`);
    const inventoryData = await Inventory.findOne({
      businessId: businessId,
    })
      .populate("businessId")
      .populate("productInfo")
      .exec();
    console.log("inventoryData");
    console.log(inventoryData);

    res.status(200).send({ inventoryData: inventoryData });
  } catch (error) {
    next();
    res.status(500).json({
      message: `Something went wrong  ${error}`,
    });
  }
};

/*
 productId: productId;
  quantity?: Number;
  markUnavaliable?: Boolean;

*/
