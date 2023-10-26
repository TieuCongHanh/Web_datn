var express = require('express');
var router = express.Router();

var user_api=require('../../controllers/api/user.api');

router.post('/user/login',user_api.Login);
router.post('/user/logup',user_api.Reg);
module.exports = router;