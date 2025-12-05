interface Coordinate {
	latitude: number;
	longitude: number;
	timestamp: number;
	altitude?: number;
}

interface TrainingCalculationResult {
	distance: number;
	duration: string;
	rithm: number;
	maxSpeed: number;
	avgSpeed: number;
	calories: number;
	elevationGain: number;
}


/**
 * Calcula todas las estadísticas del entrenamiento
 * @param coordinates Array de coordenadas con timestamps
 * @param userWeight Peso del usuario en kg (opcional, default 65kg)
 * @returns Objeto con todas las estadísticas calculadas
 */
export const calculateTrainingStats = (
	coordinates: Coordinate[],
	userWeight: number = 65
): TrainingCalculationResult => {
	if (coordinates.length < 2) {
		return {
			distance: 0,
			duration: "00:00:00",
			rithm: 0,
			maxSpeed: 0,
			avgSpeed: 0,
			calories: 0,
			elevationGain: 0
		};
	}

	const distances = calculateDistances(coordinates);

	const totalDistance = calculateTotalDistance(distances);

	const speeds = calculateSpeeds(coordinates, distances);

	const totalSeconds = (coordinates[coordinates.length - 1].timestamp - coordinates[0].timestamp) / 1000;
	const duration = formatDuration(totalSeconds);

	const avgSpeed = calculateAvgSpeed(totalDistance, totalSeconds);

	const maxSpeed = calculateMaxSpeed(speeds);

	const rithm = calculateRithm(avgSpeed);

	const timeInHours = totalSeconds / 3600;
	const calories = calculateCalories(avgSpeed, userWeight, timeInHours);

	const elevationGain = calculateElevation(coordinates);

	return {
		distance: parseFloat(totalDistance.toFixed(2)),
		duration: duration,
		rithm: parseFloat(rithm.toFixed(2)),
		maxSpeed: parseFloat(maxSpeed.toFixed(2)),
		avgSpeed: parseFloat(avgSpeed.toFixed(2)),
		calories: parseFloat(calories.toFixed(2)),
		elevationGain: parseFloat(elevationGain.toFixed(2))
	};
};


/**
 * Formatea la duración en segundos a formato HH:MM:SS
 */
