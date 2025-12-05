import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRoute } from '@react-navigation/native';
import { haversineMeters } from '../utils/locationUtils';
import { View, Text, StyleSheet, Alert, Modal } from 'react-native';
import MapView, { Polyline, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import * as Speech from 'expo-speech';
import { theme } from '../config/designSystem';
import { commonStyles } from '../config/commonStyles';
import GRButton from '../components/GRButton';
import GhostMarker from '../components/GhostMarker';
import { apiUrl } from '../config/api';

interface Coordinate {
	latitude: number;
	longitude: number;
	timestamp: number;
	altitude?: number;
	isPause?: boolean;
}

interface TrainingScreenProps {
	userEmail?: string;
}

export default function TrainingScreen({ userEmail }: TrainingScreenProps) {
	const navigation = useNavigation();
	const navRoute = useRoute();
	const mapRef = useRef<MapView | null>(null);
	const [isTracking, setIsTracking] = useState(false);
	const [isPaused, setIsPaused] = useState(false);
	const [showPauseModal, setShowPauseModal] = useState(false);
	const [duration, setDuration] = useState(0);
	const [currentSpeed, setCurrentSpeed] = useState(0);
	const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
	const [route, setRoute] = useState<Coordinate[]>([]);
	const [totalDistanceMeters, setTotalDistanceMeters] = useState(0);
	const totalDistanceRef = useRef<number>(0);

	// Ghost racing state
	const [ghostPosition, setGhostPosition] = useState<Coordinate | null>(null);
	const [ghostElapsedDistance, setGhostElapsedDistance] = useState(0);
	const [lastAnnouncementDistance, setLastAnnouncementDistance] = useState(0);
	const [lastAnnouncementGhostDistance, setLastAnnouncementGhostDistance] = useState(0);
	const [lastAnnouncementTime, setLastAnnouncementTime] = useState(0);

	// Refs for stable closures
	const subscriptionRef = useRef<Location.LocationSubscription | null>(null);
	const autoStoppedRef = useRef<boolean>(false);

	// On mount, try to get current location so initialRegion centers on user
	useEffect(() => {
		let mounted = true;
		(async () => {
			try {
				const { status } = await Location.requestForegroundPermissionsAsync();
				if (status !== 'granted') { return; }
				const loc = await Location.getCurrentPositionAsync({});
				if (mounted && loc) {
					setCurrentLocation(loc);
					// if map exists, animate to current location
					if (mapRef.current && (mapRef.current as any).animateToRegion) {
						try {
							(mapRef.current as any).animateToRegion({
								latitude: Number(loc.coords.latitude),
								longitude: Number(loc.coords.longitude),
								latitudeDelta: 0.01,
								longitudeDelta: 0.01
							}, 400);
						} catch (err) { void err; }
					}
				}
			} catch (err) {
				// ignore permission/position failures here; Start button will re-request
				void err;
			}
		})();
		return () => { mounted = false; };
	}, []);

	type NavParams = {
		isGhost?: boolean;
		ghostDistanceKm?: number;
		runAgainstGhost?: boolean;
		ghostTraining?: any;
		initialLocation?: { latitude: number; longitude: number };
	} | undefined;
	const navParams = (navRoute.params as NavParams) || {};

	const { user } = useAuth();

	// If navigation provided an initialLocation (from Home), set currentLocation immediately
	useEffect(() => {
		const init = (navRoute.params as any)?.initialLocation;
		if (init && init.latitude && init.longitude) {
			const locObj = {
				coords: {
					latitude: Number(init.latitude),
					longitude: Number(init.longitude),
					altitude: 0,
					accuracy: 0,
					heading: 0,
					speed: 0
				},
				timestamp: Date.now()
			} as any;
			setCurrentLocation(locObj);
			if (mapRef.current && (mapRef.current as any).animateToRegion) {
				try {
					(mapRef.current as any).animateToRegion({ latitude: Number(init.latitude), longitude: Number(init.longitude), latitudeDelta: 0.01, longitudeDelta: 0.01 }, 400);
				} catch (err) { void err; }
			}
		}
	}, [navRoute.params]);

	// Ghost training data
	const ghostTraining = navParams?.runAgainstGhost ? navParams.ghostTraining : null;
	const ghostRoute = ghostTraining?.route || [];
	const ghostDurationSeconds = ghostTraining?.duration ? parseDuration(ghostTraining.duration) : 0;
	const ghostDistance = ghostTraining?.distance || 0;

	// Target distance for auto-stop: either from ghost recording or ghost racing
	// When racing against a ghost, use the ghost's recorded distance
	// Otherwise use the input `ghostDistanceKm` parameter (in kilometers)
	const targetDistanceMeters = ghostTraining
		? (ghostDistance * 1000)
		: (Number(navParams?.ghostDistanceKm || 0) * 1000);

	// Parse HH:MM:SS to seconds
	function parseDuration(durationStr: string): number {
		const parts = durationStr.split(':').map(Number);
		return parts[0] * 3600 + parts[1] * 60 + parts[2];
	}

	// Audio announcement function
	const announceProgress = (userDistance: number, ghostDistParam: number) => {
		const difference = Math.round(userDistance - ghostDistParam);
		const absDifference = Math.abs(difference);

		let message = '';
		if (difference > 0) {
			message = `You are ${absDifference} meters ahead of your ghost`;
		} else if (difference < 0) {
			message = `You are ${absDifference} meters behind your ghost`;
		} else {
			message = `You are tied with your ghost`;
		}

		Speech.speak(message, {
			language: 'en-US',
			pitch: 1.0,
			rate: 0.9
		});
	};

	useEffect(() => {
		let interval: NodeJS.Timeout;
		if (isTracking && !isPaused) {
			interval = setInterval(() => {
				setDuration(prev => prev + 1);
			}, 1000);
		}
		return () => clearInterval(interval);
	}, [isTracking, isPaused]);

	// Check for audio announcements during ghost race
	useEffect(() => {
		if (!ghostTraining || !isTracking || isPaused) {return;}

		// Announcement settings
		// ANNOUNCEMENT_INTERVAL: meters threshold for announcements (used for testing)
		const ANNOUNCEMENT_INTERVAL = 100;
		// MIN_TIME_BETWEEN_ANNOUNCEMENTS: seconds between announcements
		const MIN_TIME_BETWEEN_ANNOUNCEMENTS = 15;
		// Convert ghost distance (km) to meters
		const targetDistance = ghostDistance * 1000;
		// Ten percent of total distance
		const tenPercent = targetDistance * 0.1;

		// Announce every 100m or 10% (whichever comes first)
		const announcementThreshold = Math.min(ANNOUNCEMENT_INTERVAL, tenPercent);

		// Calculate distance traveled since last announcement for both user and ghost
		const userDistanceSinceAnnouncement = totalDistanceMeters - lastAnnouncementDistance;
		const ghostDistanceSinceAnnouncement = ghostElapsedDistance - lastAnnouncementGhostDistance;

		// Calculate time since last announcement
		// Calculate time since last announcement (in seconds)
		const currentTime = Date.now();
		const timeSinceLastAnnouncement = (currentTime - lastAnnouncementTime) / 1000;

		// Check if either user OR ghost has traveled the threshold distance
		// Check if either user OR ghost has traveled the threshold distance
		const shouldAnnounceByDistance = userDistanceSinceAnnouncement >= announcementThreshold ||
											ghostDistanceSinceAnnouncement >= announcementThreshold;

		// Check if enough time has passed (or if this is the first announcement)
		const shouldAnnounceByTime = lastAnnouncementTime === 0 || timeSinceLastAnnouncement >= MIN_TIME_BETWEEN_ANNOUNCEMENTS;

		// Announce if both conditions are met
		if (shouldAnnounceByDistance && shouldAnnounceByTime) {
			announceProgress(totalDistanceMeters, ghostElapsedDistance);
			setLastAnnouncementDistance(totalDistanceMeters);
			setLastAnnouncementGhostDistance(ghostElapsedDistance);
			setLastAnnouncementTime(currentTime);
		}
	}, [totalDistanceMeters, ghostElapsedDistance, isTracking, isPaused, ghostTraining]);

	// Ghost simulation: update ghost position based on elapsed time
	useEffect(() => {
		if (!ghostTraining || !isTracking || isPaused || ghostRoute.length === 0) {return;}

		// Calculate ghost speed (meters per second)
		const ghostSpeedMps = (ghostDistance * 1000) / ghostDurationSeconds;

		const interval = setInterval(() => {
			setGhostElapsedDistance(prev => {
				// advance by ghostSpeedMps meters (approx meters per second)
				const newDistance = prev + ghostSpeedMps;

				// Find position along ghost route based on distance
				let accumulatedDist = 0;
				for (let i = 0; i < ghostRoute.length - 1; i++) {
					const segmentDist = haversineMeters(ghostRoute[i], ghostRoute[i + 1]);
					if (accumulatedDist + segmentDist >= newDistance) {
						// Interpolate position along this segment
						const remainingDist = newDistance - accumulatedDist;
						const ratio = remainingDist / segmentDist;
						const lat = ghostRoute[i].latitude + (ghostRoute[i + 1].latitude - ghostRoute[i].latitude) * ratio;
						const lon = ghostRoute[i].longitude + (ghostRoute[i + 1].longitude - ghostRoute[i].longitude) * ratio;
						setGhostPosition({ latitude: lat, longitude: lon, timestamp: Date.now() });
						break;
					}
					accumulatedDist += segmentDist;
				}

				return newDistance;
			});
		}, 1000);

		return () => clearInterval(interval);
	}, [isTracking, isPaused, ghostTraining]);

	useEffect(() => {
		let mounted = true;

		const startTracking = async () => {
			if (isTracking && !isPaused) {
				// reset autoStopped refs when we (re)start
				autoStoppedRef.current = false;

				const sub = await Location.watchPositionAsync(
					{
						accuracy: Location.Accuracy.BestForNavigation,
						timeInterval: 3000,
						distanceInterval: 10
					},
					(location) => {
						// Build new point
						const newPoint: Coordinate = {
							latitude: location.coords.latitude,
							longitude: location.coords.longitude,
							timestamp: Date.now(),
							altitude: location.coords.altitude || 0
						};

						// Append to route and compute incremental distance.
						// Append to route and compute incremental distance.
						setRoute(prev => {
							const newRoute = [...prev, newPoint];
							const prevPoint = prev[prev.length - 1];
							if (prevPoint) {
								const d = haversineMeters(prevPoint, newPoint);
								// compute new total using ref to avoid deep nested callbacks
								const newTotal = totalDistanceRef.current + d;
								totalDistanceRef.current = newTotal;
								setTotalDistanceMeters(newTotal);
								// Auto-stop logic using ref to avoid stale closures
								if (targetDistanceMeters > 0 && newTotal >= targetDistanceMeters && !autoStoppedRef.current) {
									autoStoppedRef.current = true;
									// stop tracking and finish the training
									setIsTracking(false);
									// slight delay to let UI update before finishing
									setTimeout(() => {
										// ensure we only finish if the component is still mounted
										if (mounted) { handleFinish(); }
									}, 100);
								}
							}
							return newRoute;
						});

						// update location and speed (keep these as independent state updates)
						setCurrentLocation(location);
						const speed = (location.coords.speed || 0) * 3.6;
						setCurrentSpeed(speed);
					}
				);

				// Keep subscription in a ref — safer for cleanup
				subscriptionRef.current = sub;
			}
		};

		startTracking();

		// cleanup: remove subscription on pause/stop or unmount
		return () => {
			mounted = false;
			if (subscriptionRef.current) {
				try {
					subscriptionRef.current.remove();
				} catch (e) {
					// sometimes removing fails when the subscription is already invalid — ignore
					console.warn('Failed removing subscription:', e);
				}
				subscriptionRef.current = null;
			}
		};
	}, [isTracking, isPaused, targetDistanceMeters]);

	const formatTime = (seconds: number): string => {
		const hrs = Math.floor(seconds / 3600);
		const mins = Math.floor((seconds % 3600) / 60);
		const secs = seconds % 60;
		return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	};

	const handleStart = async () => {
		const { status } = await Location.requestForegroundPermissionsAsync();
		if (status !== 'granted') {
			Alert.alert('Permission Required', 'Please enable GPS permissions');
			return;
		}
		const location = await Location.getCurrentPositionAsync({});
		setCurrentLocation(location);
		// center map when starting
		if (mapRef.current && (mapRef.current as any).animateToRegion) {
			(mapRef.current as any).animateToRegion({
				latitude: location.coords.latitude,
				longitude: location.coords.longitude,
				latitudeDelta: 0.01,
				longitudeDelta: 0.01
			}, 500);
		}
		const startPoint: Coordinate = {
			latitude: location.coords.latitude,
			longitude: location.coords.longitude,
			timestamp: Date.now(),
			altitude: location.coords.altitude || 0
		};
		// re-init route/distance/duration and tracking flags
		setRoute([startPoint]);
		setTotalDistanceMeters(0);
		totalDistanceRef.current = 0;
		setDuration(0);
		setLastAnnouncementDistance(0);
		setLastAnnouncementGhostDistance(0);
		setLastAnnouncementTime(0);
		autoStoppedRef.current = false;
		setIsTracking(true);
		setIsPaused(false);

		// Initialize ghost position if racing against ghost
		if (ghostTraining && ghostRoute.length > 0) {
			setGhostPosition(ghostRoute[0]);
			setGhostElapsedDistance(0);
		}
	};

	const handlePause = () => {
		setIsPaused(true);
		setShowPauseModal(true);
		if (route.length > 0) {
			const pausePoint: Coordinate = {
				...route[route.length - 1],
				isPause: true
			};
			setRoute(prev => [...prev, pausePoint]);
		}
	};

	const handleContinue = () => {
		setIsPaused(false);
		setShowPauseModal(false);
	};

	const handleFinish = async () => {
		// Stop tracking and clear any subscription immediately
		setIsTracking(false);
		setShowPauseModal(false);

		if (subscriptionRef.current) {
			try {
				subscriptionRef.current.remove();
			} catch (e) {
				console.warn('Error removing subscription on finish:', e);
			}
			subscriptionRef.current = null;
		}

		if (route.length < 2) {
			Alert.alert('Error', 'Not enough data recorded');
			navigation.goBack();
			return;
		}
		try {
			// fit map to route before calculating and navigating
			const routeCoords = route.filter(p => !p.isPause).map(p => ({ latitude: p.latitude, longitude: p.longitude }));
			if (mapRef.current && routeCoords.length > 0 && (mapRef.current as any).fitToCoordinates) {
				(mapRef.current as any).fitToCoordinates(routeCoords, { edgePadding: { top: 80, right: 80, bottom: 120, left: 80 }, animated: true });
				await new Promise(resolve => setTimeout(resolve, 700));
			}
			const response = await fetch(apiUrl('/api/trainings/calculate'), {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					coordinates: route.filter(p => !p.isPause),
					userWeight: 70
				})
			});
			if (response.ok) {
				const stats = await response.json();

				// If racing against ghost, compare performance
				let beatGhost = false;
				let ghostInfo = null;
				if (ghostTraining) {
					// Compare times for the same distance
					// Parse ghost duration (HH:MM:SS) to seconds
					const ghostDurationSec = ghostDurationSeconds;
					const userDurationSec = duration;

					// User beat the ghost if they completed the distance in less time
					beatGhost = userDurationSec < ghostDurationSec;
					ghostInfo = {
						ghostCounter: ghostTraining.counter,
						ghostDistance: ghostDistance,
						beatGhost: beatGhost
					};
				}

				navigation.reset({
					index: 1,
					routes: [
						{ name: 'Main' as never },
						{ name: 'ResumeTraining' as never, params: {
							...stats,
							route: route.filter(p => !p.isPause),
							userEmail: userEmail || user?.email,
							isGhost: navParams?.isGhost,
							...ghostInfo
						} as never }
					]
				});
			} else {
				Alert.alert('Error', 'Failed to calculate training stats');
			}
		} catch (error) {
			console.error('Error calculating training:', error);
			Alert.alert('Error', 'Failed to process training data');
		}
	};

	return (
		<SafeAreaView style={commonStyles.container} edges={['top', 'bottom']}>
			<MapView
				ref={mapRef}
				style={styles.map}
				provider={PROVIDER_GOOGLE}
				initialRegion={{
					latitude: Number(currentLocation?.coords.latitude) || Number(ghostRoute[0]?.latitude) || 37.78825,
					longitude: Number(currentLocation?.coords.longitude) || Number(ghostRoute[0]?.longitude) || -122.4324,
					latitudeDelta: 0.01,
					longitudeDelta: 0.01
				}}
				showsUserLocation={!ghostTraining}
				followsUserLocation={true}
			>
				{/* Ghost route - white color */}
				{ghostTraining && ghostRoute.length > 1 && (
					<Polyline
						coordinates={ghostRoute.map((p: any) => ({ latitude: Number(p.latitude), longitude: Number(p.longitude) }))}
						strokeColor="#FFFFFF"
						strokeWidth={4}
						lineDashPattern={[10, 5]}
					/>
				)}

				{/* Current user route - orange color */}
				{route.length > 1 && (
					<Polyline
						coordinates={route.filter(p => !p.isPause).map((p: any) => ({ latitude: Number(p.latitude), longitude: Number(p.longitude) }))}
						strokeColor="#FF6B35"
						strokeWidth={4}
					/>
				)}

				{/* Ghost marker - white pin */}
				{ghostTraining && ghostPosition && (
					<Marker
						coordinate={{ latitude: Number(ghostPosition.latitude), longitude: Number(ghostPosition.longitude) }}
						anchor={{ x: 0.5, y: 0.5 }}
					>
						<GhostMarker />
					</Marker>
				)}

				{/* Current user marker - orange pin */}
				{currentLocation && (
					<Marker
						coordinate={{
							latitude: Number(currentLocation.coords.latitude),
							longitude: Number(currentLocation.coords.longitude)
						}}
						title="You"
						pinColor="orange"
					/>
				)}
			</MapView>

			{/* Racing info banner */}
			{ghostTraining && isTracking && (
				<View style={styles.racingBanner}>
					<Text style={styles.racingText}>
						👻 Racing against Ghost | Ghost: {(ghostElapsedDistance / 1000).toFixed(2)} km | You: {(totalDistanceMeters / 1000).toFixed(2)} km
					</Text>
				</View>
			)}

			<View style={styles.statsPanel}>
				<View style={styles.statItem}>
					<Text style={styles.statLabel}>Duration</Text>
					<Text style={styles.statValue}>{formatTime(duration)}</Text>
				</View>
				<View style={styles.statItem}>
					<Text style={styles.statLabel}>Speed</Text>
					<Text style={styles.statValue}>{currentSpeed.toFixed(1)} km/h</Text>
				</View>
				<View style={styles.statItem}>
					<Text style={styles.statLabel}>Distance</Text>
					<Text style={styles.statValue}>{(totalDistanceMeters / 1000).toFixed(2)} km</Text>
				</View>
			</View>
			<View style={styles.controls}>
				{!isTracking ? (
					<GRButton label="🏃 Start Training" variant="primary" onPress={handleStart} />
				) : (
					<View style={styles.trackingControls}>
						<GRButton
							label={isPaused ? "▶️ Continue" : "⏸️ Pause"}
							variant="secondary"
							onPress={isPaused ? handleContinue : handlePause}
							style={styles.controlButton}
						/>
						<GRButton
							label="🏁 Finish"
							variant="primary"
							onPress={handleFinish}
							style={styles.controlButton}
						/>
					</View>
				)}
			</View>
			<Modal visible={showPauseModal} transparent animationType="fade">
				<View style={styles.modalOverlay}>
					<View style={styles.modalContent}>
						<Text style={styles.modalTitle}>⏸️ Training Paused</Text>
						<Text style={styles.modalText}>Take a break and continue when ready</Text>
						<View style={styles.modalStats}>
							<Text style={styles.modalStat}>⏱️ {formatTime(duration)}</Text>
							<Text style={styles.modalStat}>📍 {route.length} points</Text>
						</View>
						<View style={styles.modalButtons}>
							<GRButton
								label="▶️ Continue"
								variant="primary"
								onPress={handleContinue}
								style={styles.modalButton}
							/>
							<GRButton
								label="🏁 Finish"
								variant="secondary"
								onPress={handleFinish}
								style={styles.modalButton}
							/>
						</View>
					</View>
				</View>
			</Modal>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	map: { flex: 1 },
	racingBanner: {
		position: 'absolute',
		top: 10,
		left: 10,
		right: 10,
		backgroundColor: 'rgba(0, 0, 0, 0.7)',
		padding: theme.spacing.m,
		borderRadius: theme.radii.m,
		alignItems: 'center'
	},
	racingText: {
		color: '#FFFFFF',
		fontSize: theme.typography.size.s,
		fontWeight: '600'
	},
	statsPanel: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		padding: theme.spacing.l,
		backgroundColor: theme.colors.surface,
		borderTopWidth: 1,
		borderTopColor: theme.colors.border
	},
	statItem: { alignItems: 'center' },
	statLabel: {
		color: theme.colors.textSecondary,
		fontSize: theme.typography.size.s,
		marginBottom: theme.spacing.xs
	},
	statValue: {
		color: theme.colors.textPrimary,
		fontSize: theme.typography.size.xl,
		fontWeight: theme.typography.weight.bold
	},
	controls: { padding: theme.spacing.l, gap: theme.spacing.m },
	trackingControls: { flexDirection: 'row', gap: theme.spacing.m },
	controlButton: { flex: 1 },
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.8)',
		justifyContent: 'center',
		alignItems: 'center'
	},
	modalContent: {
		backgroundColor: theme.colors.surface,
		borderRadius: theme.radii.l,
		padding: theme.spacing.xxl,
		width: '85%',
		alignItems: 'center'
	},
	modalTitle: {
		color: theme.colors.textPrimary,
		fontSize: theme.typography.size.xxl,
		fontWeight: theme.typography.weight.bold,
		marginBottom: theme.spacing.m
	},
	modalText: {
		color: theme.colors.textSecondary,
		fontSize: theme.typography.size.m,
		textAlign: 'center',
		marginBottom: theme.spacing.xl
	},
	modalStats: { flexDirection: 'row', gap: theme.spacing.xl, marginBottom: theme.spacing.xl },
	modalStat: {
		color: theme.colors.textPrimary,
		fontSize: theme.typography.size.l,
		fontWeight: theme.typography.weight.semibold
	},
	modalButtons: { flexDirection: 'row', gap: theme.spacing.m, width: '100%' },
	modalButton: { flex: 1 }
});
