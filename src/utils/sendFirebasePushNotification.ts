import admin from "firebase-admin";
import { Message } from "firebase-admin/lib/messaging/messaging-api";
import fs from "fs";
import path from "path";

let isInitialized = false;

const initializeFirebase = async () => {
  if (isInitialized) return;

  const serviceAccountPath = process.env.SERVICE_ACCOUNT_PATH || "/etc/secrets/service-account.json";
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf-8"));

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  isInitialized = true;
};

export const sendFCMNotification = async (deviceToken: string, order: string) => {
  try{
    await initializeFirebase();
      const message: Message = {
          token: deviceToken,
          // data: { order },
          data: {
              title: "New Order!",
              body: order,
              order
          },
          android: {
              priority: "high",
          },
      };
    const response = await admin.messaging().send(message);
    return { success: true, response };
  } catch (error: any) {
    console.error("❌ Error sending FCM message:", error);
    throw new Error(error)
  }
};