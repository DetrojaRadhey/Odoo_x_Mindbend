const User = require("../models/user.model");
const Emergency = require("../models/emergency.model");
const ServiceProvider = require("../models/serviceProvider.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { responseFormatter } = require("../utils/responseFormatter");
const Admin = require("../models/admin.model");
require("dotenv").config();
const mongoose = require("mongoose");

exports.saveemergency = async (req, res) => {
    try {
        const { latitude, longitude, userid } = req.body;

        if (!latitude || !longitude || !userid) {
            return res.status(400).json(responseFormatter(false, "Missing required fields"));
        }

        // Validate userid
        if (!mongoose.Types.ObjectId.isValid(userid)) {
            return res.status(400).json(responseFormatter(false, "Invalid user ID format"));
        }

        // Check for existing emergency requests in the last hour
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago
        const existingRequest = await Emergency.findOne({
            user: new mongoose.Types.ObjectId(userid),
            created_at: { $gte: oneHourAgo },
            status: { $in: ['pending', 'accepted'] }
        });

        if (existingRequest) {
            const timeDiff = Math.floor((Date.now() - existingRequest.created_at.getTime()) / (1000 * 60)); // difference in minutes
            return res.status(200).json({
              success: false,
                message: `You already have an active emergency request. Please wait ${60 - timeDiff} minutes before creating a new request.`,
            });
        }

        
        // Create emergency request
        const emergencyReq = new Emergency({
            latlon: { type: "Point", coordinates: [longitude, latitude] },
            user: new mongoose.Types.ObjectId(userid),
            status: "pending",
            created_at: new Date()
        });

        await emergencyReq.save();

        return res.status(200).json({
            success: true,
            message: "Emergency request created successfully",
            data: emergencyReq,
        });
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
          return res.status(401).json({ message: "Unauthorized" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;

      const serviceProviders = await ServiceProvider.findById(userId);
      if (!serviceProviders) {
          return res.status(404).json({ message: "Service provider not found" });
      }

      console.log(serviceProviders.latlon);  // Log the location data
      
      if (!serviceProviders.latlon || !Array.isArray(serviceProviders.latlon.coordinates)) {
          return res.status(400).json({ message: "Invalid location data for service provider" });
      }

      const [longitude, latitude] = serviceProviders.latlon.coordinates;

      // ✅ Ensure longitude & latitude are valid numbers
      if (typeof latitude !== "number" || typeof longitude !== "number") {
          return res.status(400).json({ message: "Invalid latitude/longitude values" });
      }

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

      if (!requests || requests.length === 0) {
          return res.status(404).json({ message: "No requests found" });
      }

      return res.status(200).json({
          success: true,
          message: "Requests retrieved successfully",
          data: requests,
      });

  } catch (error) {
      console.error("Error fetching emergency requests:", error);
      return res.status(500).json({ message: "Internal server error" });
  }
};

        exports.acceptEmergency = async (req, res) => {
            try {
              const token = req.cookies.jwt_signup || req.cookies.jwt_login;
              if (!token) {
                  return res.status(401).json({
                      success: false,
                      message: "Unauthorized",
                  });
              }
          
              const decoded = jwt.verify(token, process.env.JWT_SECRET);
              const serviceProviderId = decoded.id;
          
              const { requestId } = req.body;
              if (!requestId) {
                return res.status(400).json({
                  success: false,
                  message: "Missing required fields",
                });
              }
          
              const emergencyRequest = await Emergency.findById(requestId);
              
              if (!emergencyRequest) {
                return res.status(404).json({
                  success: false,
                  message: "Request not found",
                });
              }
          
              if (emergencyRequest.status !== "pending") {
                return res.status(400).json({
                  success: false,
                  message: "Request is not in a state to be accepted",
                });
              }
          
              emergencyRequest.status = "accepted";
              emergencyRequest.service_provider = serviceProviderId;
              await emergencyRequest.save();
          
              return res.status(200).json({
                success: true,
                message: "Request accepted successfully",
                data: emergencyRequest,
              });
            } catch (error) {
              console.error(error);
              return res.status(500).json({
                success: false,
                message: "Internal server error",
              });
            }
          };
          exports.getAcceptedEmergency = async (req, res) => {
            try {
              const token = req.cookies.jwt_signup || req.cookies.jwt_login;
              if (!token) {
                  return res.status(401).json({
                      success: false,
                      message: "Unauthorized",
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
                      message: "Unauthorized",
                  });
              }
          
              const decoded = jwt.verify(token, process.env.JWT_SECRET);
              const serviceProviderId = decoded.id;
          
              const { requestId } = req.body;
              if (!requestId) {
                return res.status(400).json({
                  success: false,
                  message: "Missing required fields",
                });
              }
          
              const emergencyRequest = await Emergency.findOne({
                _id: requestId,
                service_provider: serviceProviderId,
              });
          
              if (!emergencyRequest) {
                return res.status(404).json({
                  success: false,
                  message: "Request not found or not assigned to you",
                });
              }
          
              emergencyRequest.status = "closed";
              await emergencyRequest.save();
          
              return res.status(200).json({
                success: true,
                message: "Request marked as done successfully",
              });
            } catch (error) {
              console.error(error);
              return res.status(500).json({
                success: false,
                message: "Internal server error",
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
                      message: "Unauthorized",
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
          
          exports.getUserEmergencyRequests = async (req, res) => {
            try {
              const token = req.cookies.jwt_signup || req.cookies.jwt_login;
              if (!token) {
                return res.status(401).json({
                  success: false,
                  message: "Unauthorized"
                });
              }
          
              const decoded = jwt.verify(token, process.env.JWT_SECRET);
              const userId = decoded.id;
          
              // Find all emergency requests for the user and populate service provider details
              const requests = await Emergency.find({ user: userId })
                .populate({
                  path: 'service_provider',
                  select: 'name type rating contact location'
                })
                .populate('user', 'name mobile location')
                .sort({ created_at: -1 });
          
              return res.status(200).json({
                success: true,
                message: "User emergency requests retrieved successfully",
                data: requests
              });
            } catch (error) {
              console.error("Error fetching user emergency requests:", error);
              return res.status(500).json({
                success: false,
                message: "Internal server error"
              });
            }
          };
          
          exports.deleteEmergencyRequest = async (req, res) => {
            try {
              const token = req.cookies.jwt_signup || req.cookies.jwt_login;
              if (!token) {
                return res.status(401).json({
                  success: false,
                  message: "Unauthorized"
                });
              }
          
              const decoded = jwt.verify(token, process.env.JWT_SECRET);
              const userId = decoded.id;
          
              const { requestId } = req.params;
              if (!requestId) {
                return res.status(400).json({
                  success: false,
                  message: "Request ID is required"
                });
              }
          
              const emergencyRequest = await Emergency.findById(requestId);
              if (!emergencyRequest) {
                return res.status(404).json({
                  success: false,
                  message: "Emergency request not found"
                });
              }
          
              // Check if the request belongs to the user
              if (emergencyRequest.user.toString() !== userId) {
                return res.status(403).json({
                  success: false,
                  message: "Not authorized to delete this request"
                });
              }
          
              if (emergencyRequest.status === "accepted") {
                // If request is accepted, mark it as deleted by user
                emergencyRequest.status = "deleted_by_user";
                await emergencyRequest.save();
              } else {
                // If request is pending, remove it completely
                await Emergency.findByIdAndDelete(requestId);
              }
          
              return res.status(200).json({
                success: true,
                message: "Emergency request deleted successfully"
              });
            } catch (error) {
              console.error("Error deleting emergency request:", error);
              return res.status(500).json({
                success: false,
                message: "Internal server error"
              });
            }
          };
                    