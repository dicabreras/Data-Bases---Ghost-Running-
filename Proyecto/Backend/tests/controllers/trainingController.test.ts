import { expect } from 'chai';
import { describe, it, before } from 'mocha';

// This test stubs appDataSource.getRepository before importing the controller
describe('TrainingController.saveTraining', () => {
	let controller: any;
	let originalGetRepository: any;
	let shouldThrowOnSave = false;

	before(() => {
		// Build fake repositories with minimal behavior required by the controller
		let coordId = 1;
		let routeId = 1;
		let trainingCounter = 1;

		const fakeUser = {
			email: 'test@local',
			username: 'tester',
			names: 'Test',
			lastNames: 'User',
			age: 30
		};

		const fakeRepos = {
			User: {
				findOne: async (opts: any) => {
					const email = opts?.where?.email;
					if (email === fakeUser.email) {return fakeUser;}
					return null;
				}
			},
			Coordinate: {
				create: (obj: any) => ({ ...obj }),
				save: async (coord: any) => {
					coord.id = coordId++;
					return coord;
				}
			},
			Route: {
				create: (obj: any) => ({ ...obj }),
				save: async (route: any) => {
					route.id = routeId++;
					return route;
				}
			},
			Training: {
				create: (obj: any) => ({ ...obj }),
				save: async (t: any) => {
					if (shouldThrowOnSave) {throw new Error('Simulated save error');}
					t.counter = trainingCounter++;
					return t;
				}
			}
		};

		// Patch appDataSource.getRepository to return appropriate fake repository
		const ds = require('../../src/db_connection/config/dataSource');
		// Save original getRepository to restore later
		originalGetRepository = ds.appDataSource.getRepository;
		ds.appDataSource.getRepository = (entity: any) => {
			const name = entity && entity.name ? entity.name : String(entity);
			if (name.includes('User')) {return fakeRepos.User;}
			if (name.includes('Coordinate')) {return fakeRepos.Coordinate;}
			if (name.includes('Route')) {return fakeRepos.Route;}
			if (name.includes('Training')) {return fakeRepos.Training;}
			// Fallback repository with basic create/save methods
			return { create: (o: any) => ({ ...o }), save: async (o: any) => ({ ...o }) };
		};

		// Now import the controller after the stub is in place
		controller = require('../../src/db_connection/controller/TrainingController');
	});

	// Restore original getRepository to avoid interfering with other tests
	after(() => {
		try {
			const ds = require('../../src/db_connection/config/dataSource');
			if (originalGetRepository) {ds.appDataSource.getRepository = originalGetRepository;}
		} catch {
			// ignore restore errors in test environment
		}
	});

	it('should save a training successfully', async () => {
		const req: any = {
			body: {
				userEmail: 'test@local',
				distance: 5000,
				duration: '00:25:00',
				avgSpeed: 12.0,
				maxSpeed: 15.0,
				rithm: 5.0,
				calories: 300,
				elevationGain: 10,
				trainingType: 'Running',
				route: [
					{ latitude: 4.6, longitude: -74.0, altitude: 2550 },
					{ latitude: 4.6001, longitude: -74.0002, altitude: 2552 },
					{ latitude: 4.6002, longitude: -74.0003, altitude: 2553 },
					{ latitude: 4.6003, longitude: -74.0004, altitude: 2551 },
					{ latitude: 4.6004, longitude: -74.0005, altitude: 2554 },
					{ latitude: 4.6005, longitude: -74.0006, altitude: 2550 }
				],
				datetime: '2025-11-16T12:00:00Z'
			}
		};

		const res: any = {
			statusCode: 0,
			body: null,
			status(code: number) { this.statusCode = code; return this; },
			json(obj: any) { this.body = obj; return this; }
		};

		await controller.saveTraining(req, res);

		expect(res.statusCode).to.equal(201);
		expect(res.body).to.have.property('message', 'Training saved successfully');
		expect(res.body).to.have.property('training');
		const t = res.body.training;
		expect(t).to.have.property('distance');
		expect(t.distance).to.equal(5000);
		expect(t).to.have.property('avgSpeed');
		expect(t.avgSpeed).to.equal(12.0);
		expect(t).to.have.property('isGhost');
		expect(t.isGhost).to.equal(0);
	});

	it('should save a training as ghost when isGhost is set', async () => {
		const req: any = {
			body: {
				userEmail: 'test@local',
				distance: 5000,
				duration: '00:26:00',
				avgSpeed: 12.0,
				maxSpeed: 15.0,
				rithm: 5.0,
				calories: 300,
				elevationGain: 10,
				trainingType: 'Running',
				isGhost: 1,
				route: [
					{ latitude: 4.6, longitude: -74.0, altitude: 2550 },
					{ latitude: 4.6001, longitude: -74.0002, altitude: 2552 },
					{ latitude: 4.6002, longitude: -74.0003, altitude: 2553 },
					{ latitude: 4.6003, longitude: -74.0004, altitude: 2551 },
					{ latitude: 4.6004, longitude: -74.0005, altitude: 2554 },
					{ latitude: 4.6005, longitude: -74.0006, altitude: 2550 }
				],
				datetime: '2025-11-16T12:00:00Z'
			}
		};

		const res: any = {
			statusCode: 0,
			body: null,
			status(code: number) { this.statusCode = code; return this; },
			json(obj: any) { this.body = obj; return this; }
		};

		await controller.saveTraining(req, res);

		expect(res.statusCode).to.equal(201);
		expect(res.body).to.have.property('training');
		const t = res.body.training;
		expect(t).to.have.property('isGhost');
		expect(t.isGhost).to.equal(1);
	});

	it('should return 400 if userEmail is missing', async () => {
		const req: any = { body: { distance: 100 }};
		const res: any = { statusCode: 0, body: null, status(code: number) { this.statusCode = code; return this; }, json(obj: any) { this.body = obj; return this; } };
		await controller.saveTraining(req, res);
		expect(res.statusCode).to.equal(400);
	});

	it('should return 404 when user not found', async () => {
		const req: any = { body: { userEmail: 'notfound@local', distance: 1, duration: '00:01:00', route: [ { latitude: 4.6, longitude: -74.0, altitude: 2550 }, { latitude: 4.6001, longitude: -74.0002, altitude: 2552 }, { latitude: 4.6002, longitude: -74.0003, altitude: 2553 }, { latitude: 4.6003, longitude: -74.0004, altitude: 2551 }, { latitude: 4.6004, longitude: -74.0005, altitude: 2554 }, { latitude: 4.6005, longitude: -74.0006, altitude: 2550 } ] }};
		const res: any = { statusCode: 0, body: null, status(code: number) { this.statusCode = code; return this; }, json(obj: any) { this.body = obj; return this; } };
		await controller.saveTraining(req, res);
		expect(res.statusCode).to.equal(404);
	});

	it('should reject training when no route and zero distance', async () => {
		const req: any = { body: { userEmail: 'test@local', distance: undefined }};
		const res: any = { statusCode: 0, body: null, status(code: number) { this.statusCode = code; return this; }, json(obj: any) { this.body = obj; return this; } };
		await controller.saveTraining(req, res);
		// Now controller rejects trainings with no valid route and zero distance
		expect(res.statusCode).to.equal(400);
	});

	it('should return 500 when training repository save fails', async () => {
		// enable throwing in fake repo
		shouldThrowOnSave = true;
		const req: any = { body: { userEmail: 'test@local', distance: 1, duration: '00:02:00', route: [ { latitude: 4.6, longitude: -74.0, altitude: 2550 }, { latitude: 4.6001, longitude: -74.0002, altitude: 2552 }, { latitude: 4.6002, longitude: -74.0003, altitude: 2553 }, { latitude: 4.6003, longitude: -74.0004, altitude: 2551 }, { latitude: 4.6004, longitude: -74.0005, altitude: 2554 }, { latitude: 4.6005, longitude: -74.0006, altitude: 2550 } ] }};
		const res: any = { statusCode: 0, body: null, status(code: number) { this.statusCode = code; return this; }, json(obj: any) { this.body = obj; return this; } };
		await controller.saveTraining(req, res);
		expect(res.statusCode).to.equal(500);
		// restore flag
		shouldThrowOnSave = false;
	});
});
