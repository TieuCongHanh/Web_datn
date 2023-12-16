var express = require('express');
var router = express.Router();
var userCtrl = require('../controllers/user.controllers');
const bodyParser = require('body-parser');
var check_login = require('../middlewares/check_login');
const uploadCloud = require('../middlewares/uploadImage');



router.use(bodyParser.urlencoded({extended:false}));
router.get('/:i',check_login.yeu_cau_dang_nhap, userCtrl.list);
router.get('/',check_login.yeu_cau_dang_nhap, userCtrl.list);

router.get('/:i/add', uploadCloud.single("productImage"),check_login.yeu_cau_dang_nhap, userCtrl.add);
router.post('/:i/add', uploadCloud.single("productImage"),check_login.yeu_cau_dang_nhap, userCtrl.add);

router.get('/:i/in',check_login.yeu_cau_dang_nhap, userCtrl.in);
router.post('/:i/in', check_login.yeu_cau_dang_nhap, userCtrl.in);

router.get('/:i/print',check_login.yeu_cau_dang_nhap, userCtrl.print);
router.post('/:i/print', check_login.yeu_cau_dang_nhap, userCtrl.print);
//edit
router.get('/edit/:id',uploadCloud.single("productImage"),check_login.yeu_cau_dang_nhap, userCtrl.edit);
router.post('/edit/:id',uploadCloud.single("productImage"),check_login.yeu_cau_dang_nhap, userCtrl.edit);


//delete
router.post('/delete',userCtrl.deleteUser);
router.get('/:user',check_login.yeu_cau_dang_nhap, userCtrl.list)

router.get('/1/setting',uploadCloud.single("productImage"),check_login.yeu_cau_dang_nhap, userCtrl.setting);
router.post('/1/setting',uploadCloud.single("productImage"),check_login.yeu_cau_dang_nhap, userCtrl.setting);

module.exports = router;
