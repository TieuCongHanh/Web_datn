const express = require('express');
const router = express.Router();
const categoryCtr = require('../controllers/category.controller');

router.get('/:i',categoryCtr.list);
router.get('/',categoryCtr.list);

router.get('/:i/in', categoryCtr.in);
router.post('/:i/in',  categoryCtr.in);

router.get('/:i/print', categoryCtr.print);
router.post('/:i/print',  categoryCtr.print);

router.post('/delete',categoryCtr.deleteLoai);
router.post('/add',categoryCtr.add);
router.post('/edit',categoryCtr.edit);

router.get('/edit/:categoryId', categoryCtr.getEdit);



module.exports = router;