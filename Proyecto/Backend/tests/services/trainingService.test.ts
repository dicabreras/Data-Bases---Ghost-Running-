import { expect } from 'chai';
import { describe, it } from 'mocha';
import { haversineDistance, calculateCalories, calculatePace, calculateElevation, calculateAvgSpeed, calculateMaxSpeed } from '../../src/services/trainingService';

describe('TrainingService Tests', () => {

	describe('haversineDistance', () => {
		it('should calculate distance between two points correctly', () => {
			const lat1 = 40.7128;
			const lon1 = -74.0060;
			const lat2 = 34.0522;
			const lon2 = -118.2437;

			const distance = haversineDistance(lat1, lon1, lat2, lon2);

			expect(distance).to.be.closeTo(3935.75, 0.1);
		});

		it('should return 0 for the same coordinates', () => {
			const distance = haversineDistance(40.7128, -74.0060, 40.7128, -74.0060);
			expect(distance).to.equal(0);
		});

		it('should calculate short distances correctly', () => {
			const distance = haversineDistance(4.6097, -74.0817, 4.6107, -74.0827);
			expect(distance).to.be.closeTo(0.157, 0.01);
		});

		it('should handle very short distances (less than 20 meters)', () => {
			const distance = haversineDistance(4.6097, -74.0817, 4.60972, -74.08172);
			expect(distance).to.be.closeTo(0.00314, 0.0001);
		});

		it('should handle large distances', () => {
			const distance = haversineDistance(40.7128, -74.0060, -33.4489, -70.6693);
			expect(distance).to.be.closeTo(8253.50, 0.1);
		});

		it('should return NaN for latitude out of valid range (> 90)', () => {
			const distance = haversineDistance(100, 0, 40, 0);
			expect(distance).to.be.NaN;
		});

		it('should return NaN for latitude out of valid range (< -90)', () => {
			const distance = haversineDistance(-100, 0, 40, 0);
			expect(distance).to.be.NaN;
		});

		it('should return NaN for longitude out of valid range (> 180)', () => {
			const distance = haversineDistance(40, 200, 40, 0);
			expect(distance).to.be.NaN;
		});

		it('should return NaN for longitude out of valid range (< -180)', () => {
			const distance = haversineDistance(40, -200, 40, 0);
			expect(distance).to.be.NaN;
		});

		it('should accept coordinates at valid boundaries', () => {
			const distance1 = haversineDistance(90, 0, -90, 0);
			const distance2 = haversineDistance(0, 180, 0, -180);
			expect(distance1).to.not.be.NaN;
			expect(distance2).to.not.be.NaN;
		});
	});

	describe('calculateCalories', () => {
		it('should calculate calories for low speed (< 8 km/h)', () => {
			const calories = calculateCalories(5, 70, 1);
			expect(calories).to.equal(560);
		});

		it('should calculate calories for medium speed (8-12 km/h)', () => {
			const calories = calculateCalories(10, 70, 1);
			expect(calories).to.equal(700);
		});

		it('should calculate calories for high speed (> 12 km/h)', () => {
			const calories = calculateCalories(15, 70, 1);
			expect(calories).to.equal(840);
		});

		it('should calculate calories with different weight', () => {
			const calories1 = calculateCalories(10, 60, 1);
			const calories2 = calculateCalories(10, 80, 1);

			expect(calories1).to.equal(600);
			expect(calories2).to.equal(800);
		});

		it('should calculate calories with different time', () => {
			const calories1 = calculateCalories(10, 70, 0.5);
			const calories2 = calculateCalories(10, 70, 2);

			expect(calories1).to.equal(350);
			expect(calories2).to.equal(1400);
		});

		it('should return 0 for zero time', () => {
			const calories = calculateCalories(10, 70, 0);
			expect(calories).to.equal(0);
		});

		it('should handle exact boundary of 8 km/h', () => {
			const calories = calculateCalories(8, 70, 1);
			expect(calories).to.equal(700);
		});

		it('should handle exact boundary of 12 km/h', () => {
			const calories = calculateCalories(12, 70, 1);
			expect(calories).to.equal(840);
		});

		it('should return NaN for negative speed', () => {
			const calories = calculateCalories(-5, 70, 1);
			expect(calories).to.be.NaN;
		});

		it('should return NaN for zero weight', () => {
			const calories = calculateCalories(10, 0, 1);
			expect(calories).to.be.NaN;
		});

		it('should return NaN for negative weight', () => {
			const calories = calculateCalories(10, -70, 1);
			expect(calories).to.be.NaN;
		});

		it('should return NaN for negative time', () => {
			const calories = calculateCalories(10, 70, -1);
			expect(calories).to.be.NaN;
		});
	});

	describe('calculatePace', () => {
		it('should calculate pace correctly', () => {
			const pace = calculatePace(10);
			expect(pace).to.equal('6:00');
		});

		it('should handle very slow speeds', () => {
			const pace = calculatePace(2);
			expect(pace).to.equal('30:00');
		});

		it('should return "0:00" for zero speed', () => {
			const pace = calculatePace(0);
			expect(pace).to.equal('0:00');
		});

		it('should format seconds with leading zero', () => {
			const pace = calculatePace(12);
			expect(pace).to.equal('5:00');
		});

		it('should handle very high speeds', () => {
			const pace = calculatePace(20);
			expect(pace).to.equal('3:00');
		});

		it('should calculate pace with decimals correctly', () => {
			const pace = calculatePace(8.5);
			expect(pace).to.equal('7:03');
		});

		it('should handle speed very close to zero', () => {
			const pace = calculatePace(0.1);
			expect(pace).to.equal('600:00');
		});

		it('should handle extremely high speed', () => {
			const pace = calculatePace(100);
			expect(pace).to.equal('0:36');
		});

		it('should return "0:00" for negative speed', () => {
			const pace = calculatePace(-10);
			expect(pace).to.equal('0:00');
		});

		it('should handle speed that produces seconds close to 60', () => {
			const pace = calculatePace(11.11);
			expect(pace).to.equal('5:24');
		});
	});

	describe("calculateElevation", () => {

		it("should return elevation difference for normal altitudes", () => {
			const coords = [
				{ latitude: 0, longitude: 0, timestamp: 0, altitude: 100 },
				{ latitude: 0, longitude: 0, timestamp: 0, altitude: 150 },
				{ latitude: 0, longitude: 0, timestamp: 0, altitude: 120 }
			];
			const result = calculateElevation(coords);
			expect(result).to.equal(50);
		});

		it("should return 0 when all altitudes are equal", () => {
			const coords = [
				{ latitude: 0, longitude: 0, timestamp: 0, altitude: 80 },
				{ latitude: 0, longitude: 0, timestamp: 0, altitude: 80 },
				{ latitude: 0, longitude: 0, timestamp: 0, altitude: 80 }
			];
			const result = calculateElevation(coords);
			expect(result).to.equal(0);
		});

		it("should ignore undefined altitudes", () => {
			const coords = [
				{ latitude: 0, longitude: 0, timestamp: 0, altitude: 100 },
				{ latitude: 0, longitude: 0, timestamp: 0 }, // sin altitud
				{ latitude: 0, longitude: 0, timestamp: 0, altitude: 90 }
			];
			const result = calculateElevation(coords);
			expect(result).to.equal(10);
		});

		it("should work with negative altitudes", () => {
			const coords = [
				{ latitude: 0, longitude: 0, timestamp: 0, altitude: -50 },
				{ latitude: 0, longitude: 0, timestamp: 0, altitude: -10 },
				{ latitude: 0, longitude: 0, timestamp: 0, altitude: -30 }
			];
			const result = calculateElevation(coords);
			expect(result).to.equal(40);
		});

		it("should return 0 when array has only one coordinate", () => {
			const coords = [
				{ latitude: 0, longitude: 0, timestamp: 0, altitude: 123 }
			];
			const result = calculateElevation(coords);
			expect(result).to.equal(0);
		});

		it("should never return negative elevation", () => {
			const coords = [
				{ latitude: 0, longitude: 0, timestamp: 0, altitude: 50 },
				{ latitude: 0, longitude: 0, timestamp: 0, altitude: 50 }
			];
			const result = calculateElevation(coords);
			expect(result).to.equal(0);
		});

	});
	 describe('calculateAvgSpeed', () => {
		it('should calculate average speed correctly for 10 km in 1 hour', () => {
			const avg = calculateAvgSpeed(10, 3600); // 10 km, 3600s
			expect(avg).to.be.closeTo(10, 0.0001);
		});

		it('should calculate average speed correctly for 5 km in 30 minutes', () => {
			const avg = calculateAvgSpeed(5, 1800); // 5 km, 1800s => 10 km/h
			expect(avg).to.be.closeTo(10, 0.0001);
		});

		it('should return 0 when totalSeconds is 0', () => {
			const avg = calculateAvgSpeed(5, 0);
			expect(avg).to.equal(0);
		});
	});

	describe('calculateMaxSpeed', () => {
		it('should return the maximum speed from array', () => {
			const speeds = [3.2, 7.5, 12.1, 9.9];
			const max = calculateMaxSpeed(speeds);
			expect(max).to.equal(12.1);
		});

		it('should return 0 for empty speeds array', () => {
			const max = calculateMaxSpeed([]);
			expect(max).to.equal(0);
		});

		it('should handle single-element array', () => {
			const max = calculateMaxSpeed([5.5]);
			expect(max).to.equal(5.5);
		});
	});
});