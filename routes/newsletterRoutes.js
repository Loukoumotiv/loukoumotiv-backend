const express = require('express');
const router = express.Router();

const { subscribe, getAllSubscribed, getSubscriber, unsubscribe } = require('../controllers/newsletterController');
const { isAuthenticated } = require("../middleware/auth");

router.post('/subscribe', subscribe);
router.get('/getAll', getAllSubscribed);
router.get('/getById/:Id', getSubscriber)

router.delete('/unsubscribe/:Id', isAuthenticated('admin'), unsubscribe);

module.exports = router;