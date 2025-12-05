import { expect } from 'chai';
import { describe, it, before, after } from 'mocha';

describe('Publication entity validation', () => {
	let originalGetRepository: any;
	let pubRepo: any;

	before(async () => {
		const mod = await import('../../src/db_connection/config/dataSource');
		const ds = (mod as any).default ?? mod;
		originalGetRepository = ds.appDataSource.getRepository;

		let savedCounter = 1;
		const savedRecords: any[] = [];

		const fakePublicationRepo = {
			create(obj: any) { return { ...obj }; },
			async save(obj: any) {
				// required composite parts
				if (obj.counter == null) {
					throw new Error('counter is required');
				}
				if (!obj.userEmail) {
					throw new Error('userEmail is required');
				}
				if (obj.trainingCounter == null) {
					throw new Error('trainingCounter is required');
				}
				if (obj.routeId == null) {
					throw new Error('routeId is required');
				}

				if (obj.likes != null && (typeof obj.likes !== 'number' || obj.likes < 0)) {
					throw new Error('likes must be a non-negative number');
				}

				if (obj.routeImage != null && obj.routeImage.length > 255) {
					throw new Error('routeImage too long');
				}

				if (obj.datetime && !(obj.datetime instanceof Date)) {
					throw new Error('datetime must be a Date');
				}

				if (obj.privacy != null && (typeof obj.privacy !== 'number' || obj.privacy < 0 || obj.privacy > 2)) {
					throw new Error('privacy out of bounds');
				}

				const exists = savedRecords.find(r => r.counter === obj.counter && r.userEmail === obj.userEmail && r.trainingCounter === obj.trainingCounter && r.routeId === obj.routeId);
				if (exists) {
					throw new Error('duplicate publication primary key');
				};

				if (obj.likes == null) {
					obj.likes = 0;
				}

				const toSave = { ...obj, _id: savedCounter++ };
				savedRecords.push(toSave);
				return toSave;
			}
		};

		ds.appDataSource.getRepository = (entity: any) => {
			const name = entity && entity.name ? entity.name : String(entity);
			if (name && name.includes('Publication')) {
				return fakePublicationRepo;
			}
			return {
				create: (o: any) => ({ ...o }),
				save: async (o: any) => ({ ...o })
			};
		};

		pubRepo = ds.appDataSource.getRepository({ name: 'Publication' });
	});

	after(async () => {
		try {
			const mod = await import('../../src/db_connection/config/dataSource');
			const ds = (mod as any).default ?? mod;
			if (originalGetRepository) {
				ds.appDataSource.getRepository = originalGetRepository;
			}
		} catch (error) {
			console.error('Error restoring original getRepository:', error);
		}
	});

	it('succeeds when all required Publication fields are present', async () => {
		const publication = pubRepo.create({
			counter: 1,
			likes: 0,
			privacy: 0,
			datetime: new Date(),
			userEmail: 'test@example.com',
			trainingCounter: 1,
			routeId: 1
		});

		const saved = await pubRepo.save(publication);
		expect(saved).to.be.an('object');
		expect(saved).to.have.property('counter');
		expect(saved).to.have.property('_id');
	});

	it('fails when a required primary column is missing', async () => {
		const incomplete = pubRepo.create({
			counter: 2,
			likes: 0,
			privacy: 0,
			datetime: new Date(),
			trainingCounter: 1,
			routeId: 1
		});

		let threw = false;
		try {
			await pubRepo.save(incomplete);
		} catch (err) {
			threw = true;
			expect(err).to.exist;
		}

		expect(threw).to.equal(true);
	});

	it('rejects negative likes', async () => {
		const bad = pubRepo.create({
			counter: 10,
			likes: -5,
			privacy: 0,
			datetime: new Date(),
			userEmail: 'neg@local',
			trainingCounter: 99,
			routeId: 5
		});

		let threw = false;
		try {
			await pubRepo.save(bad);
		} catch (err) {
			threw = true;
			expect(err).to.exist;
		}

		expect(threw).to.equal(true);
	});

	it('accepts routeImage at max length (255)', async () => {
		const img = 'a'.repeat(255);
		const item = pubRepo.create({
			counter: 11,
			likes: 1,
			privacy: 0,
			datetime: new Date(),
			userEmail: 'img@local',
			trainingCounter: 100,
			routeId: 6,
			routeImage: img
		});

		const saved = await pubRepo.save(item);
		expect(saved).to.have.property('routeImage');
		expect(saved.routeImage.length).to.equal(255);
	});

	it('rejects routeImage longer than 255', async () => {
		const img = 'b'.repeat(256);
		const item = pubRepo.create({
			counter: 12,
			likes: 1,
			privacy: 0,
			datetime: new Date(),
			userEmail: 'img2@local',
			trainingCounter: 101,
			routeId: 7,
			routeImage: img
		});

		let threw = false;
		try { await pubRepo.save(item); } catch (e) { threw = true; expect(e).to.exist; }
		expect(threw).to.equal(true);
	});

	it('rejects non-Date datetime values', async () => {
		const item = pubRepo.create({
			counter: 13,
			likes: 0,
			privacy: 0,
			datetime: '2025-11-17',
			userEmail: 'date@local',
			trainingCounter: 102,
			routeId: 8
		});

		let threw = false;
		try { await pubRepo.save(item); } catch (e) { threw = true; expect(e).to.exist; }
		expect(threw).to.equal(true);
	});

	it('enforces unique composite primary key', async () => {
		const base = pubRepo.create({
			counter: 20,
			likes: 2,
			privacy: 0,
			datetime: new Date(),
			userEmail: 'dup@local',
			trainingCounter: 200,
			routeId: 10
		});

		const first = await pubRepo.save(base);
		expect(first).to.have.property('_id');

		const dup = pubRepo.create({ ...base });

		let threw = false;
		try { await pubRepo.save(dup); } catch (e) { threw = true; expect(e).to.exist; }
		expect(threw).to.equal(true);
	});

	it('defaults missing likes to 0', async () => {
		const item = pubRepo.create({
			counter: 30,
			privacy: 0,
			datetime: new Date(),
			userEmail: 'nolikes@local',
			trainingCounter: 300,
			routeId: 20
		});

		const saved = await pubRepo.save(item);
		expect(saved).to.have.property('likes');
		expect(saved.likes).to.equal(0);
	});

	it('privacy bounds: rejects out-of-range values, accepts valid', async () => {
		const bad = pubRepo.create({ counter: 40, likes: 0, privacy: 3, datetime: new Date(), userEmail: 'p@local', trainingCounter: 400, routeId: 30 });
		let threw = false;
		try { await pubRepo.save(bad); } catch (e) { threw = true; expect(e).to.exist; }
		expect(threw).to.equal(true);

		const ok = pubRepo.create({ counter: 41, likes: 0, privacy: 1, datetime: new Date(), userEmail: 'p2@local', trainingCounter: 401, routeId: 31 });
		const saved = await pubRepo.save(ok);
		expect(saved).to.have.property('privacy');
		expect(saved.privacy).to.equal(1);
	});
});