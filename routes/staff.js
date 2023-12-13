var express = require('express');
var router = express.Router();
var staffCtrl = require('../controllers/staff.controller');
const bodyParser = require('body-parser');
const uploadCloud = require('../middlewares/uploadImage');


router.use(bodyParser.urlencoded({extended:false}));
router.get('/:i', staffCtrl.list);
router.get('/', staffCtrl.list);

router.get('/:i/add', uploadCloud.single("staffImage"), staffCtrl.add);
router.post('/:i/add', uploadCloud.single("staffImage"), staffCtrl.add);

router.get('/:i/in', staffCtrl.in);
router.post('/:i/in', staffCtrl.in);

router.get('/:i/print', staffCtrl.print);
router.post('/:i/print', staffCtrl.print);
//edit
router.get('/edit/:id',uploadCloud.single("staffImage"), staffCtrl.edit);
router.post('/edit/:id',uploadCloud.single("staffImage"), staffCtrl.edit);

//delete
router.post('/delete',staffCtrl.deleteStaff);
router.get('/:staffId', staffCtrl.list);

module.exports = router;
