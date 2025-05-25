import axios from "axios";
import OTP from "../models/OTP.Model";
import { IOTP } from "../models/OTP.Model";

// Configuration
const OTP_EXPIRY_MINUTES = 1;
const MAX_ATTEMPTS = 3;

// Third party API configuration

class OTPService {
  private async requestOTPFromAPI(
    phoneNumber: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Call third-party API to send OTP
      const otpUrl = `https://2factor.in/API/V1/8d27254a-2e5e-11f0-8b17-0200cd936042/SMS/+91${phoneNumber}/AUTOGEN2/Kiranaotp`;
      const response = await axios.get(otpUrl);
      console.log(response);

      if (response.status !== 200) {
        throw new Error("Failed to send OTP");
      }

      // Store OTP details in our database
      const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
      const createdOTP = await OTP.create({
        phoneNumber,
        otp: response.data.OTP, // Assuming third-party API returns the OTP
        expiresAt,
        attempts: 0,
      });
      console.log(createdOTP);
      return {
        success: true,
        message: "OTP sent successfully",
      };
    } catch (error) {
      console.error("Error requesting OTP:", error);
      throw new Error("Failed to send OTP");
    }
  }

  async sendOTP(
    phoneNumber: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Check for existing unexpired OTP
      const existingOTP = await OTP.findOne({
        phoneNumber,
        expiresAt: { $gt: new Date() },
        isVerified: false,
      });

      if (existingOTP) {
        const timeLeft = Math.ceil(
          (existingOTP.expiresAt.getTime() - Date.now()) / 1000
        );
        return {
          success: false,
          message: `OTP already sent. Please wait ${timeLeft} seconds before requesting a new one.`,
        };
      }

      // Request new OTP from third-party API
      return await this.requestOTPFromAPI(phoneNumber);
    } catch (error) {
      console.error("Error in sendOTP:", error);
      throw error;
    }
  }

  async verifyOTP(
    phoneNumber: string,
    otp: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Find the most recent unexpired OTP for this phone number
      const otpRecord = await OTP.findOne({
        phoneNumber,
        expiresAt: { $gt: new Date() },
        isVerified: false,
      }).sort({ createdAt: -1 }); // Get the most recent OTP

      if (!otpRecord) {
        return {
          success: false,
          message: "No valid OTP found. Please request a new OTP.",
        };
      }

      // Check attempts
      if (otpRecord.attempts >= MAX_ATTEMPTS) {
        return {
          success: false,
          message: "Maximum attempts exceeded. Please request a new OTP.",
        };
      }

      // Update attempts
      otpRecord.attempts += 1;
      otpRecord.lastAttemptAt = new Date();

      // Verify OTP against stored value
      if (otpRecord.otp !== otp) {
        await otpRecord.save();
        return {
          success: false,
          message: "Invalid OTP",
        };
      }

      // Mark as verified in our database
      otpRecord.isVerified = true;
      await otpRecord.save();

      return {
        success: true,
        message: "OTP verified successfully",
      };
    } catch (error) {
      console.error("Error in verifyOTP:", error);
      throw error;
    }
  }
}

export default new OTPService();
