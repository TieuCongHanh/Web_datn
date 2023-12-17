var express = require('express');
var router = express.Router();
var loaispCtrl = require('../controllers/sanpham.controllers');
const bodyParser = require('body-parser');
var check_login = require('../middlewares/check_login');
const uploadCloud = require('../middlewares/uploadImage');


router.use(bodyParser.urlencoded({extended:false}));

router.get('/:i',check_login.yeu_cau_dang_nhap, loaispCtrl.list);

router.get('/:i/add', uploadCloud.array("productImage") ,check_login.yeu_cau_dang_nhap, loaispCtrl.add);
router.post('/:i/add', uploadCloud.array("productImage") ,check_login.yeu_cau_dang_nhap, loaispCtrl.add);

router.get('/:i/in',check_login.yeu_cau_dang_nhap, loaispCtrl.in);
router.post('/:i/in', check_login.yeu_cau_dang_nhap, loaispCtrl.in);

router.get('/:i/print',check_login.yeu_cau_dang_nhap, loaispCtrl.print);
router.post('/:i/print', check_login.yeu_cau_dang_nhap, loaispCtrl.print);
//edit
router.get('/edit/:id',uploadCloud.array("productImage"),check_login.yeu_cau_dang_nhap, loaispCtrl.edit);
router.post('/edit/:id',uploadCloud.array("productImage"),check_login.yeu_cau_dang_nhap, loaispCtrl.edit);


//delete
router.post('/delete',loaispCtrl.deleteLoai);
router.get('/:loaisp',check_login.yeu_cau_dang_nhap, loaispCtrl.list)

router.post('/import',check_login.yeu_cau_dang_nhap, loaispCtrl.import)
router.get('/detail/:productId',check_login.yeu_cau_dang_nhap, loaispCtrl.getProduct)

router.post('/updateDislay',check_login.yeu_cau_dang_nhap , loaispCtrl.updateDislay);

module.exports = router;
