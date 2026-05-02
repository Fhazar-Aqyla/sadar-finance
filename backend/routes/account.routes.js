/**
 * Account Routes
 */
const { Router } = require('express');
const accountController = require('../controllers/account.controller');
const authenticate = require('../middlewares/authenticate');
const validate = require('../middlewares/validate');
const { createAccountSchema, updateAccountSchema } = require('../validators/account.validator');

const router = Router();
router.use(authenticate);

router.post('/', validate(createAccountSchema), accountController.createAccount);
router.get('/', accountController.getAccounts);
router.get('/:id', accountController.getAccount);
router.put('/:id', validate(updateAccountSchema), accountController.updateAccount);
router.delete('/:id', accountController.deleteAccount);

module.exports = router;
