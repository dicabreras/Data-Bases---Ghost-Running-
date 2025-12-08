import { Request, Response } from "express";
import { appDataSource } from "../config/dataSource";
import { Training } from "../entity/Training";
import { User } from "../entity/User";
import { Route } from "../entity/Route";
import { Coordinate } from "../entity/Coordinate";
import { calculateTrainingStats, calculatePace } from "../../services/trainingService";

// Helper: parse HH:MM:SS or numeric seconds string to seconds
function parseDurationStr(d?: string | number): number {
	if (d === undefined || d === null) {
		return 0;
	}
	if (typeof d === 'number') {
		return Math.floor(d);
	}
	if (typeof d === 'string') {
		const parts = d.split(':').map(p => Number(p));
		if (parts.length === 3 && parts.every(p => !isNaN(p))) {
			return Math.floor(parts[0] * 3600 + parts[1] * 60 + parts[2]);
		}
		const n = Number(d);
		return Number.isNaN(n) ? 0 : Math.floor(n);
	}
	return 0;
}

const trainingRepository = appDataSource.getRepository(Training);
const userRepository = appDataSource.getRepository(User);
const routeRepository = appDataSource.getRepository(Route);
const coordinateRepository = appDataSource.getRepository(Coordinate);

export const calculateTraining = async (req: Request, res: Response) => {
	try {
		const { coordinates, userWeight } = req.body;

		if (!coordinates || !Array.isArray(coordinates) || coordinates.length < 2) {
			return res.status(400).json({ error: "At least 2 coordinates are required" });
		}

		const stats = calculateTrainingStats(coordinates, userWeight || 70);
		const pace = calculatePace(stats.avgSpeed);

		return res.status(200).json({
			...stats,
			pace
		});
	} catch (error) {
		console.error("Error calculating training:", error);
		return res.status(500).json({ error: "Error calculating training stats" });
	}
};

