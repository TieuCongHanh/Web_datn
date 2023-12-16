var express = require('express');
var router = express.Router();
var doanhthuCtrl = require('../controllers/doanhthu.controller');
const bodyParser = require('body-parser');
var check_login = require('../middlewares/check_login');
const multer  = require('multer')
const upload = multer({ dest: './tmp' })


router.use(bodyParser.urlencoded({extended:false}));
router.get('/:i',check_login.yeu_cau_dang_nhap, doanhthuCtrl.list);
router.get('/',check_login.yeu_cau_dang_nhap, doanhthuCtrl.list);
router.get('/:i/in',check_login.yeu_cau_dang_nhap, doanhthuCtrl.in);
router.post('/:i/in', check_login.yeu_cau_dang_nhap, doanhthuCtrl.in);
router.get('/:i/print',check_login.yeu_cau_dang_nhap, doanhthuCtrl.print);
router.post('/:i/print', check_login.yeu_cau_dang_nhap, doanhthuCtrl.print);


module.exports = router;
