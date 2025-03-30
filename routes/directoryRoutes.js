const express = require('express');
const router = express.Router();

const { addContact, getAllContacts, getContact, deleteContact, updateContact } = require('../controllers/directoryController');
const { isAuthenticated } = require("../middleware/auth");

router.get('/getAll', getAllContacts);
router.get('/getById/:Id', getContact);

router.post('/add', isAuthenticated('admin'), addContact);
router.delete('/delete/:Id', isAuthenticated('admin'), deleteContact);
router.put('/update/:Id', isAuthenticated('admin'), updateContact);

module.exports = router;