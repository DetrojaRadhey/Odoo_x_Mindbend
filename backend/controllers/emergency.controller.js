const User = require("../models/user.model");
const Emergency = require("../models/emergency.model");
const ServiceProvider = require("../models/serviceProvider.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { responseFormatter } = require("../utils/responseFormatter");
const Admin = require("../models/admin.model");
require("dotenv").config();



exports.saveemergency = async (req, res) => {
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

    const token = req.cookies.jwt_signup || req.cookies.jwt_login;
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const serviceProviders = await ServiceProvider.findById({userId});
    if (!serviceProviders) {
        return res.status(404).json({ message: "Service provider not found" });
    } 

    const latitude = serviceProviders.latlon.latitude;
    const longitude = serviceProviders.latlon.longitude;

    const requests = await Emergency.find({
        status: 'pending',
        latlon: {
            $near: {
                $geometry: {
                    type: 'Point',
                    coordinates: [longitude, latitude]
                },
                $maxDistance: 10000 // 10 km
            }
        }
    }).populate('user', 'name mobile'); 

    if (!requests) {
        return res.status(404).json({ message: "No requests found" });
    }

    return res.status(200).json({
        success: true,
        message: "Requests retrieved successfully",
        data: requests,
    });
        }

        exports.acceptEmergency = async (req, res) => {
            try {
              const token = req.cookies.jwt_signup || req.cookies.jwt_login;
              if (!token) {
                  return res.status(401).json(responseFormatter(false, "Unauthorized"));
              }
          
              const decoded = jwt.verify(token, process.env.JWT_SECRET);
              const serviceProviderId = decoded.id;
          
              const { requestId } = req.body;
              if (!requestId) {
                return res.status(400).json(responseFormatter(false, "Missing required fields"));
              }
          
              const emergencyRequest = await Emergency.findById(requestId);
              
              if (!emergencyRequest) {
                return res.status(404).json(responseFormatter(false, "Emergency request not found"));
              }
          
              if (emergencyRequest.status !== "pending") {
                return res.status(400).json(responseFormatter(false, "Another hospital is already on the way"));
              }
          
              emergencyRequest.status = "accepted";
              emergencyRequest.service_provider = serviceProviderId;
              await emergencyRequest.save();
          
              return res.status(200).json(responseFormatter(true, "Request accepted successfully", { emergencyRequest }));
            } catch (error) {
              console.error(error);
              return res.status(500).json(responseFormatter(false, "Internal server error"));
            }
          };
          exports.getAcceptedEmergency = async (req, res) => {
            try {
              const token = req.cookies.jwt_signup || req.cookies.jwt_login;
              if (!token) {
                  return res.status(401).json(responseFormatter(false, "Unauthorized"));
              }
          
              const decoded = jwt.verify(token, process.env.JWT_SECRET);
              const serviceProviderId = decoded.id;
          
              const acceptedRequests = await Emergency.find({
                status: "accepted",
                service_provider: serviceProviderId,
              }).populate("user");
          
              return res.status(200).json(responseFormatter(true, "Accepted requests retrieved successfully", { acceptedRequests }));
            } catch (error) {
              console.error(error);
              return res.status(500).json(responseFormatter(false, "Internal server error"));
            }
          };
          
          // Controller to mark a request as done
          exports.markEmergencyAsDone = async (req, res) => {
            try {
              const token = req.cookies.jwt_signup || req.cookies.jwt_login;
              if (!token) {
                  return res.status(401).json(responseFormatter(false, "Unauthorized"));
              }
          
              const decoded = jwt.verify(token, process.env.JWT_SECRET);
              const serviceProviderId = decoded.id;
          
              const { requestId } = req.body;
              if (!requestId) {
                return res.status(400).json(responseFormatter(false, "Missing required fields"));
              }
          
              const emergencyRequest = await Emergency.findOne({
                _id: requestId,
                service_provider: serviceProviderId,
              });
          
              if (!emergencyRequest) {
                return res.status(404).json(responseFormatter(false, "Request not found or not assigned to this service provider"));
              }
          
              emergencyRequest.status = "closed";
              await emergencyRequest.save();
          
              return res.status(200).json(responseFormatter(true, "Request marked as done", { emergencyRequest }));
            } catch (error) {
              console.error(error);
              return res.status(500).json(responseFormatter(false, "Internal server error"));
            }
          };
          
          // Controller to show all done requests for a particular hospital
          exports.getDoneRequests = async (req, res) => {
            try {
              const token = req.cookies.jwt_signup || req.cookies.jwt_login;
              if (!token) {
                  return res.status(401).json(responseFormatter(false, "Unauthorized"));
              }
          
              const decoded = jwt.verify(token, process.env.JWT_SECRET);
              const serviceProviderId = decoded.id;
          
              const doneRequests = await Emergency.find({
                status: "closed",
                service_provider: serviceProviderId,
              }).populate("user");
          
              return res.status(200).json(responseFormatter(true, "Done requests retrieved successfully", { doneRequests }));
            } catch (error) {
              console.error(error);
              return res.status(500).json(responseFormatter(false, "Internal server error"));
            }
          };
                    