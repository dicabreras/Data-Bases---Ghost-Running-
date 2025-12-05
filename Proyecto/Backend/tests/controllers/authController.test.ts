import { expect } from 'chai';
import { describe, it, before, after } from 'mocha';
import sinon from 'sinon';

describe('AuthController (basic)', () => {
	let originalGetRepository: any;
	let verifyStub: sinon.SinonStub;
	let fakeUserRepo: any;

	before(async () => {
		const ga = await import('google-auth-library');
		verifyStub = sinon.stub(ga.OAuth2Client.prototype, 'verifyIdToken');

		// Patch appDataSource.getRepository to return a fake user repo before
		// importing the controller so the module-level repository is set to the fake.

		const dsMod = await import('../../src/db_connection/config/dataSource');
		originalGetRepository = dsMod.appDataSource.getRepository;
		// create a shared fake repo so tests can mutate its behavior per-case
		fakeUserRepo = {
			findOne: async (_opts: any) => null,
			create: (u: any) => ({ ...u }),
			save: async (u: any) => ({ ...u })
		};

		dsMod.appDataSource.getRepository = (entity: any) => {
			const name = entity && entity.name ? entity.name : String(entity);
			if (name && name.includes('User')) {
				return fakeUserRepo;
			}
			return originalGetRepository(entity);
		};
	});

	after(async () => {
		if (verifyStub && verifyStub.restore) {verifyStub.restore();}
		try {
			const dsMod = await import('../../src/db_connection/config/dataSource');
			if (originalGetRepository) {dsMod.appDataSource.getRepository = originalGetRepository;}
		} catch (error) {
			console.error(error);
		}
	});

	it('returns 400 when idToken missing', async () => {
		const controller = await import('../../src/db_connection/controller/AuthController');
		const req: any = { body: {}};
		const res: any = { statusCode: 0, body: null, status(code: number) { this.statusCode = code; return this; }, json(obj: any) { this.body = obj; return this; } };

		await controller.verifyGoogleToken(req, res);

		expect(res.statusCode).to.equal(400);
		expect(res.body).to.have.property('message');
	});

	it('returns 200 and user when idToken valid (new user)', async () => {
		verifyStub.resolves({ getPayload: () => ({ email: 'new@local', given_name: 'New', family_name: 'User', picture: 'http://p' }) });

		const controller = await import('../../src/db_connection/controller/AuthController');
		const request: any = { body: { idToken: 'valid-token' }};
		const response: any = { statusCode: 0, body: null, status(code: number) { this.statusCode = code; return this; }, json(obj: any) { this.body = obj; return this; } };

		await controller.verifyGoogleToken(request, response);

		expect(response.statusCode).to.equal(200);
		expect(response.body).to.have.property('user');
		expect(response.body.user).to.have.property('email', 'new@local');
	});


	it('returns 200 and user when idToken valid (existing user)', async () => {
		fakeUserRepo.findOne = async () => ({
			email: 'exist@local',
			username: 'exist',
			names: 'Exist',
			lastNames: 'User',
			profilePhoto: undefined,
			description: undefined,
			gender: undefined
		});
		verifyStub.resolves({ getPayload: () => ({ email: 'exist@local', given_name: 'Exist', family_name: 'User', picture: undefined }) });


		const controller = await import('../../src/db_connection/controller/AuthController');
		const request: any = { body: { idToken: 'valid-existing' }};
		const response: any = { statusCode: 0, body: null, status(code: number) { this.statusCode = code; return this; }, json(obj: any) { this.body = obj; return this; } };

		await controller.verifyGoogleToken(request, response);

		expect(response.statusCode).to.equal(200);
		expect(response.body).to.have.property('user');
		expect(response.body.user).to.have.property('email', 'exist@local');
	});

	it('returns 500 when saving new user fails', async () => {
		// simulate no existing user and save throws
		fakeUserRepo.findOne = async () => null;
		fakeUserRepo.save = async () => { throw new Error('DB failure'); };
		verifyStub.resolves({ getPayload: () => ({ email: 'fail@local', given_name: 'Fail', family_name: 'User', picture: undefined }) });


		const controller = await import('../../src/db_connection/controller/AuthController');
		const request: any = { body: { idToken: 'will-fail' }};
		const response: any = { statusCode: 0, body: null, status(code: number) { this.statusCode = code; return this; }, json(obj: any) { this.body = obj; return this; } };

		await controller.verifyGoogleToken(request, response);

		expect(response.statusCode).to.equal(500);
		expect(response.body).to.have.property('message');
	});

	it('returns 400 when verifyIdToken payload has no email', async () => {
		fakeUserRepo.findOne = async () => null;
		fakeUserRepo.save = async (u: any) => ({ ...u });
		// verifyIdToken returns payload without email
		verifyStub.resolves({ getPayload: () => ({ given_name: 'NoEmail' }) });


		const controller = await import('../../src/db_connection/controller/AuthController');
		const request: any = { body: { idToken: 'no-email' }};
		const response: any = { statusCode: 0, body: null, status(code: number) { this.statusCode = code; return this; }, json(obj: any) { this.body = obj; return this; } };

		await controller.verifyGoogleToken(request, response);

		expect(response.statusCode).to.equal(400);
		expect(response.body).to.have.property('message');
	});

	it('returns 500 when verifyIdToken throws', async () => {
		// simulate crypto/verification error
		verifyStub.rejects(new Error('verify failure'));


		const controller = await import('../../src/db_connection/controller/AuthController');
		const request: any = { body: { idToken: 'will-throw' }};
		const response: any = { statusCode: 0, body: null, status(code: number) { this.statusCode = code; return this; }, json(obj: any) { this.body = obj; return this; } };

		await controller.verifyGoogleToken(request, response);

		expect(response.statusCode).to.equal(500);
		expect(response.body).to.have.property('message');
	});
});
