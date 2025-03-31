const User = require("../models/user.model");
const Emergency = require("../models/emergency.model");
const ServiceProvider = require("../models/serviceProvider.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { responseFormatter } = require("../utils/responseFormatter");
const Admin = require("../models/admin.model");
require("dotenv").config();


exports.showRequests = async (req, res) => {
    try {
      const { latitude, longitude, userid } = req.body;
  
      if (!latitude || !longitude || !userid) {
        return res.status(400).json(responseFormatter(false, "Missing required fields"));
      }
  
      // Create emergency request
      const emergencyReq = new Emergency({
        latlon: { type: "Point", coordinates: [longitude, latitude] },
        user: userid,
        status: "pending",
      });
  
      await emergencyReq.save();
  
      // Find nearby hospitals (service providers of type 'Private hospital')
      
      return res.status(200).json({
        success: true,
        message: "Emergency request created successfully",
        data: emergencyReq,
      })
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };

  exports.showreqtohos = async (req, res) => {
        const requests = await Emergency.find({ status: "pending" })
  }
  