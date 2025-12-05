// Proyecto/Database/seed-ghost.ts
import { Client } from 'pg';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const run = async () => {
	const dbName = process.env.DB_NAME!;
	const client = new Client({
		user: process.env.DB_USER,
		host: process.env.DB_HOST,
		password: process.env.DB_PASSWORD,
		port: Number(process.env.DB_PORT),
		database: dbName
	});

	await client.connect();

	// Accept email from command line argument or use default
	const userEmail = process.argv[2] || 'ghost.tester@example.com';
	console.log(`Creating ghost for user: ${userEmail}`);

	try {
		// Delete existing ghost trainings for this user first
		const deleteResult = await client.query(
			`DELETE FROM "Training" WHERE "userEmail" = $1 AND "isGhost" = 1 RETURNING counter;`,
			[userEmail]
		);
		if (deleteResult.rowCount && deleteResult.rowCount > 0) {
			console.log(`Deleted ${deleteResult.rowCount} old ghost training(s)`);
		}

		// 1) ensure user exists
		await client.query(
			`INSERT INTO "UserGR"(email, username, password, names, "lastNames", age, "registrationDate")
       VALUES($1,$2,$3,$4,$5,$6,NOW())
       ON CONFLICT ("email") DO NOTHING;`,
			[userEmail, 'ghosttester', 'password123', 'Ghost', 'Tester', 30]
		);

		// 2) create a route for 10.00 km
		const routeRes = await client.query(
			`INSERT INTO "Route"(distance) VALUES($1) RETURNING id, distance;`,
			[10.00]
		);
		const routeId = routeRes.rows[0].id;
		const routeDistance = routeRes.rows[0].distance;
		console.log(`Created route id ${routeId} with distance ${routeDistance} km`);

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
			const r = await client.query(
				`INSERT INTO "Coordinate"(latitude, longitude, altitude) VALUES($1,$2,$3) RETURNING id;`,
				[c.lat, c.lon, c.alt]
			);
			coordIds.push(r.rows[0].id);
		}
		console.log('Inserted coordinates', coordIds);

		// 4) link coordinates to route
		for (const cid of coordIds) {
			await client.query(
				`INSERT INTO "Route_has_Coordinate"("routeId","coordinateId") VALUES($1,$2) ON CONFLICT DO NOTHING;`,
				[routeId, cid]
			);
		}

		// 5) insert the training (isGhost = 1)
		const trainingRes = await client.query(
			`INSERT INTO "Training" ("userEmail","routeId","datetime","duration","rithm","maxSpeed","avgSpeed","calories","elevationGain","trainingType","isGhost")
       VALUES ($1,$2,NOW(),$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING counter, "userEmail", duration, "avgSpeed", "isGhost";`,
			[
				userEmail,
				routeId,
				// duration HH:MM:SS format
				'00:50:00',
				// rithm (min/km)
				5.0,
				// maxSpeed (km/h)
				15.5,
				// avgSpeed (km/h)
				12.0,
				// calories
				850,
				// elevationGain (meters)
				47,
				'Running',
				// isGhost
				1
			]
		);

		const training = trainingRes.rows[0];
		console.log(`✅ Ghost training created:`);
		console.log(`   Counter: ${training.counter}`);
		console.log(`   User: ${training.userEmail}`);
		console.log(`   Duration: ${training.duration}`);
		console.log(`   Avg Speed: ${training.avgSpeed} km/h`);
		console.log(`   Distance: ${routeDistance} km`);
		console.log(`   IsGhost: ${training.isGhost}`);
	} catch (err) {
		console.error('Error seeding ghost training:', err);
	} finally {
		await client.end();
	}
};

run();
