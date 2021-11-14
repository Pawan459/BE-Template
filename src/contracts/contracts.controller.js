const { Op } = require('sequelize');

const getContractById = (req, res, next) => {
	// fetch models and sequelize
	const { Contract } = req.app.get('models');
	
	const { id } = req.params;
	const { profile } = req;

	// We can even seperate data access layer(services), rn doing it right away to save time
	Contract.findOne({
    where: {
			id,
			ContractorId: profile.id
      // status: { [Op.ne]: 'terminated' }
    },
		attributes: ['id','status', 'terms'],
	})
		.then((data) => res.json(data))
		.catch((err) => next(err));
};

const getAllContracts = (req, res, next) => {
	// fetch models and sequelize
	const { Contract } = req.app.get('models');
	
	const { profile } = req;

	// We can even seperate data access layer(services), rn doing it right away to save time
	Contract.findAll({
		where: {
			status: { [Op.ne]: 'terminated' },
			ContractorId: profile.id
		},
		attributes: ['status', 'terms', 'id'],
	})
		.then((data) => res.json(data))
		.catch((err) => next(err));
};

module.exports = {
	getContractById,
	getAllContracts,
};
