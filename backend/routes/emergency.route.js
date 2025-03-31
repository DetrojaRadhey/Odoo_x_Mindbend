const express = require("express");
const router = express.Router();

const emergencyController = require("../controllers/emergency.controller");

router.post("/showRequests", emergencyController.showRequests);

module.exports = router;
