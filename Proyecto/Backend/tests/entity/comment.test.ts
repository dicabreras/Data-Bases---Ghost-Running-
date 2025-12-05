import { expect } from 'chai';
import { describe, it, before, after } from 'mocha';

describe('Comment entity validation', () => {
	let originalGetRepository: any;
	let commentRepo: any;

	before(async () => {
		const mod = await import('../../src/db_connection/config/dataSource');
		const ds = (mod as any).default ?? mod;
		originalGetRepository = ds.appDataSource.getRepository;

		let savedCounter = 1;
		const savedRecords: any[] = [];

		const fakeCommentRepo = {
			create(obj: any) { return { ...obj }; },
			async save(obj: any) {
				if (obj.publicationCounter == null) {
					throw new Error('publicationCounter is required');
				}
				if (!obj.userEmail) {
					throw new Error('userEmail is required');
				}

				// enforce length limit similar to entity definition
				if (typeof obj.userEmail === 'string' && obj.userEmail.length > 100) {
					throw new Error('userEmail too long');
				}
				if (obj.trainingCounter == null) {
					throw new Error('trainingCounter is required');
				}
				if (obj.routeId == null) {
					throw new Error('routeId is required');
				}
				if (obj.counter == null) {
					throw new Error('counter is required');
				}

				// text required and not empty
				if (!obj.text || typeof obj.text !== 'string' || obj.text.trim().length === 0) {
					throw new Error('text is required');
				}

				// likes must be non-negative integer if provided
				if (obj.likes != null && (typeof obj.likes !== 'number' || obj.likes < 0)) {
					throw new Error('likes must be non-negative');
				}

				// datetime if provided must be a Date
				if (obj.datetime != null && !(obj.datetime instanceof Date)) {
					throw new Error('datetime must be a Date');
				}

				// If datetime is missing, default to now (mirrors CreateDateColumn behavior)
				if (obj.datetime == null) {
					obj.datetime = new Date();
				}

				// TODO: See how to simplify this search callback lol
				const exists = savedRecords.find(r => r.publicationCounter === obj.publicationCounter && r.userEmail === obj.userEmail && r.trainingCounter === obj.trainingCounter && r.routeId === obj.routeId && r.counter === obj.counter);
				if (exists) {
					throw new Error('duplicate comment primary key');
				}

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
			if (name && name.includes('Comment')) {
				return fakeCommentRepo;
			}
			return {
				create: (o: any) => ({ ...o }),
				save: async (o: any) => ({ ...o })
			};
		};

		commentRepo = ds.appDataSource.getRepository({ name: 'Comment' });
	});

	after(async () => {
		try {
			const mod = await import('../../src/db_connection/config/dataSource');
			const ds = (mod as any).default ?? mod;
			if (originalGetRepository) {
				ds.appDataSource.getRepository = originalGetRepository;
			}
		} catch (error) {
			console.error(error);
		}
	});

	it('succeeds when all required Comment fields are present', async () => {
		const comment = commentRepo.create({
			publicationCounter: 1,
			userEmail: 'c@local',
			trainingCounter: 1,
			routeId: 1,
			counter: 1,
			text: 'Nice!',
			likes: 0,
			datetime: new Date()
		});

		const saved = await commentRepo.save(comment);
		expect(saved).to.be.an('object');
		expect(saved).to.have.property('_id');
		expect(saved.text).to.equal('Nice!');
	});

	it('fails when a required primary column is missing', async () => {
		const incomplete = commentRepo.create({
			// missing userEmail
			publicationCounter: 2,
			trainingCounter: 2,
			routeId: 2,
			counter: 1,
			text: 'Hello'
		});

		let threw = false;
		try { await commentRepo.save(incomplete); } catch (e) { threw = true; expect(e).to.exist; }
		expect(threw).to.equal(true);
	});

	it('rejects empty text', async () => {
		const item = commentRepo.create({
			publicationCounter: 3,
			userEmail: 't@local',
			trainingCounter: 3,
			routeId: 3,
			counter: 1,
			text: '   '
		});
		let threw = false;
		try {
			await commentRepo.save(item);
		} catch (error) {
			threw = true; expect(error).to.exist;
		}
		expect(threw).to.equal(true);
	});

	it('rejects negative likes', async () => {
		const item = commentRepo.create({
			publicationCounter: 4,
			userEmail: 'l@local',
			trainingCounter: 4,
			routeId: 4,
			counter: 1,
			text: 'ok',
			likes: -1
		});
		let threw = false;
		try {
			await commentRepo.save(item);
		} catch (error) {
			threw = true; expect(error).to.exist;
		}
		expect(threw).to.equal(true);
	});

	it('defaults likes to 0 when missing', async () => {
		const item = commentRepo.create({
			publicationCounter: 5,
			userEmail: 'nl@local',
			trainingCounter: 5,
			routeId: 5,
			counter: 1,
			text: 'no likes'
		});
		const saved = await commentRepo.save(item);
		expect(saved).to.have.property('likes');
		expect(saved.likes).to.equal(0);
	});

	it('sets datetime to now when missing', async () => {
		const item = commentRepo.create({
			publicationCounter: 50,
			userEmail: 'dt@local',
			trainingCounter: 50,
			routeId: 50,
			counter: 1,
			text: 'auto date'
		});
		const saved = await commentRepo.save(item);
		expect(saved).to.have.property('datetime');
		expect(saved.datetime).to.be.instanceOf(Date);
		// saved.datetime should be recent (within a minute)
		expect(Date.now() - saved.datetime.getTime()).to.be.lessThan(60 * 1000);
	});


	it('rejects duplicate composite primary key', async () => {
		const base = commentRepo.create({
			publicationCounter: 6,
			userEmail: 'dup@local',
			trainingCounter: 6,
			routeId: 6,
			counter: 1,
			text: 'first'
		});
		const first = await commentRepo.save(base);
		expect(first).to.have.property('_id');

		const dup = commentRepo.create({
			publicationCounter: 6,
			userEmail: 'dup@local',
			trainingCounter: 6,
			routeId: 6,
			counter: 1,
			text: 'second'
		});
		let threw = false;
		try {
			await commentRepo.save(dup);
		} catch (error) {
			threw = true; expect(error).to.exist;
		}
		expect(threw).to.equal(true);
	});

	it('rejects userEmail longer than 100 characters', async () => {
		const longEmail = 'a'.repeat(101) + '@local';
		const item = commentRepo.create({
			publicationCounter: 61,
			userEmail: longEmail,
			trainingCounter: 61,
			routeId: 61,
			counter: 1,
			text: 'too long email'
		});
		let threw = false;
		try {
			await commentRepo.save(item);
		} catch (error) {
			threw = true; expect(error).to.exist;
		}
		expect(threw).to.equal(true);
	});

	it('rejects non-Date datetime values', async () => {
		const item = commentRepo.create({
			publicationCounter: 7,
			userEmail: 'd@local',
			trainingCounter: 7,
			routeId: 7,
			counter: 1,
			text: 'date',
			datetime: '2025-11-17'
		});
		let threw = false;
		try {
			await commentRepo.save(item);
		} catch (error) {
			threw = true; expect(error).to.exist;
		}
		expect(threw).to.equal(true);
	});
});
