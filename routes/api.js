var express = require('express');
var router = express.Router();
var user_api=require('../controllers/api/user.api');
var productApi = require('../controllers/api/product.api');
var orderApi = require('../controllers/api/order.api');
var categoryApi = require('../controllers/api/category.api');
var addressApi = require('../controllers/api/address.api');
var ratingApi = require('../controllers/api/rating.api');
var notifiApi = require('../controllers/api/notification.api');

const uploadCloud = require('../middlewares/uploadImage');


// user
router.get('/user/list', user_api.list);
router.post('/user/login', user_api.Login);
router.post('/user/logup', user_api.Reg);
router.post('/user/changePassword', user_api.changePassword);
router.put('/user/edit/:id',uploadCloud.single('image'), user_api.edit);

// product
router.get('/product/list', productApi.list);

// category
router.get('/category/list', categoryApi.list);

// order
router.get('/order/ordered/:id_user', orderApi.ordered);
router.post('/order/add', orderApi.addOrder);

// address
router.get('/address/list', addressApi.list);
router.post('/address/add', addressApi.add);
router.put('/address/update/:id', addressApi.update);
router.delete('/address/delete/:id', addressApi.delete);

// rating
router.get('/rating/list', ratingApi.list);
router.post('/rating/add', ratingApi.add);
router.delete('/rating/delete', ratingApi.delete);

// notification
router.get('/notification/list', notifiApi.getNotificationsByUserId);
router.get('/notification/delete', notifiApi.delete);

module.exports = router;