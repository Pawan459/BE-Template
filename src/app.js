const express = require('express');
const { ValidationError, EmptyResultError } = require('sequelize');

const {sequelize} = require('./model')
const contractRouter = require('./contracts/contracts.router');
const jobsRouter = require('./jobs/jobs.router');
const balanceRouter = require('./balances/balance.router');
const adminRouter = require('./admin/admin.router');

const app = express();
app.use(express.json());
app.set('sequelize', sequelize)
app.set('models', sequelize.models)

/**
 * FIX ME!
 * @returns contract by id
 */
app.use('/contracts', contractRouter);
app.use('/jobs', jobsRouter);
app.use('/balances', balanceRouter);
app.use('/admin', adminRouter);

app.use(function (err, _req, res, _next) {
  if (err instanceof ValidationError) {
    return res.status(400).json({
      message: err.message || 'Invalid/Bad request, please check and try again!!'
    })
  }
  else if (err instanceof EmptyResultError) {
    return res.status(404).json({
      message: err.message || 'Resource not found, please check and try again!!'
    })
  }

  return res.status(500).json({
    message: err.message || 'Something went wrong, please try again!!'
  });
});

app.get('*', (_req, res) => {
  return res.status(404).json({
    message: 'Requested resource not found, please check the enpoint once again'
  })
})

module.exports = app;
