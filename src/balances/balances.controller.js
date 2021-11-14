const { Op, ValidationError, EmptyResultError } = require('sequelize');

const depositMoney = async (req, res, next) => {
	// fetch models and sequelize
	const { Contract, Profile, Job } = req.app.get('models');
	const sequelize = req.app.get('sequelize');

	const { userId } = req.params;
	const { amount } = req.body;

	// We can even seperate data access layer(services), rn doing it right away to save time
	let transaction;
	try {
		const user = await Profile.findOne({
			where: {
				id: userId,
				type: 'client',
			},
			attributes: ['balance'],
		});

		if (!user) throw new EmptyResultError('Invalid userid');

		const debtPrice = await Job.sum('price', {
			where: {
				paid: { [Op.not]: true },
			},
			include: [
				{
					model: Contract,
					attributes: [],
					where: {
						status: { [Op.ne]: 'terminated' },
						ClientId: userId,
					},
				},
			],
		});

		if (amount > debtPrice / 4)
			throw new ValidationError(
				'deposited amount more than the 25% of all debts of the client'
			);
		
		transaction = await sequelize.transaction();
		await Profile.update(
			{
				balance: user.balance + amount,
			},
			{
				where: {
					id: userId,
				},
				transaction,
			}
		);

		await transaction.commit();

		return res.status(200).json({
			message: 'amount deposited successfully',
		});
	} catch (err) {
		if(transaction) await transaction.rollback();
		next(err);
	}
};

module.exports = {
	depositMoney,
};
