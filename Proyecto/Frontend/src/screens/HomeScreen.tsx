import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Alert, Modal, TextInput } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import GRButton from '../components/GRButton';
import { theme } from '../config/designSystem';
import { commonStyles } from '../config/commonStyles';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { apiUrl } from '../config/api';
import logo from '../../assets/logo.png';

export default function HomeScreen() {
	const { user } = useAuth();
	const userName = user?.names || 'Runner';
	const userImage = user?.profilePhoto
		? apiUrl(`/images/${user.profilePhoto}`)
		: apiUrl('/images/nouserimage.png');
	const navigation = useNavigation();
	const [location, setLocation] = useState<Location.LocationObject | null>(null);
	const [hasPermission, setHasPermission] = useState<boolean | null>(null);

	useEffect(() => {
		requestLocationPermission();
	}, []);

	const requestLocationPermission = async () => {
		try {
			const { status } = await Location.requestForegroundPermissionsAsync();

			if (status !== 'granted') {
				setHasPermission(false);
				return;
			}

			setHasPermission(true);

			// Get current location
			const currentLocation = await Location.getCurrentPositionAsync({});
			setLocation(currentLocation);

			// Watch position for real-time updates
			Location.watchPositionAsync(
				{
					accuracy: Location.Accuracy.High,
					timeInterval: 5000,
					distanceInterval: 10
				},
				(newLocation) => {
					setLocation(newLocation);
				}
			);
		} catch {
			setHasPermission(false);
		}
	};

	const handleNewTraining = () => {
		// Pass current location to Training screen so it can center immediately
		if (location) {
			const typedNav = navigation as { navigate: (name: string, params?: any) => void };
			typedNav.navigate('Training', { initialLocation:{ latitude: location.coords.latitude, longitude: location.coords.longitude }});
		} else {
			navigation.navigate('Training' as never);
		}
	};

	const handleRecordGhost = () => {
		// Open modal to select distance for Ghost recording
		setShowGhostModal(true);
	};

	// Modal state & input
	const [showGhostModal, setShowGhostModal] = useState(false);
	// default is 5 km
	const [ghostDistanceInput, setGhostDistanceInput] = useState('5');

	const handleCancelGhost = () => {
		setShowGhostModal(false);
	};

	const handleConfirmRecordGhost = () => {
		const distance = Number(ghostDistanceInput);
		if (!distance || distance <= 0) {
			Alert.alert('Invalid distance', 'Please provide a positive numeric distance in kilometers.');
			return;
		}
		setShowGhostModal(false);
		// Navigate to Training screen with ghost params so user can confirm and start
		const typedNav = navigation as { navigate: (name: string, params?: { isGhost?: boolean; ghostDistanceKm?: number }) => void };
		typedNav.navigate('Training', { isGhost: true, ghostDistanceKm: distance });
	};
	const handleSavedRoutes = () => Alert.alert('Saved Routes', 'Opening saved routes...');
	const handleTrainingHistory = () => {
		const typedNav = navigation as { navigate: (name: string, params?: any) => void };
		typedNav.navigate('History');
	};

	return (
		<SafeAreaView style={commonStyles.container} edges={['top', 'bottom']}>
			{/* Header with user info */}
			<View style={commonStyles.header}>
				<View style={styles.userInfoContainer}>
					<View style={styles.smallProfileImageContainer}>
						<Image
							source={{ uri: userImage }}
							style={commonStyles.profileImage}
							defaultSource={logo}
						/>
					</View>
					<Text style={styles.welcomeText}>Welcome back, {userName}!</Text>
				</View>
			</View>

			{/* Map Section */}
			<View style={styles.mapContainer}>
				{hasPermission === false ? (
					<View style={styles.permissionDeniedContainer}>
						<Text style={styles.permissionDeniedText}>📍 Please enable GPS permissions</Text>
						<GRButton label="Enable Location" variant="primary" onPress={requestLocationPermission} />
					</View>
				) : location ? (
					<MapView
						style={styles.map}
						provider={PROVIDER_GOOGLE}
						initialRegion={{
							latitude: location.coords.latitude,
							longitude: location.coords.longitude,
							latitudeDelta: 0.01,
							longitudeDelta: 0.01
						}}
						showsUserLocation={true}
						showsMyLocationButton={true}
						followsUserLocation={true}
					>
					</MapView>
				) : (
					<View style={styles.loadingContainer}>
						<Text style={styles.loadingText}>Loading map...</Text>
					</View>
				)}
			</View>

			{/* Action Buttons */}
			<View style={styles.actionsWrapper}>
				<GRButton label="🏃 Start New Training" variant="primary" onPress={handleNewTraining} />
				<GRButton label="👻 Record Ghost" variant="secondary" onPress={handleRecordGhost} />
				<View style={styles.row}>
					<GRButton style={styles.flexButton} label="📍 Saved Routes" variant="secondary" onPress={handleSavedRoutes} />
					<GRButton style={styles.flexButton} label="📊 History" variant="secondary" onPress={handleTrainingHistory} />
				</View>
			</View>

			{/* Ghost recording modal */}
			<Modal visible={showGhostModal} transparent animationType="slide">
				<View style={styles.modalOverlay}>
					<View style={styles.modalContent}>
						<Text style={styles.modalTitle}>Record Ghost</Text>
						<Text style={styles.modalText}>Enter distance (km) to save a ghost for</Text>
						<TextInput
							value={ghostDistanceInput}
							onChangeText={setGhostDistanceInput}
							keyboardType="numeric"
							style={styles.modalInput}
							placeholderTextColor="#bbb"
							placeholder="5"
						/>
						<View style={styles.modalButtonsRow}>
							<GRButton label="Cancel" variant="secondary" onPress={handleCancelGhost} style={styles.modalButton} />
							<GRButton label="Record" variant="primary" onPress={handleConfirmRecordGhost} style={styles.modalButton} />
						</View>
					</View>
				</View>
			</Modal>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	userInfoContainer: {
		flexDirection: 'row',
		alignItems: 'center'
	},
	smallProfileImageContainer: {
		width: 60,
		height: 60,
		borderRadius: 30,
		borderWidth: 3,
		borderColor: theme.colors.primary,
		padding: 2,
		marginRight: theme.spacing.l
	},
	smallPlaceholderText: {
		color: theme.colors.textPrimary,
		fontSize: theme.typography.size.xl,
		fontWeight: theme.typography.weight.bold
	},
	welcomeText: { color: theme.colors.textPrimary, fontSize: theme.typography.size.xl, fontWeight: theme.typography.weight.bold, flex: 1 },
	mapContainer: { flex: 1, margin: theme.spacing.l, borderRadius: theme.radii.l, overflow: 'hidden', backgroundColor: theme.colors.surface },
	map: {
		width: '100%',
		height: '100%'
	},
	permissionDeniedContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 20
	},
	permissionDeniedText: { color: theme.colors.textPrimary, fontSize: theme.typography.size.l, textAlign: 'center', marginBottom: theme.spacing.xl },

	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center'
	},
	loadingText: { color: theme.colors.textPrimary, fontSize: theme.typography.size.l },
	actionsWrapper: { padding: theme.spacing.l, gap: theme.spacing.m },
	row: { flexDirection: 'row', gap: theme.spacing.m },
	flexButton: { flex: 1 },
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.6)',
		justifyContent: 'center',
		alignItems: 'center'
	},
	modalContent: {
		backgroundColor: theme.colors.surface,
		padding: theme.spacing.xl,
		borderRadius: theme.radii.m,
		width: '90%'
	},
	modalTitle: {
		color: theme.colors.textPrimary,
		fontSize: theme.typography.size.xl,
		fontWeight: theme.typography.weight.bold,
		marginBottom: theme.spacing.s
	},
	modalText: {
		color: theme.colors.textSecondary,
		marginBottom: theme.spacing.m
	},
	modalInput: {
		borderWidth: 1,
		borderColor: theme.colors.border,
		borderRadius: theme.radii.s,
		padding: theme.spacing.s,
		marginBottom: theme.spacing.m,
		color: '#ffffff'
	},
	modalButtonsRow: { flexDirection: 'row', gap: theme.spacing.m },
	modalButton: { flex: 1 }
});
