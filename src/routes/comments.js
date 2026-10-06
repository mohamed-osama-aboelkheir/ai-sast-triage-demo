const router = require('express').Router();
const requireAuth = require('../middleware/requireAuth');
const commentsController = require('../controllers/commentsController');

router.get('/comments', commentsController.index);
router.post('/comments', requireAuth, commentsController.create);

module.exports = router;
