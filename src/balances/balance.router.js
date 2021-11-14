const { Router } = require('express');
const { getProfile } = require('../middleware/getProfile');
const { depositMoney } = require('./balances.controller');


const balanceRouter = Router();

balanceRouter.use(getProfile)
balanceRouter.post('/deposit/:userId', depositMoney);

module.exports = balanceRouter;