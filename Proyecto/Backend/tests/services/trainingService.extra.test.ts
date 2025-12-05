import { expect } from 'chai';
import { describe, it } from 'mocha';
import { calculateAvgSpeed, calculateMaxSpeed } from '../../src/services/trainingService';

/**
 * Additional unit tests for trainingService functions.
 * These tests exercise non-trivial and edge cases (zero/invalid inputs,
 * very small/large values) and are runnable via the project's test script:
 *   cd Proyecto/Backend
 *   npm test
 */
describe('TrainingService Additional Tests', () => {

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

		it('should handle fractional seconds and distances', () => {
			// 2.5 km in 900.5 seconds -> avgSpeed close to (2.5/900.5)*3600
			const avg = calculateAvgSpeed(2.5, 900.5);
			const expected = (2.5 / 900.5) * 3600;
			expect(avg).to.be.closeTo(expected, 0.0001);
		});

		it('should handle very large totalSeconds without precision loss', () => {
			const avg = calculateAvgSpeed(1000, 3600 * 24); // 1000 km in 24 hours
			expect(avg).to.be.closeTo((1000 / (3600 * 24)) * 3600, 1e-6);
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

		it('should return the largest when negative values exist', () => {
			const max = calculateMaxSpeed([-1.2, -0.5, -3.0]);
			expect(max).to.equal(-0.5);
		});

		it('should handle mixed zero and positive values', () => {
			const max = calculateMaxSpeed([0, 0, 0.0001]);
			expect(max).to.equal(0.0001);
		});
	});

});
