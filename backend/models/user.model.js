const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: function () {
      return !this.googleId; // Password required only if not using Google auth
    },
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  mobile: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function (v) {
        return /^\d{10}$/.test(v);
      },
      message: "Mobile number must be 10 digits",
    },
  },
  location: {
    state: {
      type: String,
      required: true,
      trim: true,
    },
    district: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
  },
  latlon: {
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
  },
  other_contact: {
    type: [
      {
        name: String,
        relation: String,
        number: {
          type: String,
          validate: {
            validator: function (v) {
              return /^\d{10}$/.test(v);
            },
            message: "Contact number must be 10 digits",
          },
        },
      },
    ],
    validate: {
      validator: function (v) {
        return v.length <= 5;
      },
      message: "Cannot have more than 5 emergency contacts",
    },
  },
  googleId: {
    type: String,
    sparse: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  type: {
    type: String,
    required: true,
    default: "user",
  },
});

// Removed password hashing middleware

// Removed comparePassword method as we're using direct comparison

module.exports = mongoose.model("User", UserSchema);