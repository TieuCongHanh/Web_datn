const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const ordersController = require('../controllers/orders.controller');


router.use(bodyParser.urlencoded({extended:false}));

router.get('/:i',ordersController.list);
router.get('/',ordersController.list);

router.get('/:i/in', ordersController.in);
router.post('/:i/in',  ordersController.in);

router.get('/:i/print', ordersController.print);
router.post('/:i/print',  ordersController.print);

router.get('/detail/:orderId', ordersController.details);

module.exports = router;