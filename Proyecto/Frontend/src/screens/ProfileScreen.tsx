import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Modal, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { commonStyles } from '../config/commonStyles';
import { theme } from '../config/designSystem';
import GRButton from '../components/GRButton';
import FollowersListModal from '../components/FollowersListModal';
import PhysicalStateModal from '../components/PhysicalStateModal';
import OtherUserProfileScreen from './OtherUserProfileScreen';
import { useAuth } from '../context/AuthContext';
import { apiUrl } from '../config/api';
import logo from '../../assets/logo.png';

export default function ProfileScreen() {
	const { user, logout, setUser } = useAuth();

	const userName = user?.names || 'Runner';
	const userEmail = user?.email || 'runner@ghostrunning.com';

	const [trainingsCount, setTrainingsCount] = useState<number>(0);
	const [totalDistanceKm, setTotalDistanceKm] = useState<number>(0);
	const [totalSeconds, setTotalSeconds] = useState<number>(0);
	const [followersCount, setFollowersCount] = useState<number>(0);
	const [followingCount, setFollowingCount] = useState<number>(0);

	// Modals
	const [isEditModalVisible, setIsEditModalVisible] = useState(false);
	const [isFollowersModalVisible, setIsFollowersModalVisible] = useState(false);
	const [isFollowingModalVisible, setIsFollowingModalVisible] = useState(false);
	const [selectedUserProfile, setSelectedUserProfile] = useState<string | null>(null);
	const [followersListType, setFollowersListType] = useState<'followers' | 'following'>('followers');
	const [isPhysicalStateModalVisible, setIsPhysicalStateModalVisible] = useState(false);
	const [currentPhysicalState, setCurrentPhysicalState] = useState<{ date: string; height: number; weight: number } | null>(null);

	// Edit state
	const [isLoading, setIsLoading] = useState(false);
	const [editedNames, setEditedNames] = useState(user?.names || '');
	const [editedLastnames, setEditedLastnames] = useState(user?.lastNames || '');
	const [editedDescription, setEditedDescription] = useState(user?.description || '');
	const [editedAge, setEditedAge] = useState(user?.age?.toString() || '');

	const parseDurationToSeconds = (dur: string | undefined | null) => {
		if (!dur) {return 0;}
		// Expecting HH:MM:SS or H:MM:SS
		const parts = dur.split(':').map(p => Number(p));
		if (parts.length === 3) {
			return (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
		}
		if (parts.length === 2) {
			return (parts[0] || 0) * 60 + (parts[1] || 0);
		}
		return 0;
	};

	const formatSecondsToHrs = (secs: number) => {
		if (!secs) {return '0h';}
		const hours = Math.floor(secs / 3600);
		const mins = Math.floor((secs % 3600) / 60);
		if (hours > 0) {return `${hours}h ${mins}m`;}
		return `${mins}m`;
	};

	const loadProfileStats = useCallback(async () => {
		if (!userEmail) {return;}
		try {
			const resp = await fetch(apiUrl(`/api/trainings/${encodeURIComponent(userEmail)}`));
			if (resp.ok) {
				const data = await resp.json();
				const items = data.trainings || [];
				setTrainingsCount(items.length);
				let dist = 0;
				let secs = 0;
				for (const it of items) {
					dist += Number(it.distance) || 0;
					secs += parseDurationToSeconds(it.duration);
				}
				setTotalDistanceKm(dist);
				setTotalSeconds(secs);
			}
		} catch (err) {
			console.warn('Error loading training stats', err);
		}

		// Always attempt to refresh follow stats, even if trainings fail
		try {
			const followResp = await fetch(apiUrl(`/api/users/${encodeURIComponent(userEmail)}/follow-stats`));
			if (followResp.ok) {
				const followData = await followResp.json();
				setFollowersCount(followData.followerCount || 0);
				setFollowingCount(followData.followingCount || 0);
			}
		} catch (err) {
			console.warn('Error loading follow stats', err);
		}
	}, [userEmail]);

	const loadCurrentPhysicalState = useCallback(async () => {
		if (!userEmail) return;
		try {
			const resp = await fetch(apiUrl(`/api/physical-state/${encodeURIComponent(userEmail)}/current`));
			if (resp.ok) {
				const data = await resp.json();
				if (data.hasPhysicalState) {
					setCurrentPhysicalState(data.physicalState);
				}
			}
		} catch (err) {
			console.warn('Error loading physical state:', err);
		}
	}, [userEmail]);

	useFocusEffect(
		useCallback(() => {
			loadProfileStats();
			loadCurrentPhysicalState();
		}, [loadProfileStats, loadCurrentPhysicalState])
	);
	const userImage = user?.profilePhoto
		? apiUrl(`/images/${user.profilePhoto}`)
		: apiUrl('/images/nouserimage.png');

	// Handle user profile view
	const handleUserProfilePress = (userProfileEmail: string) => {
		setSelectedUserProfile(userProfileEmail);
	};

	const handleUpdateProfile = async () => {
		if (!editedNames || !editedLastnames || !editedAge) {
			Alert.alert('Error', 'Por favor completa todos los campos');
			return;
		}

		setIsLoading(true);
		try {
			const response = await fetch(apiUrl(`/api/users/${encodeURIComponent(userEmail)}/profile`), {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					names: editedNames,
					lastnames: editedLastnames,
					description: editedDescription,
					profilePhoto: user?.profilePhoto || '',
					age: parseInt(editedAge)
				})
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Error al actualizar perfil');
			}

			const result = await response.json();
			// Actualizar contexto para reflejar cambios de inmediato en toda la app
			if (result?.data) {
				setUser(prev => ({
					...prev,
					email: result.data.email,
					username: result.data.username,
					names: result.data.names,
					lastNames: result.data.lastNames,
					description: result.data.description,
					profilePhoto: result.data.profilePhoto,
					age: result.data.age
				} as any));
			}

			Alert.alert('✅ Éxito', 'Perfil actualizado correctamente');
			setIsEditModalVisible(false);
			// Recalcular stats para pantalla actual
			loadProfileStats();
		} catch (error) {
			Alert.alert('❌ Error', error instanceof Error ? error.message : 'Error desconocido');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<SafeAreaView style={commonStyles.container} edges={['top', 'bottom']}>
			<View style={commonStyles.header}>
				<Text style={commonStyles.headerText}>Profile</Text>
			</View>

			{selectedUserProfile ? (
				<OtherUserProfileScreen
					userEmail={selectedUserProfile}
					currentUserEmail={userEmail}
					onGoBack={() => {
						setSelectedUserProfile(null);
						loadProfileStats(); // Refresh stats when returning
					}}
				/>
			) : (
				<ScrollView style={styles.content}>
					{/* Profile Image and Info */}
					<View style={styles.profileSection}>
						<View style={[commonStyles.profileImageContainer, styles.largeProfileImage]}>
							<Image
								source={{ uri: userImage }}
								style={commonStyles.profileImage}
								defaultSource={logo}
							/>
						</View>

						<Text style={styles.userName}>{userName}</Text>
						<Text style={styles.userEmail}>{userEmail}</Text>
					</View>

					{/* Follow Stats - NEW */}
					<View style={styles.followStatsContainer}>
						<TouchableOpacity
							style={styles.followStatCard}
							onPress={() => {
								setFollowersListType('followers');
								setIsFollowersModalVisible(true);
							}}
						>
							<Text style={styles.followStatValue}>{followersCount}</Text>
							<Text style={styles.followStatLabel}>Followers</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={styles.followStatCard}
							onPress={() => {
								setFollowersListType('following');
								setIsFollowingModalVisible(true);
							}}
						>
							<Text style={styles.followStatValue}>{followingCount}</Text>
							<Text style={styles.followStatLabel}>Following</Text>
						</TouchableOpacity>
					</View>

					{/* Stats Section */}
					<View style={styles.statsSection}>
						<View style={styles.statCard}>
							<Text style={styles.statValue}>{trainingsCount}</Text>
							<Text style={styles.statLabel}>Trainings</Text>
						</View>
						<View style={styles.statCard}>
							<Text style={styles.statValue}>{totalDistanceKm.toFixed(2)} km</Text>
							<Text style={styles.statLabel}>Distance</Text>
						</View>
						<View style={styles.statCard}>
							<Text style={styles.statValue}>{formatSecondsToHrs(totalSeconds)}</Text>
							<Text style={styles.statLabel}>Time</Text>
						</View>
					</View>

				{/* Action Buttons */}
				<View style={styles.actionsSection}>
					<GRButton label="💪 Physical State" variant="secondary" style={styles.actionButtonSpacing} onPress={() => setIsPhysicalStateModalVisible(true)} />
					<GRButton label="✏️ Edit Profile" variant="secondary" style={styles.actionButtonSpacing} onPress={() => setIsEditModalVisible(true)} />
					<GRButton label="⚙️ Settings" variant="secondary" style={styles.actionButtonSpacing} />
					<GRButton label="🚪 Logout" variant="primary" onPress={logout} style={styles.actionButtonSpacing} />
				</View>
				</ScrollView>
			)}

			{/* Followers Modal */}
			<FollowersListModal
				visible={isFollowersModalVisible}
				onClose={() => {
					setIsFollowersModalVisible(false);
					loadProfileStats(); // Refresh stats when modal closes
				}}
				currentUserEmail={userEmail}
				type="followers"
				onUserPress={(email) => {
					setIsFollowersModalVisible(false);
					handleUserProfilePress(email);
				}}
			/>

			{/* Following Modal */}
			<FollowersListModal
				visible={isFollowingModalVisible}
				onClose={() => {
					setIsFollowingModalVisible(false);
					loadProfileStats(); // Refresh stats when modal closes
				}}
				currentUserEmail={userEmail}
				type="following"
				onUserPress={(email) => {
					setIsFollowingModalVisible(false);
					handleUserProfilePress(email);
				}}
			/>

		{/* Physical State Modal */}
		<PhysicalStateModal
			visible={isPhysicalStateModalVisible}
			onClose={() => setIsPhysicalStateModalVisible(false)}
			userEmail={userEmail}
			onSuccess={() => loadCurrentPhysicalState()}
			currentPhysicalState={currentPhysicalState}
		/>

		{/* Modal de edición de perfil */}
		<Modal visible={isEditModalVisible} animationType="slide" transparent={false}>
				<SafeAreaView style={commonStyles.container}>
					<View style={commonStyles.header}>
						<Text style={commonStyles.headerText}>Edit Profile</Text>
					</View>
					<ScrollView style={styles.modalContent}>
						<View style={styles.formSection}>
							<Text style={styles.formLabel}>Nombres</Text>
							<TextInput
								style={styles.textInput}
								value={editedNames}
								onChangeText={setEditedNames}
								placeholder="Tu nombre"
								placeholderTextColor={theme.colors.textSecondary}
							/>

							<Text style={styles.formLabel}>Apellidos</Text>
							<TextInput
								style={styles.textInput}
								value={editedLastnames}
								onChangeText={setEditedLastnames}
								placeholder="Tus apellidos"
								placeholderTextColor={theme.colors.textSecondary}
							/>

							<Text style={styles.formLabel}>Edad</Text>
							<TextInput
								style={styles.textInput}
								value={editedAge}
								onChangeText={setEditedAge}
								placeholder="Tu edad"
								placeholderTextColor={theme.colors.textSecondary}
								keyboardType="numeric"
							/>

							<Text style={styles.formLabel}>Descripción</Text>
							<TextInput
								style={[styles.textInput, styles.textAreaInput]}
								value={editedDescription}
								onChangeText={setEditedDescription}
								placeholder="Cuéntanos sobre ti"
								placeholderTextColor={theme.colors.textSecondary}
								multiline={true}
								numberOfLines={5}
							/>
						</View>

						<View style={styles.formButtons}>
							<GRButton
								label={isLoading ? "Guardando..." : "💾 Guardar Cambios"}
								variant="primary"
								onPress={handleUpdateProfile}
								disabled={isLoading}
								style={styles.formButton}
							/>
							<GRButton
								label="❌ Cancelar"
								variant="secondary"
								onPress={() => setIsEditModalVisible(false)}
								disabled={isLoading}
								style={styles.formButton}
							/>
						</View>
					</ScrollView>
				</SafeAreaView>
			</Modal>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	content: {
		flex: 1
	},
	profileSection: {
		alignItems: 'center',
		paddingVertical: theme.spacing.xl * 1.5,
		paddingHorizontal: theme.spacing.xl
	},
	largeProfileImage: {
		marginBottom: theme.spacing.l
	},
	userName: {
		color: theme.colors.textPrimary,
		fontSize: theme.typography.size.xxl,
		fontWeight: '700',
		marginBottom: theme.spacing.xs
	},
	userEmail: {
		color: theme.colors.textSecondary,
		fontSize: theme.typography.size.m
	},
	followStatsContainer: {
		flexDirection: 'row',
		paddingHorizontal: theme.spacing.l,
		marginBottom: theme.spacing.l,
		gap: theme.spacing.m
	},
	followStatCard: {
		flex: 1,
		backgroundColor: theme.colors.surface,
		borderRadius: theme.radii.m,
		paddingVertical: theme.spacing.m,
		paddingHorizontal: theme.spacing.s,
		alignItems: 'center'
	},
	followStatValue: {
		color: theme.colors.primary,
		fontSize: theme.typography.size.l,
		fontWeight: '700',
		marginBottom: theme.spacing.xs
	},
	followStatLabel: {
		color: theme.colors.textSecondary,
		fontSize: theme.typography.size.s
	},
	statsSection: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		paddingVertical: theme.spacing.l,
		paddingHorizontal: theme.spacing.l,
		marginHorizontal: theme.spacing.l,
		backgroundColor: theme.colors.surface,
		borderRadius: theme.radii.l,
		marginBottom: theme.spacing.l
	},
	statCard: {
		alignItems: 'center'
	},
	statValue: {
		color: theme.colors.primary,
		fontSize: theme.typography.size.xxl,
		fontWeight: '700',
		marginBottom: theme.spacing.xs
	},
	statLabel: {
		color: theme.colors.textSecondary,
		fontSize: theme.typography.size.s
	},
	actionsSection: {
		paddingHorizontal: theme.spacing.l,
		paddingBottom: theme.spacing.xl
	},
	actionButtonSpacing: {
		marginBottom: theme.spacing.s
	},
	modalContent: {
		flex: 1,
		paddingHorizontal: theme.spacing.l,
		paddingVertical: theme.spacing.l
	},
	formSection: {
		marginBottom: theme.spacing.xl
	},
	formLabel: {
		fontSize: theme.typography.size.m,
		fontWeight: '600',
		color: theme.colors.textPrimary,
		marginBottom: theme.spacing.xs,
		marginTop: theme.spacing.m
	},
	textInput: {
		borderWidth: 1,
		borderColor: theme.colors.border || '#ddd',
		borderRadius: theme.radii.m,
		paddingHorizontal: theme.spacing.m,
		paddingVertical: theme.spacing.m,
		fontSize: theme.typography.size.m,
		color: theme.colors.textPrimary,
		backgroundColor: theme.colors.surface
	},
	textAreaInput: {
		textAlignVertical: 'top',
		paddingTop: theme.spacing.m
	},
	formButtons: {
		marginTop: theme.spacing.xl,
		marginBottom: theme.spacing.xl
	},
	formButton: {
		marginBottom: theme.spacing.s
	}
});
