import { Request, Response, NextFunction } from "express";
import {
  CheckIfBusinessExists,
  CheckIfProductExists,
  CheckIfInventoryExists,
} from "../utils/DataUtils";
import { AuthRequest } from "../interface/authRequest.interface";

import Inventory from "../models/Inventory.Model";
import Product from "../models/Product.Model";

type productId = string | number;

interface InventoryBody {
  productId: productId;
  quantity?: Number;
}

export const getZoneInventory = async (
  // filter out of stock items
  zoneId: string | number
): Promise<any> => {
  try {
    if (!zoneId) throw new Error("Empty zone ID");
    const zoneInventoryData = await Inventory.find({
      zoneId,
    });
    return zoneInventoryData;
  } catch (error) {
    return error;
  }
};

export const addInventory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { productId, quantity = 5 }: InventoryBody = req.body;
    const businessId = req.tokenDetails?.businessId;
    const zoneId = req.businessDetails?.zoneId;

    if (!businessId) {
      return res
        .status(400)
        .json({ message: "Business ID not found in token" });
    }

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    if (Number(quantity) < 0) {
      return res.status(400).json({ message: "Invalid quantity" });
    }

    const [businessExists, productExists, inventoryExists] = await Promise.all([
      CheckIfBusinessExists(businessId),
      CheckIfProductExists(productId),
      CheckIfInventoryExists(productId, businessId),
    ]);

    if (!businessExists) {
      return res
        .status(404)
        .json({ message: `Business with ID ${businessId} doesn't exist` });
    }

    if (!productExists) {
      return res
        .status(404)
        .json({ message: `Product with ID ${productId} doesn't exist` });
    }

    if (inventoryExists) {
      return res.status(409).json({
        message: `Inventory for product ${productId} and business ${businessId} already exists`,
      });
    }

    await Inventory.create({ businessId, productId, quantity, zoneId });

    return res.status(200).json({
      message: `Product ${productId} successfully added to inventory of business ${businessId}`,
    });
  } catch (error) {
    next(error);
    res.status(500).json({
      message: `Something went wrong  ${error}`,
    });
  }
};
export const getBusinessInventory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const businessId = req.tokenDetails?.businessId;
    if (!businessId) {
      return res
        .status(400)
        .json({ message: "Business ID not found in token" });
    }

    const inventoryData = await Inventory.find({ businessId })
      .populate("productId")
      .exec();

    const formattedInventory = inventoryData.map((item) => {
      const productDoc = item.productId;

      const product = (productDoc as any).toObject();
      return {
        ...product,
        quantity: item.quantity,
      };
    });

    return res.status(200).json({ inventory: formattedInventory });
  } catch (error) {
    next(error);
  }
};

export const deleteInventory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { productId } = req.body;
    const businessId = req.tokenDetails?.businessId;

    const productExists = await CheckIfProductExists(productId);
    if (!productExists) {
      return res
        .status(404)
        .json({ message: `Product with ID ${productId} doesn't exist` });
    }

    console.log(`Deleting inventory for business ${businessId}`);

    const existingInventory = await Inventory.findOne({
      businessId,
      productId,
    });

    if (!existingInventory) {
      return res.status(404).json({
        message: "Inventory not found for this business",
      });
    }

    await Inventory.findOneAndDelete({ businessId, productId });

    return res.status(200).json({
      message: "Inventory deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: `Something went wrong  ${error}`,
    });
  }
};

interface UpdateInventoryBody {
  productId: number | string;
  updateData: {
    quantity?: Number;
    markUnavailable?: Boolean;
  };
}

interface UpdateInventoryData {
  quantity?: Number;
  markUnavailable?: Boolean;
}

export const updateInventory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { productId, updateData }: UpdateInventoryBody = req.body;
    const businessId = req.tokenDetails?.businessId;
    const productExists = await CheckIfProductExists(productId);
    if (!productExists) {
      return res
        .status(404)
        .json({ message: `Product with ID ${productId} doesn't exist` });
    }
    const existingInventory = await Inventory.findOne({
      businessId,
      productId,
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
    if (updateData.markUnavailable === true) {
      dataToUpdate["quantity"] = 0;
    }

    if (Number(dataToUpdate["quantity"]) < 0) {
      return res.status(400).json({ message: "Invalid quantity" });
    }

    const updatedInventory = await Inventory.findOneAndUpdate(
      { businessId, productId },
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
  markUnavailable?: Boolean;

*/
