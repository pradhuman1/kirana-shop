import mongoose from "mongoose";
//import bcrypt from "bcryptjs";

const businessSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  type: { type: String, require: true },
  location: { type: String, require: true },
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
