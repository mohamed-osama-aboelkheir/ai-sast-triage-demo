const router = require('express').Router();
const requireAuth = require('../middleware/requireAuth');
const exportsController = require('../controllers/exportsController');

router.get('/exports', requireAuth, exportsController.download);

module.exports = router;
