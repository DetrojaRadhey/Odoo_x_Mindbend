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
    try {
        const token = req.cookies.jwt_signup || req.cookies.jwt_login;
        if (!token) {
            return res.status(401).json(responseFormatter(false, "Unauthorized"));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        const serviceProvider = await ServiceProvider.findById(userId);
        if (!serviceProvider) {
            return res.status(404).json(responseFormatter(false, "Service provider not found"));
        }

        // Check if latitude and longitude are available
        if (!serviceProvider.latlon || 
            serviceProvider.latlon.longitude === undefined || 
            serviceProvider.latlon.latitude === undefined) {
            return res.status(400).json({
                success: false,
                message: "Service provider location not properly set"
            });
        }
        
        // Extract longitude and latitude from serviceProvider.latlon
        const longitude = serviceProvider.latlon.longitude;
        const latitude = serviceProvider.latlon.latitude;
        
        // Find all pending emergency requests within 10km
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

        if (requests.length === 0) {
            return res.status(200).json({
                success: true, 
                message: "No pending requests found in your area", 
                data: []
            });
        }

        return res.status(200).json({ 
            success: true, 
            message: "Pending requests found", 
            data: requests 
        });
    } catch (error) {
        console.error("Error details:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
        exports.acceptEmergency = async (req, res) => {
            try {
              const token = req.cookies.jwt_signup || req.cookies.jwt_login;
              if (!token) {
                  return res.status(401).json({
                      success: false,
                      message: "Unauthorized"
                  });
              }
          
              const decoded = jwt.verify(token, process.env.JWT_SECRET);
              const serviceProviderId = decoded.id;
          
              const { requestId } = req.body;
              if (!requestId) {
                return res.status(400).json({
                    success: false,
                    message: "Missing required fields"
                });
              }
          
              const emergencyRequest = await Emergency.findById(requestId);
              
              if (!emergencyRequest) {
                return res.status(404).json({
                  success: false,
                  message: "Emergency request not found"
                });
              }
          
              if (emergencyRequest.status !== "pending") {
                return res.status(400).json({
                  success: false,
                  message: "Request is not pending"
                });
              }
          
              emergencyRequest.status = "accepted";
              emergencyRequest.service_provider = serviceProviderId;
              await emergencyRequest.save();
          
              return res.status(200).json({
                success: true,
                message: "Emergency request accepted successfully"
              });
            } catch (error) {
              console.error(error);
              return res.status(500).json({
                success: false,
                message: "Internal server error"
              });
            }
          };
          exports.getAcceptedEmergency = async (req, res) => {
            try {
              const token = req.cookies.jwt_signup || req.cookies.jwt_login;
              if (!token) {
                  return res.status(401).json({
                      success: false,
                      message: "Unauthorized"
                  });
              }
          
              const decoded = jwt.verify(token, process.env.JWT_SECRET);
              const serviceProviderId = decoded.id;
          
              const acceptedRequests = await Emergency.find({
                status: "accepted",
                service_provider: serviceProviderId,
              }).populate("user");
          
              return res.status(200).json({
                success: true,
                message: "Accepted requests retrieved successfully",
                data: acceptedRequests,
              });
            } catch (error) {
              console.error(error);
              return res.status(500).json({
                success: false,
                message: "Internal server error",
              });
            }
          };
          
          // Controller to mark a request as done
          exports.markEmergencyAsDone = async (req, res) => {
            try {
              const token = req.cookies.jwt_signup || req.cookies.jwt_login;
              if (!token) {
                  return res.status(401).json({
                      success: false,
                      message: "Unauthorized"
                  });
              }
          
              const decoded = jwt.verify(token, process.env.JWT_SECRET);
              const serviceProviderId = decoded.id;
          
              const { requestId } = req.body;
              if (!requestId) {
                return res.status(400).json({
                    success: false,
                    message: "Missing required fields"
                });
              }
          
              const emergencyRequest = await Emergency.findOne({
                _id: requestId,
                service_provider: serviceProviderId,
              });
          
              if (!emergencyRequest) {
                return res.status(404).json({
                  success: false,
                  message: "Emergency request not found"
                });
              }
          
              emergencyRequest.status = "closed";
              await emergencyRequest.save();
          
              return res.status(200).json({
                success: true,
                message: "Emergency request marked as done successfully"
              });
            } catch (error) {
              console.error(error);
              return res.status(500).json({
                success: false,
                message: "Internal server error"
              });
            }
          };
          
          // Controller to show all done requests for a particular hospital
          exports.getDoneRequests = async (req, res) => {
            try {
              const token = req.cookies.jwt_signup || req.cookies.jwt_login;
              if (!token) {
                  return res.status(401).json({
                      success: false,
                      message: "Unauthorized"
                  });
              }
          
              const decoded = jwt.verify(token, process.env.JWT_SECRET);
              const serviceProviderId = decoded.id;
          
              const doneRequests = await Emergency.find({
                status: "closed",
                service_provider: serviceProviderId,
              }).populate("user");
          
              return res.status(200).json({
                success: true,
                message: "Done requests retrieved successfully",
                data: doneRequests,
              });
            } catch (error) {
              console.error(error);
              return res.status(500).json({
                success: false,
                message: "Internal server error",
              });
            }
          };
                    