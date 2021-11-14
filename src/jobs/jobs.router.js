const { Router } = require('express');
const { getProfile } = require('../middleware/getProfile');
const { getUnPaidJobs, payForJob } = require('./jobs.controller');


const jobsRouter = Router();

jobsRouter.use(getProfile)
jobsRouter.get('/unpaid', getUnPaidJobs);
jobsRouter.post('/:job_id/pay', payForJob);

module.exports = jobsRouter;