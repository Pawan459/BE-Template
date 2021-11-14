const { Op, ValidationError, EmptyResultError } = require('sequelize');

const payForJob = async (req, res, next) => {
	// fetch models and sequelize
	const { Contract, Profile, Job } = req.app.get('models');
	const sequelize = req.app.get('sequelize');
	
	const { job_id } = req.params;
	const { amount } = req.body;

	// We can even seperate data access layer(services), rn doing it right away to save time
	// isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE

	let transaction;

	try {
		transaction = await sequelize.transaction();
		const job = await Job.findByPk(job_id, {
			transaction,
			attributes: ['price', 'paid'],
			include: [
				{
					model: Contract,
					attributes: ['ClientId', 'ContractorId'],
					where: {
						status: { [Op.ne]: 'terminated' },
					},
				},
			],
		});

		if (!job || job.price !== amount)
			throw new EmptyResultError('Invalid Job Id or amount');
		if (job.paid) throw new ValidationError('Payment already initiated');

		const { ClientId, ContractorId } = job.Contract;
		const client = await Profile.findByPk(ClientId, {
			transaction,
			attributes: ['balance'],
		});
		const contractor = await Profile.findByPk(ContractorId, {
			transaction,
			attributes: ['balance'],
		});

		if (!client || !contractor) throw new EmptyResultError('Invalid client or contractor');

		if (client.balance < amount)
			throw new ValidationError('Insufficient balance in account');

		// Update the balance of client and contractor and job paid status
		await Profile.update(
			{
				balance: client.balance - amount,
			},
			{
				where: { id: ClientId },
				transaction,
			}
		);
		await Profile.update(
			{
				balance: contractor.balance + amount,
			},
			{
				where: { id: ContractorId },
				transaction,
			}
		);
		await Job.update(
			{
				paid: true,
			},
			{
				where: { id: job_id },
				transaction,
			}
		);

		await transaction.commit();

		return res.status(200).json({
			message: 'Payment successful',
		});
	} catch (err) {
		await transaction.rollback();
		return next(err);
	}
};

const getUnPaidJobs = (req, res, next) => {
	// fetch models and sequelize
	const { Contract, Job } = req.app.get('models');
	
	const { profile } = req;

	// We can even seperate data access layer(services), rn doing it right away to save time
	Job.findAll({
		where: { paid: {[Op.not]: true} },
		attributes: {
			exclude: ['createdAt', 'updatedAt', 'ContractId'],
		},
		include: [
			{
				model: Contract,
				where: {
					status: { [Op.ne]: 'terminated' },
					[Op.or]: [{ ContractorId: profile.id }, { ClientId: profile.id }],
				},
				attributes: {
					exclude: ['id', 'createdAt', 'updatedAt', 'ContractorId', 'ClientId'],
				},
			},
		],
	})
		.then((data) => res.json(data))
		.catch((err) => next(err));
};

module.exports = {
	getUnPaidJobs,
	payForJob,
};
