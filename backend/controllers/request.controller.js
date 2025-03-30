const Request = require("../models/request.model");
const { responseFormatter } = require("../utils/responseFormatter");

// Create new request
exports.createRequest = async (req, res) => {
  try {
    const {
      latlon,
      title,
      describe_problem,
      vehical_info,
      advance
    } = req.body;

    const request = new Request({
      latlon,
      title,
      describe_problem,
      vehical_info,
      advance,
      user: req.user.id // From auth middleware
    });

    await request.save();

    return responseFormatter(res, 201, true, "Request created successfully", { request });
  } catch (err) {
    console.error("Create request error:", err);
    return responseFormatter(res, 500, false, "Server error", null, err.message);
  }
};

// Get user's requests (for users to see their own requests)
exports.getUserRequests = async (req, res) => {
  try {
    const requests = await Request.find({ user: req.user.id })
      .populate('service_provider', 'name contact')
      .sort({ createdAt: -1 });

    return responseFormatter(res, 200, true, "Requests retrieved successfully", { requests });
  } catch (err) {
    console.error("Get user requests error:", err);
    return responseFormatter(res, 500, false, "Server error", null, err.message);
  }
};

// Get single request details
exports.getRequestById = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('user', 'name email mobile')
      .populate('service_provider', 'name contact');

    if (!request) {
      return responseFormatter(res, 404, false, "Request not found");
    }

    // Check if the user is authorized to view this request
    if (request.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return responseFormatter(res, 403, false, "Not authorized to view this request");
    }

    return responseFormatter(res, 200, true, "Request retrieved successfully", { request });
  } catch (err) {
    console.error("Get request error:", err);
    return responseFormatter(res, 500, false, "Server error", null, err.message);
  }
};

// Update request (only certain fields can be updated by user)
exports.updateRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return responseFormatter(res, 404, false, "Request not found");
    }

    // Check if the user owns this request
    if (request.user.toString() !== req.user.id) {
      return responseFormatter(res, 403, false, "Not authorized to update this request");
    }

    // Only allow updates if request is still pending
    if (request.status !== 'pending') {
      return responseFormatter(res, 400, false, "Cannot update request after it has been accepted");
    }

    const allowedUpdates = {
      describe_problem: req.body.describe_problem,
      vehical_info: req.body.vehical_info,
      advance: req.body.advance
    };

    const updatedRequest = await Request.findByIdAndUpdate(
      req.params.id,
      { $set: allowedUpdates },
      { new: true }
    ).populate('service_provider', 'name contact');

    return responseFormatter(res, 200, true, "Request updated successfully", { request: updatedRequest });
  } catch (err) {
    console.error("Update request error:", err);
    return responseFormatter(res, 500, false, "Server error", null, err.message);
  }
};

// Cancel request (user can only cancel pending requests)
exports.cancelRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return responseFormatter(res, 404, false, "Request not found");
    }

    // Check if the user owns this request
    if (request.user.toString() !== req.user.id) {
      return responseFormatter(res, 403, false, "Not authorized to cancel this request");
    }

    // Only allow cancellation if request is still pending
    if (request.status !== 'pending') {
      return responseFormatter(res, 400, false, "Cannot cancel request after it has been accepted");
    }

    await Request.findByIdAndDelete(req.params.id);

    return responseFormatter(res, 200, true, "Request cancelled successfully");
  } catch (err) {
    console.error("Cancel request error:", err);
    return responseFormatter(res, 500, false, "Server error", null, err.message);
  }
};

// Get nearby pending requests (for service providers)
exports.getNearbyRequests = async (req, res) => {
  try {
    const { latitude, longitude, maxDistance = 10000 } = req.query; // maxDistance in meters

    const requests = await Request.find({
      status: 'pending',
      'latlon': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      }
    }).populate('user', 'name mobile');

    return responseFormatter(res, 200, true, "Nearby requests retrieved successfully", { requests });
  } catch (err) {
    console.error("Get nearby requests error:", err);
    return responseFormatter(res, 500, false, "Server error", null, err.message);
  }
};