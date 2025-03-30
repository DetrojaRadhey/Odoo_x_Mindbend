const User = require("../models/user.model");
const ServiceProvider = require("../models/serviceProvider.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { responseFormatter } = require("../utils/responseFormatter");
const Admin = require("../models/admin.model");
require("dotenv").config();

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    // expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Register a new user
exports.register = async (req, res) => {
  try {
    const { email, password, name, mobile, location, latlon, other_contact } =
      req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return responseFormatter(res, 400, false, "User already exists");
    }

    // Create new user with plain text password
    const user = new User({
      email,
      password, // Store original password without hashing
      name,
      mobile,
      location,
      latlon,
      other_contact: other_contact || [],
    });

    await user.save();

    // Generate token
    const token = generateToken(user);

    return responseFormatter(res, 201, true, "User registered successfully", {
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: "user",
      },
    });
  } catch (err) {
    console.error("Registration error:", err);
    return responseFormatter(
      res,
      500,
      false,
      "Server error",
      null,
      err.message
    );
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    let user;
    let role;

    // Check in User model first
    user = await User.findOne({ email });
    if (user) {
      role = 'user';
    }

    // If not found in User, check in ServiceProvider
    if (!user) {
      user = await ServiceProvider.findOne({ "contact.email": email });
      if (user) {
        role = 'service_provider';
      }
    }

    // If not found in ServiceProvider, check in Admin
    if (!user) {
      user = await Admin.findOne({ email });
      if (user) {
        role = 'admin';
      }
    }

    // If user not found in any model
    if (!user) {
      return responseFormatter(res, 400, false, "Invalid email or password");
    }

    // Direct password comparison
    if (user.password !== password) {
      return responseFormatter(res, 400, false, "Invalid email or password");
    }

    // Generate token
    const token = generateToken(user);

    // Format user data based on role
    const userData = {
      id: user._id,
      name: user.name,
      email: role === "service_provider" ? user.contact.email : user.email,
      role: role
    };

    return responseFormatter(res, 200, true, "Login successful", {
      token,
      user: userData
    });
  } catch (err) {
    console.error("Login error:", err);
    return responseFormatter(
      res,
      500,
      false,
      "Server error",
      null,
      err.message
    );
  }
};
