import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { apiUrl } from '../config/api';
import { theme } from '../config/designSystem';
import { commonStyles } from '../config/commonStyles';

type TrainingItem = {
    counter: number;
    distance: number;
    name: string | null;
    duration: string;
    avgSpeed: number;
    maxSpeed: number;
    rithm: number;
    calories: number;
    elevationGain: number;
    trainingType: string;
    datetime: string;
    isGhost: number;
    route: Array<{ latitude: number; longitude: number; altitude?: number }> | null;
    image?: string | null;
};

function resolveImageUri(image?: string | null) {
	if (!image) {
		return null;
	}
	if (image.startsWith('data:')) {
		return image;
	}
	if (image.startsWith('/images/')) {
		return apiUrl(image);
	}
	return image;
}

export default function HistoryScreen() {
	const { user } = useAuth();
	const navigation = useNavigation();
	const [loading, setLoading] = useState(false);
	const [trainings, setTrainings] = useState<TrainingItem[]>([]);
	// Pagination and sorting
	const [page, setPage] = useState(1);
	const pageSize = 10;
	const [sortMode, setSortMode] = useState<'date' | 'name'>('date');
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
	const [filterType, setFilterType] = useState<'all' | 'Running' | 'Cycling'>('all');
	const [showSortMenu, setShowSortMenu] = useState(false);
	const [showFilterMenu, setShowFilterMenu] = useState(false);


	const loadTrainings = useCallback(async () => {
		if (!user?.email) {
			return;
		}
		setLoading(true);
		try {
			const resp = await fetch(apiUrl(`/api/trainings/${encodeURIComponent(user.email)}`));
			if (resp.ok) {
				const data = await resp.json();
				setTrainings(data.trainings || []);
			} else {
				const txt = await resp.text();
				console.warn('Failed loading trainings:', txt);
			}
		} catch (err) {
			console.warn('Error loading trainings:', err);
		} finally {
			setLoading(false);
		}
	}, [user?.email]);

	useEffect(() => {
		loadTrainings();
	}, [loadTrainings]);

	useFocusEffect(
		useCallback(() => {
			// Refresh trainings when screen gains focus (e.g., after deleting)
			loadTrainings();
		}, [loadTrainings])
	);

	// Reset pagination when trainings, sort or filter changes
	useEffect(() => {
		setPage(1);
	}, [trainings.length, sortMode, sortOrder, filterType]);

	const sortedTrainings = useMemo(() => {
		// Apply optional filter first
		let arr = [...trainings];
		if (filterType !== 'all') {
			arr = arr.filter(t => String(t.trainingType) === filterType);
		}
		if (sortMode === 'date') {
			arr.sort((a, b) => {
				const ta = new Date(a.datetime).getTime();
				const tb = new Date(b.datetime).getTime();
				return sortOrder === 'asc' ? ta - tb : tb - ta;
			});
		} else {
			arr.sort((a, b) => {
				const na = (a.name || `Training #${a.counter}`).toLowerCase();
				const nb = (b.name || `Training #${b.counter}`).toLowerCase();
				if (na < nb) {
					return sortOrder === 'asc' ? -1 : 1;
				}
				if (na > nb) {
					return sortOrder === 'asc' ? 1 : -1;
				}
				return 0;
			});
		}
		return arr;
	}, [trainings, sortMode, sortOrder, filterType]);

	const pagedTrainings = useMemo(() => {
		const end = page * pageSize;
		return sortedTrainings.slice(0, end);
	}, [sortedTrainings, page]);

	const hasMore = pagedTrainings.length < sortedTrainings.length;
	const [loadingMore, setLoadingMore] = useState(false);


	if (!user?.email) {
		return (
			<SafeAreaView style={commonStyles.container}>
				<View style={styles.empty}>
					<Text style={styles.emptyText}>Please sign in to see your training history.</Text>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={commonStyles.container}>
			<View style={commonStyles.header}>
				<Text style={commonStyles.headerText}>History</Text>
			</View>

			{loading ? (
				<View style={styles.loading}><ActivityIndicator size="large" color={theme.colors.primary} /></View>
			) : (
				<>
					<View style={styles.controls}>
						<TouchableOpacity style={styles.ctrlButton} onPress={() => setShowSortMenu(true)}>
							<Text style={styles.ctrlText}>Sort: {sortMode === 'date' ? 'Date' : 'Name'} {sortOrder === 'asc' ? '↑' : '↓'}</Text>
						</TouchableOpacity>

						<TouchableOpacity style={styles.ctrlButton} onPress={() => setShowFilterMenu(true)}>
							<Text style={styles.ctrlText}>Filter: {filterType}</Text>
						</TouchableOpacity>
					</View>

					{/* Sort Modal */}
					<Modal visible={showSortMenu} transparent animationType="fade" onRequestClose={() => setShowSortMenu(false)}>
						<View style={styles.modalOverlay}>
							<Pressable style={StyleSheet.absoluteFill} onPress={() => setShowSortMenu(false)} />
							<View style={styles.modalBox}>
								<Text style={styles.modalTitle}>Sort by</Text>
								<TouchableOpacity style={styles.modalItem} onPress={() => { setSortMode('date'); setSortOrder('desc'); setShowSortMenu(false); }}>
									<Text style={styles.modalItemText}>Date ↓</Text>
								</TouchableOpacity>
								<TouchableOpacity style={styles.modalItem} onPress={() => { setSortMode('date'); setSortOrder('asc'); setShowSortMenu(false); }}>
									<Text style={styles.modalItemText}>Date ↑</Text>
								</TouchableOpacity>
								<TouchableOpacity style={styles.modalItem} onPress={() => { setSortMode('name'); setSortOrder('asc'); setShowSortMenu(false); }}>
									<Text style={styles.modalItemText}>Name A→Z</Text>
								</TouchableOpacity>
								<TouchableOpacity style={styles.modalItem} onPress={() => { setSortMode('name'); setSortOrder('desc'); setShowSortMenu(false); }}>
									<Text style={styles.modalItemText}>Name Z→A</Text>
								</TouchableOpacity>
							</View>
						</View>
					</Modal>

					{/* Filter Modal */}
					<Modal visible={showFilterMenu} transparent animationType="fade" onRequestClose={() => setShowFilterMenu(false)}>
						<View style={styles.modalOverlay}>
							<Pressable style={StyleSheet.absoluteFill} onPress={() => setShowFilterMenu(false)} />
							<View style={styles.modalBox}>
								<Text style={styles.modalTitle}>Filter type</Text>
								<TouchableOpacity style={styles.modalItem} onPress={() => { setFilterType('all'); setShowFilterMenu(false); }}>
									<Text style={styles.modalItemText}>All</Text>
								</TouchableOpacity>
								<TouchableOpacity style={styles.modalItem} onPress={() => { setFilterType('Running'); setShowFilterMenu(false); }}>
									<Text style={styles.modalItemText}>Running</Text>
								</TouchableOpacity>
								<TouchableOpacity style={styles.modalItem} onPress={() => { setFilterType('Cycling'); setShowFilterMenu(false); }}>
									<Text style={styles.modalItemText}>Cycling</Text>
								</TouchableOpacity>
							</View>
						</View>
					</Modal>

					<FlatList
						data={pagedTrainings}
						keyExtractor={(item) => item.counter.toString()}
						contentContainerStyle={{ padding: theme.spacing.l }}
						renderItem={({ item }) => (
							<TouchableOpacity style={styles.card} onPress={() => (navigation as any).navigate('TrainingDetail', { training: item })}>
								<Image source={{ uri: resolveImageUri(item.image) || apiUrl('/images/nouserimage.png') }} style={styles.thumb} />
								<View style={styles.cardContent}>
									<Text style={styles.title}>{item.name || `Training #${item.counter}`}</Text>
									<Text style={styles.subtitle}>{`${item.distance?.toFixed(2) || 0} km • ${item.duration}`}</Text>
								</View>
							</TouchableOpacity>
						)}
						ListEmptyComponent={() => (
							<View style={styles.empty}><Text style={styles.emptyText}>No trainings yet.</Text></View>
						)}
						onEndReachedThreshold={0.6}
						onEndReached={() => {
							if (hasMore && !loadingMore) {
								setLoadingMore(true);
								setPage(p => p + 1);
								setTimeout(() => setLoadingMore(false), 300);
							}
						}}
						ListFooterComponent={() => hasMore ? <View style={{ padding: 8 }}><ActivityIndicator size="small" color={theme.colors.primary} /></View> : null}
					/>
				</>
			)}
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
	card: { flexDirection: 'row', backgroundColor: theme.colors.surface, borderRadius: theme.radii.m, overflow: 'hidden', marginBottom: theme.spacing.m },
	thumb: { width: 110, height: 80, backgroundColor: '#eee' },
	cardContent: { padding: theme.spacing.s, flex: 1, justifyContent: 'center' },
	title: { fontSize: 16, fontWeight: '700', color: theme.colors.textPrimary },
	subtitle: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 4 },
	empty: { padding: theme.spacing.l, alignItems: 'center' },
	emptyText: { color: theme.colors.textSecondary },
	controls: { flexDirection: 'row', paddingHorizontal: theme.spacing.l, paddingBottom: theme.spacing.s, justifyContent: 'flex-start', gap: theme.spacing.s },
	ctrlButton: { paddingHorizontal: theme.spacing.m, paddingVertical: theme.spacing.s, backgroundColor: 'transparent', borderRadius: theme.radii.m, borderWidth: 1, borderColor: theme.colors.border },
	ctrlButtonActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
	ctrlText: { color: theme.colors.textPrimary, fontWeight: '700' },
	modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
	modalBox: { width: '80%', backgroundColor: theme.colors.surface, borderRadius: theme.radii.m, padding: theme.spacing.l, elevation: 10 },
	modalTitle: { fontWeight: '700', marginBottom: theme.spacing.s, color: theme.colors.textPrimary },
	modalItemText: { color: theme.colors.textPrimary },
	modalItem: { paddingVertical: theme.spacing.s }
});
