import mysql from 'mysql2/promise';
import { ResultSetHeader } from 'mysql2';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const run = async () => {
	const dbName = process.env.DB_NAME!;
	const conn = await mysql.createConnection({
		host: process.env.DB_HOST,
		port: Number(process.env.DB_PORT) || 3306,
		user: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		database: dbName,
		multipleStatements: true
	});

	// Accept email from command line argument or use default
	const userEmail = process.argv[2] || 'ghost.tester@example.com';
	console.log(`Creating ghost for user: ${userEmail}`);

	try {
		// Delete existing ghost trainings for this user first
		await conn.execute<ResultSetHeader>(
			`DELETE FROM Training WHERE user_Email = ? AND tra_IsGhost = 1;`,
			[userEmail]
		);
		// 1) ensure user exists
		await conn.execute(
			`INSERT INTO UserGR (user_Email, user_Username, user_Password, user_Names, user_LastNames, user_Age, user_RegistrationDate)
			 VALUES (?, ?, ?, ?, ?, ?, NOW())
			 ON DUPLICATE KEY UPDATE user_Email = user_Email;`,
			[userEmail, 'ghosttester', 'password123', 'Ghost', 'Tester', 30]
		);

		// 2) create a route for 10.00 km
		const [routeRes] = await conn.execute<ResultSetHeader>(`INSERT INTO Route (rou_Distance) VALUES (?);`, [10.0]);
		const routeId = routeRes.insertId;
		console.log(`Created route id ${routeId} with distance 10.00 km`);

		// 3) create coordinates for a realistic 10km route in Bogotá
		const coords = [
			{ lat: 4.6097, lon: -74.0817, alt: 2640 },
			{ lat: 4.6150, lon: -74.0830, alt: 2642 },
			{ lat: 4.6200, lon: -74.0845, alt: 2645 },
			{ lat: 4.6250, lon: -74.0860, alt: 2648 },
			{ lat: 4.6300, lon: -74.0875, alt: 2650 },
			{ lat: 4.6350, lon: -74.0890, alt: 2653 },
			{ lat: 4.6400, lon: -74.0905, alt: 2655 },
			{ lat: 4.6450, lon: -74.0920, alt: 2658 },
			{ lat: 4.6500, lon: -74.0935, alt: 2660 },
			{ lat: 4.6550, lon: -74.0920, alt: 2662 },
			{ lat: 4.6600, lon: -74.0905, alt: 2665 },
			{ lat: 4.6650, lon: -74.0890, alt: 2667 },
			{ lat: 4.6700, lon: -74.0875, alt: 2670 },
			{ lat: 4.6750, lon: -74.0860, alt: 2672 },
			{ lat: 4.6800, lon: -74.0845, alt: 2675 },
			{ lat: 4.6850, lon: -74.0830, alt: 2678 },
			{ lat: 4.6900, lon: -74.0815, alt: 2680 },
			{ lat: 4.6950, lon: -74.0800, alt: 2682 },
			{ lat: 4.7000, lon: -74.0785, alt: 2685 },
			{ lat: 4.7050, lon: -74.0770, alt: 2687 }
		];

		const coordIds: number[] = [];
		for (const c of coords) {
			const [r] = await conn.execute<ResultSetHeader>(`INSERT INTO Coordinate (coo_Latitude, coo_Longitude, coo_Altitude) VALUES (?, ?, ?);`, [c.lat, c.lon, c.alt]);
			coordIds.push(r.insertId);
		}
		console.log('Inserted coordinates', coordIds);

		// 4) link coordinates to route
		for (const cid of coordIds) {
			await conn.execute(`INSERT IGNORE INTO Route_has_Coordinate (rou_Id, coo_Id) VALUES (?, ?);`, [routeId, cid]);
		}

		// 5) insert the training (tra_IsGhost = 1)
		// Ensure tra_Name is provided because the schema requires NOT NULL
		const trainingName = `Ghost ${routeId} - ${(new Date()).toISOString().slice(0,19).replace('T',' ')}`;
		const [trainingRes] = await conn.execute<ResultSetHeader>(
			`INSERT INTO Training (user_Email, rou_Id, tra_Datetime, tra_Duration, tra_Name, tra_Rithm, tra_MaxSpeed, tra_AvgSpeed, tra_Calories, tra_ElevationGain, tra_TrainingType, tra_IsGhost)
			 VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
			[
				userEmail,
				routeId,
				'00:50:00',
				trainingName,
				5.0,
				15.5,
				12.0,
				850,
				47,
				'Running',
				1
			]
		);
		const trainingId = trainingRes.insertId;
		console.log(`✅ Ghost training created: Counter ${trainingId}, User ${userEmail}`);
	} catch (err) {
		console.error('Error seeding ghost training:', err);
	} finally {
		await conn.end();
	}
};

run();