export const saveTraining = async (req: Request, res: Response) => {
	try {
		const { userEmail, distance, duration, avgSpeed, maxSpeed, rithm, calories, elevationGain, trainingType, route, datetime, name } = req.body;
		// isGhost may be provided by the client (1) or defaults to 0
		const isGhost = req.body && req.body.isGhost ? Number(req.body.isGhost) : 0;

		if (!userEmail) {
			console.warn('saveTraining: missing userEmail in request body');
			return res.status(400).json({ error: "userEmail is required" });
		}

		// Validate more robust minimums before saving:
		// - route must have more than 5 points (need >5)
		// - duration must be > 10 seconds
		// - distance must be more than 10 meters
		const hasValidRoute = route && Array.isArray(route) && route.length > 5;
		const parsedDistanceKm = Number(distance) || 0;
		const parsedDistanceMeters = parsedDistanceKm * 1000;
		const durationSeconds = parseDurationStr(duration);
		if (!hasValidRoute) {
			return res.status(400).json({ error: 'Not enough recorded coordinates: need more than 5 points' });
		}
		if (durationSeconds <= 10) {
			return res.status(400).json({ error: 'Training too short: duration must be greater than 10 seconds' });
		}
		if (parsedDistanceMeters <= 10) {
			return res.status(400).json({ error: 'Distance too short: must be more than 10 meters' });
		}

		const user = await userRepository.findOne({ where: { email: userEmail }});

		if (!user) {
			console.warn(`saveTraining: user not found for email='${userEmail}'`);
			return res.status(404).json({ error: "User not found" });
		}

		// Crear las coordenadas primero
		const savedCoordinates: Coordinate[] = [];
		if (route && Array.isArray(route)) {
			for (const coord of route) {
				const newCoordinate = coordinateRepository.create({
					latitude: coord.latitude,
					longitude: coord.longitude,
					altitude: coord.altitude || 0
				});
				const savedCoord = await coordinateRepository.save(newCoordinate);
				savedCoordinates.push(savedCoord);
			}
		}

		// Crear ruta con las coordenadas
		const newRoute = routeRepository.create({
			distance: distance || 0,
			coordinates: savedCoordinates
		});
		await routeRepository.save(newRoute);

		// Crear entrenamiento
		const training = trainingRepository.create({
			userEmail: userEmail,
			routeId: newRoute.id,
			datetime: datetime ? new Date(datetime) : new Date(),
			duration: duration || "00:00:00",
			rithm: rithm || 0,
			maxSpeed: maxSpeed || avgSpeed || 0,
			avgSpeed: avgSpeed || 0,
			calories: calories || 0,
			elevationGain: elevationGain || 0,
			trainingType: trainingType || 'Running',
			isGhost: isGhost ? 1 : 0,
			user: user,
			route: newRoute
		});

		await trainingRepository.save(training);

		// Publicar automáticamente el entrenamiento al finalizar (solo si no es ghost)
		let publicationCreated = false;
		if (!isGhost) {
			try {
				await appDataSource.query(
					'CALL sp_user_publish_training_with_comment(?, ?, ?, ?, ?, ?)',
					[
						userEmail,
						training.counter,
						newRoute.id,
						null, // pub_routeimage (no se envía imagen por ahora)
						1,    // pub_privacity: 1 = público
						''    // com_Text: comentario inicial vacío
					]
				);
				publicationCreated = true;
			} catch (err) {
				console.error('Error publishing training via stored procedure:', err);
			}
		}

		return res.status(201).json({
			message: "Training saved successfully",
			training: {
				counter: training.counter,
				distance: newRoute.distance,
				duration: training.duration,
				avgSpeed: training.avgSpeed,
				maxSpeed: training.maxSpeed,
				rithm: training.rithm,
				calories: training.calories,
				elevationGain: training.elevationGain,
				trainingType: training.trainingType,
				datetime: training.datetime,
				isGhost: training.isGhost,
				route: savedCoordinates.map(c => ({ latitude: c.latitude, longitude: c.longitude, altitude: c.altitude }))
			},
			publicationCreated
		});
	} catch (error) {
		console.error("Error saving training:", error);
		return res.status(500).json({ error: "Error saving training" });
	}
};


export const getUserTrainings = async (req: Request, res: Response) => {
	try {
		const { userEmail } = req.params;

		if (!userEmail) {
			return res.status(400).json({ error: "userEmail is required" });
		}

		const trainings = await trainingRepository.find({
			where: { userEmail: userEmail },
			relations: ["route", "route.coordinates"],
			order: { datetime: "DESC" }
		});

		return res.json({
			trainings: trainings.map(t => ({
				counter: t.counter,
				distance: parseFloat(t.route.distance.toString()),
				duration: t.duration,
				avgSpeed: parseFloat(t.avgSpeed.toString()),
				maxSpeed: parseFloat(t.maxSpeed.toString()),
				rithm: parseFloat(t.rithm.toString()),
				calories: parseFloat(t.calories.toString()),
				elevationGain: parseFloat(t.elevationGain.toString()),
				trainingType: t.trainingType,
				datetime: t.datetime,
				isGhost: t.isGhost ?? 0,
				route: t.route?.coordinates.map(c => ({
					latitude: parseFloat(c.latitude.toString()),
					longitude: parseFloat(c.longitude.toString()),
					altitude: parseFloat(c.altitude.toString())
				}))
			}))
		});
	} catch (error) {
		console.error("Error getting trainings:", error);
		return res.status(500).json({ error: "Error getting trainings" });
	}
};

