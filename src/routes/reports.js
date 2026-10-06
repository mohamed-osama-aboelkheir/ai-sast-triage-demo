const router = require('express').Router();
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');
const reportsController = require('../controllers/reportsController');

router.get('/reports/:reportId', requireAuth, requireRole('admin'), reportsController.show);

module.exports = router;
