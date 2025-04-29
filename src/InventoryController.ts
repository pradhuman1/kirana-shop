import { Request, Response, NextFunction } from "express";
import { CheckIfBusinessExists, CheckIfProductExists } from "./DataUtils";

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

interface AuthRequest extends Request {
  user?: {
    businessId: string | number;
  };
}

export const addInventory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { productList = [] }: InventoryBody = req.body;
    const businessId = req.user?.businessId;

    if (!businessId) {
      return res
        .status(400)
        .json({ message: "Business ID not found in token" });
    }

    const invalidProductIds: productId[] = [];
    const validProductData: String | Number[] = [];

    console.log("data received at inventory body");
    console.log(productList);
    if (!CheckIfBusinessExists(businessId)) {
      return res
        .status(500)
        .json({ message: `Business with ${businessId} doesn't exist` });
    }

    await Promise.all(
      productList.map(async (productItem: ProductBody) => {
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
      })
    );

    return res.status(200).json({
      invalidProductIds: invalidProductIds,
    });
  } catch (error) {
    next(error);
  }
};

export const getInventory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { businessId } = req.body;
    console.log(`getting inventory for ${businessId}`);
    const inventoryData = await Inventory.findOne({
      businessId: businessId,
    })
      .populate("businessId")
      .populate("productInfo")
      .exec();
    console.log("inventoryData");
    console.log(inventoryData);

    return res.status(200).json({ inventoryData: inventoryData });
  } catch (error) {
    next(error);
  }
};

export const deleteInventory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { businessId } = req.body;
    console.log(`Deleting inventory for business ${businessId}`);

    const existingInventory = await Inventory.findOne({
      businessId: businessId,
    });

    if (!existingInventory) {
      res.status(404).json({
        message: "Inventory not found for this business",
      });
    }

    await Inventory.findOneAndDelete({
      businessId: businessId,
    });

    res.status(200).json({
      message: "Inventory deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

interface UpdateInventoryBody {
  businessId: Number | string;
  productId: Number | string;
  updateData: {
    quantity?: Number;
    markUnavaliable?: Boolean;
  };
}

interface UpdateInventoryData {
  quantity?: Number;
  markUnavaliable?: Boolean;
}

export const updateInventory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { businessId, productId, updateData }: UpdateInventoryBody = req.body;

    const existingInventory = await Inventory.findOne({
      businessId: businessId,
    });

    if (!existingInventory) {
      res.status(404).json({
        message: "Inventory not found for this business",
      });
    }

    const dataToUpdate: UpdateInventoryData = {};
    if (updateData.quantity !== undefined) {
      dataToUpdate["quantity"] = updateData.quantity;
    }
    if (updateData.markUnavaliable !== undefined) {
      dataToUpdate["markUnavaliable"] = updateData.markUnavaliable;
    }

    const updatedInventory = await Inventory.findOneAndUpdate(
      { businessId: businessId, productId: productId },
      dataToUpdate,
      { new: true }
    );

    res.status(200).json({
      message: "Inventory updated successfully",
      updatedInventory: updatedInventory,
    });
  } catch (error) {
    next(error);
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
