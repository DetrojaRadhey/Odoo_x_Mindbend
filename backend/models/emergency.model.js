const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const emergencySchema = new mongoose.Schema({
  latlon: {
    type: {
        type: String,
        enum: ["Point"],
        required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },  
  },
  
 
  status: {
    type: String,
    enum: ["pending", "accepted", "closed"],
    default: "pending",
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  service_provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ServiceProvider",
  },
});
module.exports = mongoose.model("Emergency", emergencySchema);
