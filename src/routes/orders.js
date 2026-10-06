const router = require('express').Router();
const requireAuth = require('../middleware/requireAuth');
const ordersController = require('../controllers/ordersController');

router.get('/orders', requireAuth, ordersController.list);

module.exports = router;
