const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const serviceProviderSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["Hospital", "Mechanical"],
    required: true,
  },
  name: { type: String, unique: true, required: true },
  password: {type:String, unique: true, required: true},
  contact: {
    mobile: String,
    email: String,
  },
  location: {
    state: String,
    district: String,
    city: String,
  },
  latlon: {
    latitude: Number,
    longitude: Number,
  },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  service_count: { type: Number, default: 0 },
});
module.exports = mongoose.model("ServiceProvider", serviceProviderSchema);