export const formatDuration = (seconds: number): string => {
	const hrs = Math.floor(seconds / 3600);
	const mins = Math.floor((seconds % 3600) / 60);
	const secs = Math.floor(seconds % 60);

	return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const calculateRithm = (avgSpeed: number): number => {
	if (avgSpeed === 0) {return 0;}
	return (60 / avgSpeed);
};

export const calculateMaxSpeed = (speeds: number[]): number => {
	if (speeds.length === 0) {return 0;}
	return Math.max(...speeds);
};

export const calculateAvgSpeed = (totalDistance: number, totalSeconds: number): number => {
	if (totalSeconds === 0) {return 0;}
	return (totalDistance / totalSeconds) * 3600;
};

export const calculateTotalDistance = (distances: number[]): number => {
	if (distances.length === 0) {return 0;}

	let totalDistance = 0;
	for (const distance of distances) {
		totalDistance += distance;
	}
	return totalDistance;
};

/**
 * Calcula velocidades entre coordenadas
 */
export const calculateSpeeds = (coordinates: Coordinate[], distances: number[]): number[] => {
	const speeds: number[] = [];

	for (let i = 1; i < coordinates.length; i++) {
		const prev = coordinates[i - 1];
		const curr = coordinates[i];
		const segmentDistance = distances[i - 1];

		const timeDiff = (curr.timestamp - prev.timestamp) / 1000;

		if (timeDiff > 0) {
			const speed = (segmentDistance / timeDiff) * 3600;
			speeds.push(speed);
		}
	}

	return speeds ;
};

/**
 * Calcula las distancias por segmento
 */

export const calculateDistances = (coordinates: Coordinate[]): number[] => {
	const distances: number[] = [];
	for (let i = 1; i < coordinates.length; i++) {
		const prev = coordinates[i - 1];
		const curr = coordinates[i];

		const segmentDistance = haversineDistance(
			prev.latitude,
			prev.longitude,
			curr.latitude,
			curr.longitude
		);

		distances.push(segmentDistance);
	}

	return distances ;
};


/**
 * Calcula la ganancia de elevación
 */
export const calculateElevation = (coordinates: Coordinate[]): number => {
	let maxAltitude = coordinates[0].altitude || 0;
	let minAltitude = coordinates[0].altitude || 0;

	for (const coord of coordinates) {
		if (coord.altitude) {
			maxAltitude = Math.max(maxAltitude, coord.altitude);
			minAltitude = Math.min(minAltitude, coord.altitude);
		}
	}

	return Math.max(0, maxAltitude - minAltitude);
};

/**
 * Calcula las calorías quemadas basado en MET
 * @param avgSpeed Velocidad promedio en km/h (debe ser >= 0)
 * @param userWeight Peso del usuario en kg (debe ser > 0)
 * @param timeInHours Tiempo en horas (debe ser >= 0)
 * @returns Calorías quemadas, o NaN si los parámetros son inválidos
 */
export const calculateCalories = (avgSpeed: number, userWeight: number, timeInHours: number): number => {
	// Validar que los parámetros sean válidos
	if (avgSpeed < 0 || userWeight <= 0 || timeInHours < 0) {
		return NaN;
	}

	const metRanges = [
		{ maxSpeed: 8, met: 8 },
		{ maxSpeed: 12, met: 10 },
		{ maxSpeed: Infinity, met: 12 }
	];

	const foundRange = metRanges.find(r => avgSpeed < r.maxSpeed);
	const metValue = foundRange ? foundRange.met : 12;

	return metValue * userWeight * timeInHours;
};


/**
 * Calcula el ritmo (pace) en formato min:seg por kilómetro
 * @param avgSpeed Velocidad promedio en km/h (debe ser >= 0)
 * @returns Ritmo en formato "min:seg", o "0:00" si velocidad inválida
 */
export const calculatePace = (avgSpeed: number): string => {
	if (avgSpeed <= 0) {
		return "0:00";
	}
	const paceMinutes = 60 / avgSpeed;
	const mins = Math.floor(paceMinutes);
	const secs = Math.floor((paceMinutes - mins) * 60);
	return `${mins}:${secs.toString().padStart(2, '0')}`;
};


/**
 * Calcula la distancia entre dos coordenadas usando la fórmula de Haversine
 * @param latitudePointOne Latitud del punto 1 (-90 a 90)
 * @param longitudePointOne Longitud del punto 1 (-180 a 180)
 * @param latitudePointTwo Latitud del punto 2 (-90 a 90)
 * @param longitudePointTwo Longitud del punto 2 (-180 a 180)
 * @returns Distancia en kilómetros, o NaN si las coordenadas son inválidas
 */
export const haversineDistance = (latitudePointOne: number, longitudePointOne: number, latitudePointTwo: number, longitudePointTwo: number): number => {
	// Validar que las coordenadas estén en rangos válidos
	if (latitudePointOne < -90 || latitudePointOne > 90 ||
		latitudePointTwo < -90 || latitudePointTwo > 90 ||
		longitudePointOne < -180 || longitudePointOne > 180 ||
		longitudePointTwo < -180 || longitudePointTwo > 180) {
		return NaN;
	}

	const earthRadius = 6371;
	const diferenceLatitude = toRad(latitudePointTwo - latitudePointOne);
	const diferenceLongitude = toRad(longitudePointTwo - longitudePointOne);

	const haversineA =
		Math.sin(diferenceLatitude / 2) * Math.sin(diferenceLatitude / 2) +
		Math.cos(toRad(latitudePointOne)) * Math.cos(toRad(latitudePointTwo)) * Math.sin(diferenceLongitude / 2) * Math.sin(diferenceLongitude / 2);

	const centralAngle = 2 * Math.atan2(Math.sqrt(haversineA), Math.sqrt(1 - haversineA));
	return earthRadius * centralAngle;
};

/**
 * Convierte grados a radianes
 */
export const toRad = (degrees: number): number => {
	return degrees * (Math.PI / 180);
};