const express = require('express');
const router = express.Router();

const { addPartner, getByType, getPartner, getAllPartners, deletePartner, updatePartner } = require('../controllers/partnersController');
const { isAuthenticated } = require("../middleware/auth");

router.get('/getAll', getAllPartners);
router.get('/getById/:Id', getPartner);
router.get('/getByType', getByType);

router.post('/add', isAuthenticated('admin'), addPartner);
router.delete('/delete/:Id', isAuthenticated('admin'), deletePartner);
router.put('/update/:Id', isAuthenticated('admin'), updatePartner);

module.exports = router;