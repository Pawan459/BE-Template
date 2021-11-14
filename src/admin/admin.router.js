const { Router } = require('express');
const { getProfile } = require('../middleware/getProfile');
const { bestProfessions, bestClients } = require('./admin.controller');


const adminRouter = Router();

adminRouter.use(getProfile)
adminRouter.get('/best-profession', bestProfessions);
adminRouter.get('/best-clients', bestClients);

module.exports = adminRouter;