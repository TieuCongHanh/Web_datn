const express = require('express');
const router = express.Router();
const ordersController = require('../controllers/ordersController');


router.get('/orders', ordersController.getAllOrders);

router.post('/orders', ordersController.createOrder);

router.get('/orders/:id', ordersController.getOrderById);

module.exports = router;