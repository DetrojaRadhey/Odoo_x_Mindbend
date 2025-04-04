const express = require('express');
const router = express.Router();
const requestController = require('../controllers/request.controller');
// const { protect } = require('../middleware/auth.middleware');

// User routes
router.post('/createRequest', requestController.createRequest);
router.get('/my-requests',  requestController.getUserRequests);
router.get('/:id',  requestController.updateRequest);
router.delete('/:id',  requestController.cancelRequest);
router.post('/accept-provider', requestController.userAcceptedProvider);

// Service Provider routes
router.get('/provider/requests', requestController.getRequestToServiceProvider);
router.post('/accept-request', requestController.providerAcceptRequest);
// router.get('/nearby',  requestController.getNearbyRequests);

module.exports = router;