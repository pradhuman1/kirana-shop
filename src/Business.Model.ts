import mongoose from "mongoose";
//import bcrypt from "bcryptjs";

const businessSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String, unique: true, sparse: true },
  type: { type: String },
  locationCoordinates: {
    latitude: { type: Number },
    longitude: { type: Number },
  },
  address: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    zipCode: { type: String },
    country: { type: String, default: "India" }, // you can set defaults too },
    addressLine1: { type: String },
  },
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
