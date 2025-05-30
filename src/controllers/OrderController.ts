import { Request, Response, NextFunction } from "express";
import { getZoneInventory } from "./InventoryController";
import { AuthRequest } from "../interface/authRequest.interface";
import { createShopOrder } from "./ShopOrderController";
import Order from "../models/Order.Model";
import { ProductData } from "../interface/product.interface";
import ShopOrder from "../models/ShopOrder.Model";
import { sendFCMNotification } from "../utils/sendFirebasePushNotification";

const mapProductsToBusinesses = (
  items: { productId: string; quantity: number }[],
  zoneInventory: any[]
): Map<string, { productId: string; quantity: number }[]> => {
  const businessOrderMap = new Map();

  for (const { productId, quantity } of items) {
    const inventories = zoneInventory.filter(
      (inv) =>
        inv.productId.toString() === productId && inv.quantity >= quantity
    );

    if (inventories.length === 0) {
      throw new Error(`Product ${productId} out of stock in this zone`);
    }

    const selectedInventory = inventories[0];
    const businessId = selectedInventory.businessId.toString();

    if (!businessOrderMap.has(businessId)) {
      businessOrderMap.set(businessId, []);
    }

    businessOrderMap.get(businessId).push({ productId, quantity });
  }

  return businessOrderMap;
};

export const generateOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { items } = req.body;
    const customerId = req.tokenDetails?.businessId;
    const zoneId = req.businessDetails?.zoneId;

    if (!items?.length) throw new Error("No items provided");
    if (!customerId || !zoneId) throw new Error("Missing customerId or zoneId");

    const zoneInventory = await getZoneInventory(zoneId);
    const businessOrderMap = mapProductsToBusinesses(items, zoneInventory);

    const deliveryFee = 30;
    let totalAmount = 0;

    // Step 1: Create the order first (shopOrders will be updated later)
    const order = await Order.create({
      customerId,
      status: "placed",
      items,
      shopOrders: [], // temporary empty list
      totalAmount: 0, // will update later
      deliveryFee,
    });

    const shopOrderIds = [];

    // Step 2: Create shop orders with order._id
    for (const [businessId, productList] of businessOrderMap.entries()) {
      try {
        const shopOrder = await createShopOrder(
          businessId,
          productList,
          order._id.toString()
        );
        shopOrderIds.push(shopOrder._id);
        totalAmount += shopOrder.totalAmount;
      } catch (error) {
        console.error(error);
        // Optionally roll back the order
        await Order.findByIdAndDelete(order._id);
        return res
          .status(400)
          .json({ message: `Shop order creation failed: ${error}` });
      }
    }

    // Step 3: Update order with actual shopOrders and totalAmount
    order.shopOrders = shopOrderIds;
    order.totalAmount = totalAmount;
    await order.save();

    return res
      .status(200)
      .json({ message: `Order created successfully`, orderId: order._id });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: `Something went wrong: ${error}` });
  }
};

export const getMyOrders = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const customerId = req.tokenDetails?.businessId;

    if (!customerId) throw new Error("Customer ID not found in request");

    const allOrders = await Order.find({ customerId })
      .populate("items.productId")
      .lean();

    const relevantOrders = allOrders.filter((order) =>
      ["placed", "accepted"].includes(order.status)
    );

    const ordersList = relevantOrders.map((order) => ({
      orderId: order._id.toString(),
      status: order.status,
      deliveryFee: order.deliveryFee,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
      items: order.items.map(({ productId, quantity }) => {
        const product = productId as unknown as ProductData;
        // productId is now a full Product document
        return {
          productID: product?._id?.toString() || "",
          productTitle: product?.productTitle || "",
          weight: product?.weight || "",
          price: product?.price || "",
          brand: product?.brand || "",
          imagesUrl: product?.imagesUrl || [],
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

export const updateOrderStatus = async (orderId: string): Promise<any> => {
  try {
    console.log("updateOrderStatus");
    const order = await Order.findById(orderId).lean();
    if (!order) throw new Error("Order not found");

    const shopOrders = await ShopOrder.find({ _id: { $in: order.shopOrders } });
    console.log(shopOrders);
    console.log("updateOrderStatus");

    console.log(shopOrders.map((so) => so.status));
    console.log("updateOrderStatus");

    if (shopOrders.some((so) => so.status === "pending")) {
      return;
    }
    console.log("updateOrderStatus");

    let acceptedTotal = 0;
    const unAvailableItems: { productId: any; quantity: number }[] = [];

    for (const so of shopOrders) {
      if (so.status === "accepted") {
        acceptedTotal += so.totalAmount;
      } else if (so.status === "rejected") {
        unAvailableItems.push(...so.items);
      }
    }

    let newStatus: "accepted" | "rejected" | "partially_accepted";
    const statuses = shopOrders.map((so) => so.status);

    if (statuses.every((s) => s === "accepted")) {
      newStatus = "accepted";
    } else if (statuses.every((s) => s === "rejected")) {
      newStatus = "rejected";
    } else {
      newStatus = "partially_accepted";
    }

    await Order.findByIdAndUpdate(orderId, {
      status: newStatus,
      totalAmount: acceptedTotal,
      unAvailableItems,
    });
  } catch (error) {
    return new Error(`unable to update order status: ${error}`);
  }
};

export const sendOrderPushNotification = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { fcmToken, orderDetails } = req.body;
    const fcmResponse = await sendFCMNotification(fcmToken, orderDetails);
    res
      .status(200)
      .json({ message: `Push Notification sent successfully: ${fcmResponse}` });
  } catch (error) {
    return res.status(500).json({
      message: `Something went wront ${error}`,
    });
  }
};
