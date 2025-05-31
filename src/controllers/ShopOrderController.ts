import ShopOrder from "../models/ShopOrder.Model";
import Product from "../models/Product.Model";
import { ProductData } from "../interface/product.interface";
import { AuthRequest } from "../interface/authRequest.interface";
import { NextFunction, Response } from "express";
import { updateOrderStatus } from "./OrderController";
import { findBusinessById } from "./authController";
import { sendFCMNotification } from "../utils/sendFirebasePushNotification";
import { bulkFetchProductDetails } from "./productController";

export const createShopOrder = async (
  businessId: string,
  items: { productId: string; quantity: number }[],
  orderId: string
) => {
  try {
    let totalAmount = 0;
    const businessDetails = await findBusinessById(businessId);
    const businessFcmToken = businessDetails?.fcmToken;
    const productIds = items.map((item) => item.productId);
    const productDetailsMap = await bulkFetchProductDetails(productIds);

    let orderLines: string[] = [];

    for (const { productId, quantity } of items) {
      const product = productDetailsMap.get(productId);
      if (!product) throw new Error(`Product ${productId} not found`);

      totalAmount += product.price * quantity;

      const brand = product.brand || "";
      let title = (product.productTitle || "").split(" ").slice(0, 2).join(" ");
      if (title.length > 15) {
        title = title.slice(0, 15);
      }
      const weight = product.weight || "";
      const price = product.price || "";

      const line = `${brand} ${title} ${weight}`.trim();

      orderLines.push(line);
    }

    const orderString = orderLines.join("\n");

    if (businessFcmToken) {
      await sendFCMNotification(businessFcmToken, orderString);
    } else {
      throw new Error("Unable to send push notification");
    }
    const shopOrder = await ShopOrder.create({
      businessId,
      status: "pending",
      totalAmount,
      items,
      orderId,
    });
    
    return shopOrder;
  } catch (error) {
    throw new Error(
      `Failed to create shop order for business ${businessId}: ${error}`
    );
  }
};

export const getMyShopOrders = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const businessId = req.tokenDetails?.businessId;

    if (!businessId) {
      throw new Error("Business ID not found in request");
    }

    // Populate product data from each order's items
    const allShopOrders = await ShopOrder.find({ businessId })
      .populate("items.productId")
      .lean();

    const filteredOrders = allShopOrders.filter((order) =>
      ["pending", "accepted"].includes(order.status)
    );

    const ordersList = filteredOrders.map((order) => ({
      shopOrderId: order._id.toString(),
      status: order.status,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
      items: order.items.map(({ productId, quantity }) => {
        const product = productId as unknown as ProductData;

        return {
          productID: product._id?.toString() || "",
          productTitle: product.productTitle || "",
          weight: product.weight || "",
          price: product.price || "",
          brand: product.brand || "",
          imagesUrl: product.imagesUrl || [],
          quantity,
        };
      }),
    }));

    const response = {
      ordersList: ordersList,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: `Something went wrong: ${error}`,
    });
  }
};

export const updateShopOrderStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const businessId = req.tokenDetails?.businessId;
    const { shopOrderId, status } = req.body;
    if (!businessId) {
      return res
        .status(400)
        .json({ message: "Business ID missing in token details" });
    }

    if (!shopOrderId || !["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid shopOrderId or status" });
    }
    const shopOrder = await ShopOrder.findById(shopOrderId);
    if (!shopOrder) {
      return res.status(404).json({ message: "Shop order not found" });
    }

    if (shopOrder.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Only pending orders can be updated" });
    }

    shopOrder.status = status;
    updateOrderStatus(shopOrder.orderId.toString());
    await shopOrder.save();

    return res.status(200).json({ message: `Order ${status} successfully` });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: `Something went wrong: ${error}`,
    });
  }
};
