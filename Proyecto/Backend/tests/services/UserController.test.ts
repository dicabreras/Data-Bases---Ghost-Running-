import { expect } from "chai";
import { describe, it } from "mocha";
import sinon from "sinon";
import { registerUser, loginUser } from "../../src/db_connection/controller/UserController";
import bcrypt from "bcryptjs";
import Database from "../../src/db_connection/db/Database";

describe("UserController Tests", () => {
	describe("registerUser", () => {

		// cuerpo del request falso
		const baseBody = {
			username: "juan",
			email: "juan@mail.com",
			name: "Juan",
			lastname: "Cortés",
			age: 21,
			password: "123",
			gender: "Male",
			description: "Soy un test"
		};

		const requiredFields = [
			"username",
			"email",
			"password",
			"name",
			"lastname",
			"age"
		];

		let req: any;
		let res: any;
		let jsonStub: any;
		let statusStub: any;
		let fakeRepo: any;

		// Declarar los stubs
		// use fakeRepo methods directly

		beforeEach(() => {
			req = {};
			jsonStub = sinon.stub();
			statusStub = sinon.stub().returns({ json: jsonStub });

			sinon.stub(console, "log");
			sinon.stub(console, "error");
			sinon.stub(console, "warn");

			res = {
				status: statusStub
			};

			fakeRepo = {
				findOne: sinon.stub(),
				save: sinon.stub(),
				create: sinon.stub()
			};

			sinon.stub(Database.getInstance(), "getRepository").returns(fakeRepo);

			// access fakeRepo methods directly when needed

			sinon.stub(bcrypt, "hash").resolves("hashed123");
		});

		afterEach(() => {
			sinon.restore();
		});

		it("should register user and return 201 with no missing fields", async () => {

			// cuerpo del request falso
			req.body = { ...baseBody };

			fakeRepo.findOne.resolves(null);
			fakeRepo.save.resolves({ id:1 });

			await registerUser(req, res);

			expect(statusStub.calledWith(201)).to.be.true;
		});

		it("Should register user and return 201 if 'description' is missig", async () => {

			// body base
			req.body = { ...baseBody };
			// quitar description
			delete req.body['description'];

			await registerUser(req, res);

			expect(statusStub.calledWith(201)).to.be.true;
		});

		requiredFields.forEach((field) => {
			it(`should return 400 if '${field}' is missing`, async () => {
				// clonar body base
				req.body = { ...baseBody };

				// borrar SOLO ese campo
				delete req.body[field];

				await registerUser(req, res);

				expect(statusStub.calledWith(400)).to.be.true;

				const response = jsonStub.firstCall.args[0];
				expect(response.missing).to.include(field);
			});
		});

	});


	describe("loginUser", () => {

		let req: any;
		let res: any;
		let jsonStub: any;
		let statusStub: any;
		let fakeRepo: any;

		// Declarar los stubs (use fakeRepo methods directly)


		beforeEach(() => {
			req = {};
			jsonStub = sinon.stub();
			statusStub = sinon.stub().returns({ json: jsonStub });

			sinon.stub(console, "log");
			sinon.stub(console, "error");
			sinon.stub(console, "warn");

			res = {
				status: statusStub
			};

			fakeRepo = {
				findOne: sinon.stub(),
				save: sinon.stub(),
				create: sinon.stub()
			};

			sinon.stub(Database.getInstance(), "getRepository").returns(fakeRepo);

			// access fakeRepo methods directly when needed
			// createStub not needed directly

			sinon.stub(bcrypt, "hash").resolves("hashed123");
		});

		afterEach(() => {
			sinon.restore();
		});

		it("should return 400 if 'email' is missing", async () => {
			req.body = { password: "123" };
			await loginUser(req, res);

			expect(statusStub.calledWith(400)).to.be.true;
			const response = jsonStub.firstCall.args[0];
			expect(response.message).to.equal("Missing required field: email");
		});

		it("should return 400 if 'password' is missing", async () => {
			req.body = { email: "juan@perez.com" };
			await loginUser(req, res);

			expect(statusStub.calledWith(400)).to.be.true;
			const response = jsonStub.firstCall.args[0];
			expect(response.message).to.equal("Missing required field: password");
		});

		it("should return 404 if user email not found", async () => {
			req.body = { email: "pepe@perez.com", password: "123" };

			fakeRepo.findOne.resolves(null);

			await loginUser(req, res);

			expect(statusStub.calledWith(404)).to.be.true;

			const response = jsonStub.firstCall.args[0];
			expect(response.message).to.equal("Invalid email");

		});

		it("should return 401 if password is incorrect", async () => {
			req.body = { email: "pepe@perez.com", password: "123" };

			sinon.stub(bcrypt, "compare").resolves(false);

			await loginUser(req, res);

			expect(statusStub.calledWith(404)).to.be.true;

			const response = jsonStub.firstCall.args[0];
			expect(response.message).to.equal("Invalid email");
		});

		it("should return 500 on internal server error", async () => {
			req.body = { email: "pedro@pecas.com", password: "123" };
			fakeRepo.findOne.throws(new Error("DB error"));

			await loginUser(req, res);
			expect(statusStub.calledWith(500)).to.be.true;

			const response = jsonStub.firstCall.args[0];
			expect(response.message).to.equal("Internal server error");
		});
	});
});
