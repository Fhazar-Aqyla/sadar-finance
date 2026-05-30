const { Router } = require('express');
const categoryController = require('../controllers/category.controller');
const authenticate = require('../middlewares/authenticate');

const router = Router();
router.use(authenticate);

router.get('/', categoryController.getCategories);

module.exports = router;
