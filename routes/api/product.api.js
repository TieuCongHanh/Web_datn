var express = require('express');
var router = express.Router();

var product_api=require('../../controllers/api/product.api');

router.post('/product/list',product_api.Login);
router.post('/user/logup',product_api.Reg);
module.exports = router;