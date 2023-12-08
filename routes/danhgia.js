var express = require('express');
var router = express.Router();
var ratingCtrl = require('../controllers/rating.controllers');
const bodyParser = require('body-parser');
var check_login = require('../middlewares/check_login');
const multer  = require('multer')
const upload = multer({ dest: './tmp' })


router.use(bodyParser.urlencoded({extended:false}));
router.get('/:i',check_login.yeu_cau_dang_nhap, ratingCtrl.listRating);
router.get('/',check_login.yeu_cau_dang_nhap, ratingCtrl.listRating);
router.get('/:i/in',check_login.yeu_cau_dang_nhap, ratingCtrl.in);
router.post('/:i/in', check_login.yeu_cau_dang_nhap, ratingCtrl.in);
router.get('/:i/print',check_login.yeu_cau_dang_nhap, ratingCtrl.print);
router.post('/:i/print', check_login.yeu_cau_dang_nhap, ratingCtrl.print);


module.exports = router;
