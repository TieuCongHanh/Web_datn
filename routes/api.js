var express = require('express');
var router = express.Router();
var user_api=require('../controllers/api/user.api');
var productApi = require('../controllers/api/product.api');
var orderApi = require('../controllers/api/order.api');

// user
router.post('/user/login', user_api.Login);
router.post('/user/logup', user_api.Reg);

// product
router.get('/product/list', productApi.list);

// order
router.get('/order/ordered', orderApi.ordered);
router.post('/order/add', orderApi.addOrder);



module.exports = router;