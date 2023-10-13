var express = require('express');
var router = express.Router();
var loaispCtrl = require('../controllers/sanpham.controllers');
const bodyParser = require('body-parser');
var check_login = require('../middlewares/check_login');
const multer  = require('multer')
const upload = multer({ dest: './tmp' })

router.use( (req, res, next) => {
    console.log("---- Dòng này là middleware ---- ");
    next();
});



router.use(bodyParser.urlencoded({extended:false}));

router.get('/:i',check_login.yeu_cau_dang_nhap, loaispCtrl.list);
router.get('/',check_login.yeu_cau_dang_nhap, loaispCtrl.list);

router.get('/:i/add', upload.single("productImage"),check_login.yeu_cau_dang_nhap, loaispCtrl.add);
router.post('/:i/add', upload.single("productImage"),check_login.yeu_cau_dang_nhap, loaispCtrl.add);

router.get('/:i/in',check_login.yeu_cau_dang_nhap, loaispCtrl.in);
router.post('/:i/in', check_login.yeu_cau_dang_nhap, loaispCtrl.in);

router.get('/:i/print',check_login.yeu_cau_dang_nhap, loaispCtrl.print);
router.post('/:i/print', check_login.yeu_cau_dang_nhap, loaispCtrl.print);
//edit
router.get('/edit/:id',upload.single("productImage"),check_login.yeu_cau_dang_nhap, loaispCtrl.edit);
router.post('/edit/:id',upload.single("productImage"),check_login.yeu_cau_dang_nhap, loaispCtrl.edit);


//delete
router.post('/delete',loaispCtrl.deleteLoai);
router.get('/:loaisp',check_login.yeu_cau_dang_nhap, loaispCtrl.list)


module.exports = router;
