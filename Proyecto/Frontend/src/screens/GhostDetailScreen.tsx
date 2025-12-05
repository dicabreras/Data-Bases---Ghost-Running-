import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import MapView, { Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { theme } from '../config/designSystem';
import { commonStyles } from '../config/commonStyles';

export default function GhostDetailScreen() {
	const route = useRoute();
	const nav = useNavigation();

	const params = (route.params as { training?: any }) || {};
	const t = params.training;


	if (!t) {
		return (
			<SafeAreaView style={commonStyles.container}>
				<Text style={{ padding: theme.spacing.l, color: theme.colors.textPrimary }}>No ghost selected</Text>
			</SafeAreaView>
		);
	}

	const handleRunAgainst = () => {
		// Navigate to Training screen with "runAgainstGhost" params
		const typedNav = nav as { navigate: (name: string, params?: any) => void };
		typedNav.navigate('Training', { runAgainstGhost: true, ghostTraining: t });
	};

	return (
		<SafeAreaView style={commonStyles.container} edges={['top', 'bottom']}>
			<ScrollView>
				<View style={commonStyles.header}>
					<Text style={commonStyles.headerText}>👻 Ghost #{t.counter ?? ''}</Text>
				</View>

				<View style={styles.mapContainer}>
					<MapView
						style={styles.map}
						provider={PROVIDER_GOOGLE}
						initialRegion={{
							latitude: Number(t.route?.[0]?.latitude) || 37.78825,
							longitude: Number(t.route?.[0]?.longitude) || -122.4324,
							latitudeDelta: 0.05,
							longitudeDelta: 0.05
						}}
					>
						{t.route?.length > 1 && <Polyline coordinates={t.route.map((p: any) => ({ latitude: Number(p.latitude), longitude: Number(p.longitude) }))} strokeColor={theme.colors.primary} strokeWidth={3} />}
					</MapView>
				</View>

				<View style={styles.statsSection}>
					<Text style={styles.sectionTitle}>Summary</Text>
					<View style={styles.row}>
						<View style={styles.statCard}>
							<Text style={styles.statValue}>{t.distance?.toFixed?.(2) ?? '-'}</Text>
							<Text style={styles.statLabel}>Kilometers</Text>
						</View>
						<View style={styles.statCard}>
							<Text style={styles.statValue}>{t.duration ?? '-'}</Text>
							<Text style={styles.statLabel}>Time</Text>
						</View>
					</View>

					<View style={styles.grid}>
						<View style={styles.smallCard}>
							<Text style={styles.smallLabel}>Avg Speed</Text>
							<Text style={styles.smallValue}>{t.avgSpeed?.toFixed?.(1) ?? '-'} km/h</Text>
						</View>
						<View style={styles.smallCard}>
							<Text style={styles.smallLabel}>Max Speed</Text>
							<Text style={styles.smallValue}>{t.maxSpeed?.toFixed?.(1) ?? '-'} km/h</Text>
						</View>
						<View style={styles.smallCard}>
							<Text style={styles.smallLabel}>Calories</Text>
							<Text style={styles.smallValue}>{Math.round(t.calories ?? 0)} kcal</Text>
						</View>
						<View style={styles.smallCard}>
							<Text style={styles.smallLabel}>Elevation</Text>
							<Text style={styles.smallValue}>{Math.round(t.elevationGain ?? 0)} m</Text>
						</View>
					</View>
				</View>
			</ScrollView>

			{/* Floating action button - bottom right */}
			<View style={styles.fab}>
				<TouchableOpacity onPress={handleRunAgainst}>
					<View style={styles.fabButton}>
						<Text style={styles.fabText}>🏁 Run against</Text>
					</View>
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	mapContainer: { height: 260, margin: theme.spacing.l, borderRadius: theme.radii.l, overflow: 'hidden', backgroundColor: theme.colors.surface },
	map: { width: '100%', height: '100%' },
	statsSection: { marginHorizontal: theme.spacing.l, marginBottom: 100, backgroundColor: theme.colors.surface, borderRadius: theme.radii.l, padding: theme.spacing.l },
	sectionTitle: { fontWeight: '700', fontSize: theme.typography.size.l, color: theme.colors.textPrimary, marginBottom: theme.spacing.m },
	row: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: theme.spacing.l },
	statCard: { alignItems: 'center', flex: 1 },
	statValue: { fontSize: 32, color: theme.colors.primary, fontWeight: '700', marginBottom: theme.spacing.xs },
	statLabel: { color: theme.colors.textSecondary, fontSize: theme.typography.size.m },
	grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: theme.spacing.m },
	smallCard: { width: '48%', backgroundColor: theme.colors.background, borderRadius: theme.radii.m, padding: theme.spacing.m, alignItems: 'center' },
	smallLabel: { color: theme.colors.textSecondary, fontSize: theme.typography.size.s, marginBottom: 4 },
	smallValue: { color: theme.colors.textPrimary, fontSize: theme.typography.size.l, fontWeight: '700' },
	fab: { position: 'absolute', right: theme.spacing.l, bottom: theme.spacing.l },
	fabButton: { backgroundColor: theme.colors.primary, paddingHorizontal: 20, paddingVertical: 14, borderRadius: 30, elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 5 },
	fabText: { color: '#ffffff', fontWeight: '700', fontSize: theme.typography.size.m }
});
