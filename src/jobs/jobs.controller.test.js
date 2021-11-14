const supertest = require('supertest');
const app = require('../app');

describe('Jobs Controller Tests', () => {
	let request;

	beforeEach(() => {
		request = supertest.agent(app).set('profile_id', 6);
  });

	describe('GET /jobs/unpaid', () => {
		it('should return the unpaid jobs associated with the requesting client', async () => {
			const res = await request
				.get('/jobs/unpaid')
				.send()
				.expect('Content-Type', /json/)
				.expect(200);

			expect(res.body.length).toBe(2);
			expect(res.body).toMatchObject([
				{
					id: 2,
					description: 'work',
					price: 201,
					paid: null,
					paymentDate: null,
					Contract: {
						terms: 'bla bla bla',
						status: 'in_progress',
					},
				},
				{
					id: 3,
					description: 'work',
					price: 202,
					paid: null,
					paymentDate: null,
					Contract: {
						terms: 'bla bla bla',
						status: 'in_progress',
					},
				},
			]);

			const isUnPaidJobs = res.body.every((item) => !item.paid);
			expect(isUnPaidJobs).toBeTruthy();
		});

		it('should return empty list for unpaid jobs associated with the requesting client', async () => {
			const res = await request
				.set('profile_id', 8)
				.get('/jobs/unpaid')
				.send()
				.expect('Content-Type', /json/)
				.expect(200);

			expect(res.body.length).toBe(0);
			expect(res.body).toMatchObject([]);
		});

		it('should not authorize fethcing unpaid jobs of unauthorized client', async () => {
			const res = await request
				.set('profile_id', 9)
				.get('/jobs/unpaid')
				.send()
				.expect(401);
		});
	});

	describe('POST /jobs/:job_id/pay', () => {
		it('should not process the job with the invalid job id', async () => {
			const res = await request
				.post('/jobs/0/pay')
				.send({
					amount: 201,
				})
				.expect('Content-Type', /json/)
				.expect(404);

			expect(res.body).toMatchObject({
				message: 'Invalid Job Id or amount',
			});
		});

		it('should not process the job with the amount to be paid less than the mentioned job price', async () => {
			const res = await request
				.post('/jobs/2/pay')
				.send({
					amount: 200,
				})
				.expect('Content-Type', /json/)
				.expect(404);

			expect(res.body).toMatchObject({
				message: 'Invalid Job Id or amount',
			});
		});

		it('should not process the job with the amount to be paid more than the mentioned job price', async () => {
			const res = await request
				.post('/jobs/2/pay')
				.send({
					amount: 400,
				})
				.expect('Content-Type', /json/)
				.expect(404);

			expect(res.body).toMatchObject({
				message: 'Invalid Job Id or amount',
			});
		});

		it('should not process the job which is already paid', async () => {
			const res = await request
				.post('/jobs/6/pay')
				.send({
					amount: 2020,
				})
				.expect('Content-Type', /json/)
				.expect(400);

			expect(res.body).toMatchObject({
				message: 'Payment already initiated',
			});
		});

		it('should process the job which is unpaid and with valid job', async () => {
			const res = await request
				.post('/jobs/2/pay')
				.send({
					amount: 201,
				})
				.expect('Content-Type', /json/)
				.expect(200);

			expect(res.body).toMatchObject({
				message: 'Payment successful',
			});
		});

		it('should not process the job which is already paid just now', async () => {
			const res = await request
				.post('/jobs/2/pay')
				.send({
					amount: 201,
				})
				.expect('Content-Type', /json/)
				.expect(400);

			expect(res.body).toMatchObject({
				message: 'Payment already initiated',
			});
		});

		it('should not authorize paying jobs for unauthorized client', async () => {
			const res = await request
				.set('profile_id', 9)
				.post('/jobs/2/pay')
				.send({
					amount: 40,
				})
				.expect(401);
		});
	});
});
