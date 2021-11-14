const supertest = require('supertest');
const app = require('../app');

describe('Admin Controller Tests', () => {
	let request;

	beforeEach(() => {
		request = supertest.agent(app).set('profile_id', 2);
	});

	describe('GET /admin/best-profession', () => {
		it('should return invalid time value when no time is given', async () => {
			const res = await request
				.get('/admin/best-profession')
				.send()
				.expect('Content-Type', /json/)
				.expect(500);

			expect(res.body).toMatchObject({
				message: 'Invalid time value',
			});
		});

		it('should return invalid time value when start time is given and no end time is given', async () => {
			const res = await request
				.get('/admin/best-profession?start=2020-08-14')
				.send()
				.expect('Content-Type', /json/)
				.expect(500);

			expect(res.body).toMatchObject({
				message: 'Invalid time value',
			});
		});

		it('should return invalid time value when end time is given and no start time is given', async () => {
			const res = await request
				.get('/admin/best-profession?end=2020-08-19')
				.send()
				.expect('Content-Type', /json/)
				.expect(500);

			expect(res.body).toMatchObject({
				message: 'Invalid time value',
			});
		});

		it('should return null when start and end time is given and result is not within the range', async () => {
			const res = await request
				.get('/admin/best-profession?start=2020-08-18&end=2020-08-19')
				.send()
				.expect('Content-Type', /json/)
				.expect(200);

			expect(res.body).toBeNull();
		});

		it('should return valid response when start and end time is given and result is within the range', async () => {
			const res = await request
				.get('/admin/best-profession?start=2020-08-14&end=2020-08-19')
				.send()
				.expect('Content-Type', /json/)
				.expect(200);

			expect(res.body).toMatchObject({
				profession: 'Programmer',
				paid: 2683,
			});
		});
	});

	describe('GET /admin/best-clients', () => {
		it('should return invalid time value when no time is given', async () => {
			const res = await request
				.get('/admin/best-clients')
				.send()
				.expect('Content-Type', /json/)
				.expect(500);

			expect(res.body).toMatchObject({
				message: 'Invalid time value',
			});
		});

		it('should return invalid time value when start time is given and no end time is given', async () => {
			const res = await request
				.get('/admin/best-clients?start=2020-08-14')
				.send()
				.expect('Content-Type', /json/)
				.expect(500);

			expect(res.body).toMatchObject({
				message: 'Invalid time value',
			});
		});

		it('should return invalid time value when end time is given and no start time is given', async () => {
			const res = await request
				.get('/admin/best-clients?end=2020-08-19')
				.send()
				.expect('Content-Type', /json/)
				.expect(500);

			expect(res.body).toMatchObject({
				message: 'Invalid time value',
			});
		});

		it('should return null when start and end time is given and result is not within the range', async () => {
			const res = await request
				.get('/admin/best-clients?start=2020-08-18&end=2020-08-19')
				.send()
				.expect('Content-Type', /json/)
				.expect(200);

			expect(res.body).toMatchObject([]);
		});

		it('should return valid response when start and end time is given and result is within the range and default limit to be 2', async () => {
			const res = await request
				.get('/admin/best-clients?start=2020-08-14&end=2020-08-19')
				.send()
				.expect('Content-Type', /json/)
				.expect(200);

			expect(res.body.length).toBe(2);
			expect(res.body).toMatchObject([
				{
					id: 4,
					paid: 2020,
					fullName: 'Ash Kethcum',
				},
				{
					id: 2,
					paid: 442,
					fullName: 'Mr Robot',
				},
			]);
		});

		it('should return valid response when start and end time is given and result is within the range and limit to be 3', async () => {
			const res = await request
				.get('/admin/best-clients?start=2020-08-14&end=2020-08-19&limit=3')
				.send()
				.expect('Content-Type', /json/)
				.expect(200);

			expect(res.body.length).toBe(3);
			expect(res.body).toMatchObject([
				{
					id: 4,
					paid: 2020,
					fullName: 'Ash Kethcum',
				},
				{
					id: 2,
					paid: 442,
					fullName: 'Mr Robot',
				},
				{
					id: 1,
					paid: 421,
					fullName: 'Harry Potter',
				},
			]);
		});
	});
});
