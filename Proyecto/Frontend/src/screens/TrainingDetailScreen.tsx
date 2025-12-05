import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../config/designSystem';
import { commonStyles } from '../config/commonStyles';
import { apiUrl } from '../config/api';

export default function TrainingDetailScreen() {
	const route = useRoute();
	const { training } = (route.params as any) || {};

	const navigation = useNavigation();
	const [deleting, setDeleting] = useState(false);

	if (!training) {
		return (
			<SafeAreaView style={commonStyles.container}>
				<View style={styles.empty}><Text style={styles.emptyText}>Training not found.</Text></View>
			</SafeAreaView>
		);
	}

	const imageUri = (() => {
		const img = training.image;
		if (!img) {
			return apiUrl('/images/nouserimage.png');
		}
		if (typeof img === 'string' && img.startsWith('data:')) {
			return img;
		}
		if (typeof img === 'string' && img.startsWith('/images/')) {
			return apiUrl(img);
		}
		return img;
	})();

	const stats: Array<{ key: string; label: string; value: string }> = [
		{ key: 'name', label: 'Name', value: String(training.name ?? '') },
		{ key: 'datetime', label: 'Date', value: training.datetime ? new Date(training.datetime).toLocaleString() : '' },
		{ key: 'duration', label: 'Duration', value: String(training.duration ?? '') },
		{ key: 'distance', label: 'Distance', value: training.distance !== undefined ? `${Number(training.distance).toFixed(2)} km` : (training.route?.distance !== undefined ? `${Number(training.route.distance).toFixed(2)} km` : '') },
		{ key: 'avgSpeed', label: 'Avg Speed', value: training.avgSpeed !== undefined ? `${Number(training.avgSpeed).toFixed(2)} km/h` : '' },
		{ key: 'maxSpeed', label: 'Max Speed', value: training.maxSpeed !== undefined ? `${Number(training.maxSpeed).toFixed(2)} km/h` : '' },
		{ key: 'pace', label: 'Pace', value: training.rithm !== undefined ? String(training.rithm) : '' },
		{ key: 'calories', label: 'Calories', value: training.calories !== undefined ? String(Math.round(Number(training.calories))) + ' (kcal)' : '' },
		{ key: 'elevationGain', label: 'Elevation Gain', value: training.elevationGain !== undefined ? `${Number(training.elevationGain).toFixed(2)} m` : '' },
		{ key: 'trainingType', label: 'Type', value: String(training.trainingType ?? '') }
	];

	return (
		<SafeAreaView style={commonStyles.container}>
			<ScrollView>
				<View style={commonStyles.header}>
					<Text style={commonStyles.headerText}>{training.name || `Training #${training.counter}`}</Text>
				</View>

				<View style={styles.imageWrap}>
					<Image source={{ uri: imageUri }} style={styles.image} />
				</View>

				<View style={styles.gridWrap}>
					{stats.map(s => (
						<View key={s.key} style={styles.statCard}>
							<Text style={styles.statLabel}>{s.label}</Text>
							<Text style={styles.statValue}>{s.value || '-'}</Text>
						</View>
					))}
				</View>

				<View style={styles.actionsWrap}>
					{deleting ? (
						<ActivityIndicator size="small" color={theme.colors.primary} />
					) : (
						<TouchableOpacity
							style={styles.deleteButton}
							onPress={() => {
								Alert.alert('Delete training', 'Are you sure you want to delete this training? This action cannot be undone.', [
									{ text: 'Cancel', style: 'cancel' },
									{
										text: 'Delete',
										style: 'destructive',
										onPress: async () => {
											try {
												setDeleting(true);
												if (!training || !training.counter) {
													setDeleting(false);
													Alert.alert('Error', 'Training identifier missing');
													return;
												}
												const url = apiUrl(`/api/trainings/${training.counter}`);
												const resp = await fetch(url, { method: 'DELETE' });
												if (resp.ok) {
													setDeleting(false);
													Alert.alert('Deleted', 'Training deleted successfully');
													navigation.goBack();
												} else {
													const txt = await resp.text();
													setDeleting(false);
													Alert.alert('Error', txt || 'Failed to delete training');
												}
											} catch (err) {
												setDeleting(false);
												Alert.alert('Error', String(err));
											}
										}
									}
								]);
							}}
						>
							<Text style={styles.deleteButtonText}>Delete training</Text>
						</TouchableOpacity>
					)}
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	imageWrap: { margin: theme.spacing.l, borderRadius: theme.radii.m, overflow: 'hidden', backgroundColor: theme.colors.surface },
	image: { width: '100%', height: 220 },
	stats: { marginHorizontal: theme.spacing.l, backgroundColor: theme.colors.surface, padding: theme.spacing.l, borderRadius: theme.radii.m },
	label: { color: theme.colors.textSecondary, fontSize: 13, marginTop: theme.spacing.s },
	value: { color: theme.colors.textPrimary, fontSize: 18, fontWeight: '700' },
	empty: { padding: theme.spacing.l, alignItems: 'center' },
	emptyText: { color: theme.colors.textSecondary },
	gridWrap: { flexDirection: 'row', flexWrap: 'wrap', margin: theme.spacing.l, gap: theme.spacing.s },
	statCard: { width: '48%', backgroundColor: theme.colors.background, padding: theme.spacing.m, borderRadius: theme.radii.m, marginBottom: theme.spacing.s },
	statLabel: { color: theme.colors.textSecondary, fontSize: 12 },
	statValue: { color: theme.colors.textPrimary, fontSize: 16, fontWeight: '700', marginTop: 6 },
	actionsWrap: { margin: theme.spacing.l, alignItems: 'center' },
	deleteButton: { backgroundColor: '#D9534F', paddingHorizontal: theme.spacing.l, paddingVertical: theme.spacing.s, borderRadius: theme.radii.m },
	deleteButtonText: { color: '#fff', fontWeight: '700' }
});
