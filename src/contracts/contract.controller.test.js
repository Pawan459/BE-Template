const supertest = require('supertest');
const app = require('../app');

describe('Contract Controller Tests', () => {
	let request;

	beforeEach(() => {
		request = supertest.agent(app).set('profile_id', 6);
	});

	describe('GET /contracts', () => {
		it('should return the contracts associated with the requesting client', async () => {
			const res = await request
				.get('/contracts')
				.send()
				.expect('Content-Type', /json/)
				.expect(200);

			expect(res.body).toMatchObject([
				{
					status: 'in_progress',
					terms: 'bla bla bla',
					id: 2,
				},
				{
					status: 'in_progress',
					terms: 'bla bla bla',
					id: 3,
				},
				{
					status: 'in_progress',
					terms: 'bla bla bla',
					id: 8,
				},
			]);
		});

		it('should only return the new and in_progress contracts associated with the requesting client', async () => {
			const res = await request
				.set('profile_id', 8)
				.get('/contracts')
				.send()
				.expect('Content-Type', /json/)
				.expect(200);

			const results = res.body;
			expect(results.length).toBe(2);
			const validContracts = results.every((item) =>
				['new', 'in_progress'].includes(item.status)
			);
			expect(validContracts).toBeTruthy();
		});

		it('should return the empty contracts list associated with the requesting client with profile_id 2', async () => {
			const res = await request
				.set('profile_id', 2)
				.get('/contracts')
				.send()
				.expect('Content-Type', /json/)
				.expect(200);

			expect(res.body).toMatchObject([]);
		});

		it('should not authorize fethcing contracts of unauthorized client', async () => {
			const res = await request
				.set('profile_id', 9)
				.get('/contracts')
				.send()
				.expect(401);
		});
	});

	describe('GET /contracts/:id', () => {
		it('should return the contract associated with the requesting client', async () => {
			const res = await request
				.get('/contracts/2')
				.send()
				.expect('Content-Type', /json/)
				.expect(200);

			expect(res.body).toMatchObject({
				id: 2,
				status: 'in_progress',
				terms: 'bla bla bla',
			});
		});

		it('should also return the terminated contracts associated with the requesting client', async () => {
			const res = await request
				.set('profile_id', 5)
				.get('/contracts/1')
				.send()
				.expect('Content-Type', /json/)
				.expect(200);

      expect(res.body.status).toBe('terminated');
		});

		it('should return the null when contract requested is not associated with the requesting client', async () => {
			const res = await request
				.get('/contracts/5')
				.send()
				.expect('Content-Type', /json/)
				.expect(200);

			expect(res.body).toBeNull();
		});

		it('should not authorize fethcing contracts of unauthorized client', async () => {
			const res = await request
				.set('profile_id', 9)
				.get('/contracts/5')
				.send()
				.expect(401);
		});
	});
});
