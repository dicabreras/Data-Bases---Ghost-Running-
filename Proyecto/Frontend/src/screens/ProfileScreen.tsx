import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { commonStyles } from '../config/commonStyles';
import { theme } from '../config/designSystem';
import GRButton from '../components/GRButton';
import { useAuth } from '../context/AuthContext';
import { apiUrl } from '../config/api';
import logo from '../../assets/logo.png';

export default function ProfileScreen() {
	const { user, logout } = useAuth();

	const userName = user?.names || 'Runner';
	const userEmail = user?.email || 'runner@ghostrunning.com';

	const [trainingsCount, setTrainingsCount] = useState<number>(0);
	const [totalDistanceKm, setTotalDistanceKm] = useState<number>(0);
	const [totalSeconds, setTotalSeconds] = useState<number>(0);

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
			if (!resp.ok) {return;}
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
		} catch (err) {
			console.warn('Error loading profile stats', err);
		}
	}, [userEmail]);

	useFocusEffect(
		useCallback(() => {
			loadProfileStats();
		}, [loadProfileStats])
	);
	const userImage = user?.profilePhoto
		? apiUrl(`/images/${user.profilePhoto}`)
		: apiUrl('/images/nouserimage.png');
	return (
		<SafeAreaView style={commonStyles.container} edges={['top', 'bottom']}>
			<View style={commonStyles.header}>
				<Text style={commonStyles.headerText}>Profile</Text>
			</View>

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
					<GRButton label="✏️ Edit Profile" variant="secondary" style={styles.actionButtonSpacing} />
					<GRButton label="⚙️ Settings" variant="secondary" style={styles.actionButtonSpacing} />
					<GRButton label="🚪 Logout" variant="primary" onPress={logout} style={styles.actionButtonSpacing} />
				</View>
			</ScrollView>
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
	}
});
