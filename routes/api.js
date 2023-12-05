var express = require('express');
var router = express.Router();
var user_api=require('../controllers/api/user.api');
var productApi = require('../controllers/api/product.api');
var orderApi = require('../controllers/api/order.api');
var categoryApi = require('../controllers/api/category.api');
var addressApi = require('../controllers/api/address.api');


// user
router.post('/user/login', user_api.Login);
router.post('/user/logup', user_api.Reg);

// product
router.get('/product/list', productApi.list);
router.get('/product/filter/:id_category', productApi.filterCategory);

// category
router.get('/category/list', categoryApi.list);

// order
router.get('/order/ordered', orderApi.ordered);
router.post('/order/add', orderApi.addOrder);

// address
router.get('/address/list', addressApi.list);
router.post('/address/add', addressApi.add);
router.put('/address/update/:id', addressApi.update);
router.delete('/address/delete/:id', addressApi.delete);



module.exports = router;