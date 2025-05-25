import mongoose, { Schema, Document } from "mongoose";

export interface IOTP extends Document {
  phoneNumber: string;
  otp: string;
  createdAt: Date;
  expiresAt: Date;
  isVerified: boolean;
  attempts: number;
  lastAttemptAt?: Date;
}

const OTPSchema = new Schema({
  phoneNumber: {
    type: String,
    required: true,
    index: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300, // Document will be automatically deleted after 5 minutes (300 seconds)
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  attempts: {
    type: Number,
    default: 0,
  },
  lastAttemptAt: {
    type: Date,
  },
});

// Create compound index for phone number and OTP
OTPSchema.index({ phoneNumber: 1, otp: 1 });

// Create TTL index on expiresAt
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<IOTP>("OTP", OTPSchema);
