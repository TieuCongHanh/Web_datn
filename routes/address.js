const express = require('express');
const router = express.Router();
const addressController = require('../controllers/address.controllers');


router.get('/:id', addressController.getListAddressByUsedId);
router.post('/add', addressController.addAddress);
router.post('/remove', addressController.removeAddress);

module.exports = router;