const supertest = require('supertest');
const app = require('../app');

describe('Balance Controller Tests', () => {
	let request;

	beforeEach(() => {
		request = supertest.agent(app).set('profile_id', 2);
	});

	describe('POST /balances/deposit/:userId', () => {
		it('should return the invalid userId when the userId is not present in the records', async () => {
			const res = await request
				.post('/balances/deposit/9')
				.send({
					amount: 400,
				})
				.expect('Content-Type', /json/)
				.expect(404);

			expect(res.body).toMatchObject({
				message: 'Invalid userid',
			});
		});

		it('should return the invalid userId when the userId requested is a contractor', async () => {
			const res = await request
				.post('/balances/deposit/5')
				.send({
					amount: 400,
				})
				.expect('Content-Type', /json/)
				.expect(404);

			expect(res.body).toMatchObject({
				message: 'Invalid userid',
			});
		});

		it('should not process the request when the deposited amount is greater than the 25% of client debts', async () => {
			const res = await request
				.post('/balances/deposit/2')
				.send({
					amount: 400,
				})
				.expect('Content-Type', /json/)
				.expect(400);

			expect(res.body).toMatchObject({
				message:
					'deposited amount more than the 25% of all debts of the client',
			});
		});

		it('should process the request when the deposited amount is lesser than the 25% of client debts', async () => {
			const res = await request
				.post('/balances/deposit/2')
				.send({
					amount: 40,
				})
				.expect('Content-Type', /json/)
				.expect(200);

			expect(res.body).toMatchObject({
				message: 'amount deposited successfully',
			});
		});
	});
});
