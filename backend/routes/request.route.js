const express = require('express');
const router = express.Router();
const requestController = require('../controllers/request.controller');
// const { protect } = require('../middleware/auth.middleware');

// User routes
router.post('/createRequest', requestController.createRequest);
router.get('/my-requests',  requestController.getUserRequests);
router.get('/:id',  requestController.updateRequest);
router.delete('/:id',  requestController.cancelRequest);

// Service Provider routes
router.get('/nearby',  requestController.getNearbyRequests);

module.exports = router;