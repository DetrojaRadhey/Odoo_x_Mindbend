const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
 
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: Number,
    required: true,
  },
  address:{
    type: String,
    required: true,
  },
  
  password: {
    type: String,
    required: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
},
resetPasswordToken: {
  type: String,
},
resetPasswordExpires: {
  type: Date,
}
});

const User = mongoose.model("User", userSchema);
module.exports = User;