export const replaceGhost = async (req: Request, res: Response) => {
	try {
		const { oldGhostCounter, userEmail, distance, duration, avgSpeed, maxSpeed, rithm, calories, elevationGain, trainingType, route, datetime, name } = req.body;

		if (!oldGhostCounter || !userEmail) {
			return res.status(400).json({ error: "oldGhostCounter and userEmail are required" });
		}

		// Find the old ghost training
		const oldGhost = await trainingRepository.findOne({
			where: { counter: oldGhostCounter, userEmail: userEmail, isGhost: 1 }
		});

		if (!oldGhost) {
			return res.status(404).json({ error: "Old ghost training not found" });
		}

		// Update old ghost to be a regular training
		oldGhost.isGhost = 0;
		await trainingRepository.save(oldGhost);

		// Create new ghost training (same logic as saveTraining)
		const user = await userRepository.findOne({ where: { email: userEmail }});
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		// Validate minimums for ghost replacement as well
		const hasValidRoute = route && Array.isArray(route) && route.length > 5;
		const parsedDistanceKm = Number(distance) || 0;
		const parsedDistanceMeters = parsedDistanceKm * 1000;
		const durationSeconds = parseDurationStr(duration);
		if (!hasValidRoute) {
			return res.status(400).json({ error: 'Not enough recorded coordinates: need more than 5 points' });
		}
		if (durationSeconds <= 10) {
			return res.status(400).json({ error: 'Training too short: duration must be greater than 10 seconds' });
		}
		if (parsedDistanceMeters <= 10) {
			return res.status(400).json({ error: 'Distance too short: must be more than 10 meters' });
		}

		// Create coordinates
		const savedCoordinates: Coordinate[] = [];
		if (route && Array.isArray(route)) {
			for (const coord of route) {
				const newCoordinate = coordinateRepository.create({
					latitude: coord.latitude,
					longitude: coord.longitude,
					altitude: coord.altitude || 0
				});
				const savedCoord = await coordinateRepository.save(newCoordinate);
				savedCoordinates.push(savedCoord);
			}
		}

		// Create route
		const newRoute = routeRepository.create({
			distance: distance || 0,
			coordinates: savedCoordinates
		});
		await routeRepository.save(newRoute);

		// Create new ghost training
		const newGhost = trainingRepository.create({
			userEmail: userEmail,
			routeId: newRoute.id,
			datetime: datetime ? new Date(datetime) : new Date(),
			duration: duration || "00:00:00",
			rithm: rithm || 0,
			maxSpeed: maxSpeed || avgSpeed || 0,
			avgSpeed: avgSpeed || 0,
			calories: calories || 0,
			elevationGain: elevationGain || 0,
			trainingType: trainingType || 'Running',
			isGhost: 1,
			user: user,
			route: newRoute
		});

		await trainingRepository.save(newGhost);

		return res.status(201).json({
			message: "Ghost replaced successfully",
			newGhost: {
				counter: newGhost.counter,
				distance: newRoute.distance,
				duration: newGhost.duration,
				avgSpeed: newGhost.avgSpeed,
				maxSpeed: newGhost.maxSpeed,
				rithm: newGhost.rithm,
				calories: newGhost.calories,
				elevationGain: newGhost.elevationGain,
				trainingType: newGhost.trainingType,
				datetime: newGhost.datetime,
				isGhost: newGhost.isGhost
			}
		});
	} catch (error) {
		console.error("Error replacing ghost:", error);
		return res.status(500).json({ error: "Error replacing ghost" });
	}
};

export const deleteTraining = async (req: Request, res: Response) => {
	try {
		const { counter } = req.params;
		if (!counter) {
			return res.status(400).json({ error: 'Training counter is required' });
		}

		const training = await trainingRepository.findOne({ where: { counter: Number(counter) }, relations: ['route'] });
		if (!training) {
			return res.status(404).json({ error: 'Training not found' });
		}

		// Remove the training record
		await trainingRepository.remove(training);

		// Optionally remove the route if no other trainings reference it
		try {
			if (training.route && training.route.id) {
				const other = await trainingRepository.count({ where: { routeId: training.route.id }});
				if (other === 0) {
					await routeRepository.delete(training.route.id);
				}
			}
		} catch (err) {
			console.warn('Failed to clean up route after training deletion:', err);
		}

		return res.status(200).json({ message: 'Training deleted' });
	} catch (error) {
		console.error('Error deleting training:', error);
		return res.status(500).json({ error: 'Error deleting training' });
	}
};
