import mongoose from "mongoose";

const zoneSchema = new mongoose.Schema({
  locationCoordinates: {
    latitude: { type: String, required: true },
    longitude: { type: String, required: true },
  },
  backupZones: [{ type: mongoose.Schema.Types.ObjectId, ref: "Zone", required: false }],
},{
  timestamps: true
});

const Zone = mongoose.model("Zone", zoneSchema);

export default Zone;
