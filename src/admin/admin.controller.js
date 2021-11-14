const { Op } = require('sequelize');

const bestProfessions = (req, res, next) => {
	// fetch models and sequelize
	const { Contract, Profile, Job } = req.app.get('models');
	const sequelize = req.app.get('sequelize');
	
	let { start, end } = req.query;
	[start, end] = [new Date(start).toISOString(), new Date(end).toISOString()];

	// We can even seperate data access layer(services), rn doing it right away to save time
	Job.findOne({
		attributes: [
			[sequelize.col('Contract.Contractor.profession'), 'profession'],
			[sequelize.fn('SUM', sequelize.col('price')), 'paid'],
		],
		where: {
			paymentDate: {
				[Op.between]: [start, end],
			},
			paid: true,
		},
		group: ['Contract.Contractor.profession'],
		include: [
			{
				model: Contract,
				attributes: [],
				include: [
					{
						model: Profile,
						as: 'Contractor',
						attributes: [],
					},
				],
			},
		],
		order: [[sequelize.col('paid'), 'DESC']],
	})
		.then((data) => res.json(data))
		.catch((err) => next(err));
};

const bestClients = (req, res, next) => {
	// fetch models and sequelize
	const { Contract, Profile, Job } = req.app.get('models');
	const sequelize = req.app.get('sequelize');
	
	const { limit = 2 } = req.query;
	let { start, end } = req.query;
	[start, end] = [new Date(start).toISOString(), new Date(end).toISOString()];
	// We can even seperate data access layer(services), rn doing it right away to save time
	Job.findAll({
		attributes: [
			[sequelize.col('Contract.Client.id'), 'id'],
			[sequelize.fn('SUM', sequelize.col('price')), 'paid'],
			[sequelize.literal("firstName || ' ' || lastName"), 'fullName'],
		],
		group: ['Contract.Client.id'],
		where: {
			paymentDate: { [Op.between]: [start, end] },
			paid: true,
		},
		include: [
			{
				model: Contract,
				attributes: [],
				include: [
					{
						model: Profile,
						as: 'Client',
						attributes: [],
					},
				],
			},
		],
		order: [[sequelize.col('paid'), 'DESC']],
		limit,
	})
		.then((data) => res.json(data))
		.catch((err) => next(err));
};

module.exports = {
	bestProfessions,
	bestClients,
};
