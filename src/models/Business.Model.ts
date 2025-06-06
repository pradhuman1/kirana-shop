import { BusinessType } from "../enums/BusinessType";
import mongoose from "mongoose";
//import bcrypt from "bcryptjs";

const businessSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String, unique: true, sparse: true },
  type: {
    type: String,
    enum: Object.values(BusinessType),
    required: false,
  },
  locationCoordinates: {
    latitude: { type: String },
    longitude: { type: String },
  },
  address: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    zipCode: { type: String },
    country: { type: String, default: "India" }, // you can set defaults too },
    addressLine1: { type: String },
  },
  zoneId: { type: mongoose.Schema.Types.ObjectId, required: false },
  fcmToken: { type: String, required: false }
},{
  timestamps: true
});

// Compare entered password with hashed password
// userSchema.methods.matchPassword = async function (enteredPassword) {
//   console.log("enteredPassword");
//   console.log(enteredPassword);
//   console.log("saved password");
//   console.log(this.password);

//   return await bcrypt.compare(enteredPassword, this.password);
// };

const Business = mongoose.model("Business", businessSchema);

export default Business;
