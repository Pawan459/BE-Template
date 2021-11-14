const { Router } = require('express');
const { getProfile } = require('../middleware/getProfile');
const { getContractById, getAllContracts } = require('./contracts.controller');

const contractRouter = Router();

contractRouter.use(getProfile)
contractRouter.get('/:id', getContractById);
contractRouter.get('/', getAllContracts);

module.exports = contractRouter;