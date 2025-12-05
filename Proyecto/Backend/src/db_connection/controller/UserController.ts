import { Request, Response } from 'express';
import Database from '../db/Database';
import { User } from '../entity/User';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';

// Configure multer for profile photo uploads
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		const uploadPath = path.join(__dirname, '../../../../Database/db_images');
		cb(null, uploadPath);
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
		const ext = path.extname(file.originalname);
		cb(null, 'profile-' + uniqueSuffix + ext);
	}
});

export const upload = multer({
	storage: storage,
	fileFilter: (req, file, cb) => {
		const allowedTypes = /jpeg|jpg|png|gif/;
		const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
		const mimetype = allowedTypes.test(file.mimetype);
		if (extname && mimetype) {
			cb(null, true);
		} else {
			cb(new Error('Only image files are allowed'));
		}
	},
	limits: {
		fileSize: 5 * 1024 * 1024
	}
});


// Endpoint para registrar un nuevo usuario
export const registerUser = async (req: Request, res: Response) => {
	const userRepository = Database.getInstance().getRepository(User);
	try {

		const { username, email, name, lastname, age, password, gender, description } = req.body ?? {};
		const requiredFields = { username, email, name, lastname, age, password };

		const missingFields = Object.entries(requiredFields)
			.filter(([, value]) => !value)
			.map(([key]) => key);

		if (missingFields.length > 0) {
			// Return structured missing fields to help client/tests identify which are missing
			console.warn(`⚠️  Missing required fields: ${missingFields.join(',')}`);
			return res.status(400).json({ message: "Missing required fields", missing: missingFields });
		}

		// Verify username uniqueness (avoid duplicate usernames)
		const existingByUsername = await userRepository.findOne({ where: { username }});
		if (existingByUsername) {
			const warnMsg = `⚠️  Username already taken: ${username}`;
			console.warn(warnMsg);
			return res.status(400).json({ message: warnMsg });
		}

		// Get profile photo path if uploaded
		const uploadedFile = req.file as Express.Multer.File | undefined;
		const profilePhoto = uploadedFile ? uploadedFile.filename : undefined;

		// Hash password and create user
		const hashedPassword = await bcrypt.hash(password, 10);
		const newUser = userRepository.create({
			email: email,
			username: username,
			password: hashedPassword,
			names: name,
			lastNames: lastname,
			age: parseInt(age),
			gender: gender || undefined,
			description: description || undefined,
			profilePhoto: profilePhoto || undefined
		});
		await userRepository.save(newUser);
		return res.status(201).json({ message: "User registered successfully", data: { username, email, profilePhoto }});
	} catch (error) {
		console.error("Error registering user:", error);
		res.status(500).json({ message: "Internal server error" });
	}
};

// Endpoint para login de usuario
export const loginUser = async (req: Request, res: Response) => {
	const userRepository = Database.getInstance().getRepository(User);

	try {
		const { email, password } = req.body ?? {};
		if (!email) {
			console.warn("⚠️  Missing required email field in query");
			return res.status(400).json({ message: "Missing required field: email" });
		} else if (!password) {
			console.warn("⚠️  Missing required password field in query");
			return res.status(400).json({ message: "Missing required field: password" });
		}

		// TODO: Validar en DB si aplica. Por ahora respondemos éxito.
		const user = await userRepository.findOne({
			where: { email },
			select: ['email', 'username', 'names', 'lastNames', 'age', 'password', 'profilePhoto', 'description', 'gender']
		});
		if (!user) {
			console.warn("⚠️  User email not found:", email);
			return res.status(404).json({ message: "Invalid email" });
		}
		const passwordMatch = await bcrypt.compare(password, user.password);
		if (!passwordMatch) {
			console.warn("⚠️  Invalid password for email:", email);
			return res.status(401).json({ message: "Invalid credentials" });
		}

		// Return user data (excluding password)
		const userData = {
			email: user.email,
			username: user.username,
			names: user.names,
			lastNames: user.lastNames,
			profilePhoto: user.profilePhoto,
			description: user.description,
			gender: user.gender
		};

		return res.status(200).json({ message: "Login successful", user: userData });
	} catch (error) {
		console.error("Error logging in user:", error);
		res.status(500).json({ message: "Internal server error" });
	}
};


export const getFirstUser = async (req: Request, res: Response) => {
	const userRepository = Database.getInstance().getRepository(User);
	try {
		const users = await userRepository.find({ order: { registrationDate: "ASC" }, take: 1 });
		let firstUser = users[0];

		if (!firstUser) {
			const hashedPassword = await bcrypt.hash("ruunerporlaUN", 10);
			const newUser = userRepository.create({
				email: "diegoghost@running.com",
				username: "Diego Cabrera",
				password: hashedPassword,
				names: "Diego",
				lastNames: "Cabrera",
				age: 30
			});
			await userRepository.save(newUser);
			firstUser = newUser;
		}

		res.status(200).json({
			message: "Hello World: User record fetched successfully",
			data: {
				email: firstUser.email,
				username: firstUser.username,
				names: firstUser.names,
				lastNames: firstUser.lastNames,
				registrationDate: firstUser.registrationDate
			}
		});

	} catch (error) {
		console.error("Error fetching user:", error);
		res.status(500).json({ message: "Internal server error" });
	}
};