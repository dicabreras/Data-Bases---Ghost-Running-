import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../config/designSystem';
import { commonStyles } from '../config/commonStyles';
import { useAuth } from '../context/AuthContext';
import { apiUrl } from '../config/api';
import { useNavigation } from '@react-navigation/native';

type TrainingItem = {
  counter: number;
  distance: number;
  duration: string;
  avgSpeed: number;
  maxSpeed: number;
  rithm: number;
  calories: number;
  elevationGain: number;
  datetime: string;
  trainingType: string;
  isGhost?: number;
  route?: Array<{ latitude: number; longitude: number; altitude?: number }>;
};

export default function GhostsScreen() {
	const { user } = useAuth();
	const nav = useNavigation();
	const [activeTab, setActiveTab] = useState<'my' | 'other'>('my');
	const [myGhosts, setMyGhosts] = useState<TrainingItem[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (activeTab === 'my') {
			loadMyGhosts();
		}
	}, [activeTab]);

	const loadMyGhosts = async () => {
		if (!user?.email) {return;}
		setError(null);
		setLoading(true);
		try {
			const resp = await fetch(apiUrl(`/api/trainings/${encodeURIComponent(user.email)}`));
			if (!resp.ok) {throw new Error('Failed fetching trainings');}
			const json = await resp.json();
			const trainings: TrainingItem[] = json?.trainings || [];
			// filter only ghosts (isGhost === 1)
			const ghosts = trainings.filter(t => Number(t.isGhost) === 1);
			setMyGhosts(ghosts);
		} catch (err) {
			console.error('Failed loading ghosts', err);
			setError('Could not load ghosts');
		} finally {
			setLoading(false);
		}
	};

	const renderGhost = ({ item }: { item: TrainingItem }) => {
		const date = new Date(item.datetime);
		return (
			<TouchableOpacity style={styles.ghostCard} onPress={() => {
				const typedNav = nav as { navigate: (name: string, params?: any) => void };
				typedNav.navigate('GhostDetail', { training: item });
			}}>
				<View style={{ flex: 1 }}>
					<Text style={styles.ghostTitle}>👻 Ghost #{item.counter ?? '—'}</Text>
					<Text style={styles.ghostSubtitle}>{date.toLocaleString()}</Text>
				</View>
				<View style={{ alignItems: 'flex-end' }}>
					<Text style={styles.ghostStat}>{item.distance?.toFixed?.(2) ?? '-'} km</Text>
					<Text style={styles.ghostSmall}>⏱ {item.duration}</Text>
				</View>
			</TouchableOpacity>
		);
	};

	return (
		<SafeAreaView style={commonStyles.container} edges={['top', 'bottom']}>
			<View style={styles.header}
			>
				<Text style={styles.title}>Ghosts</Text>
			</View>

			{/* Top segmented tabs */}
			<View style={styles.tabsContainer}>
				<TouchableOpacity
					style={[styles.tabButton, activeTab === 'my' && styles.tabActive]}
					onPress={() => setActiveTab('my')}
				>
					<Text style={[styles.tabText, activeTab === 'my' && styles.tabTextActive]}>My Ghosts</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={[styles.tabButton, activeTab === 'other' && styles.tabActive]}
					onPress={() => setActiveTab('other')}
				>
					<Text style={[styles.tabText, activeTab === 'other' && styles.tabTextActive]}>Other runners</Text>
				</TouchableOpacity>
			</View>

			{/* Placeholder content for each tab */}
			<View style={styles.listContainer}>
				{activeTab === 'my' ? (
					loading ? <ActivityIndicator size="large" color={theme.colors.primary} /> :
						error ? <Text style={styles.placeholderText}>{error}</Text> :
							myGhosts.length === 0 ? <Text style={styles.placeholderText}>You don't have any saved ghosts yet.</Text> :
								<FlatList
									data={myGhosts}
									keyExtractor={(i) => String(i.counter ?? Math.random())}
									renderItem={renderGhost}
									ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
									contentContainerStyle={{ padding: theme.spacing.l }}
								/>
				) : (
					<Text style={styles.placeholderText}>Ghosts from other runners will appear here.</Text>
				)}
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	header: { padding: theme.spacing.l, backgroundColor: theme.colors.surface, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
	title: { fontSize: theme.typography.size.xl, color: theme.colors.textPrimary, fontWeight: '700' },
	tabsContainer: { flexDirection: 'row', padding: theme.spacing.m, gap: theme.spacing.m, backgroundColor: theme.colors.background },
	tabButton: { flex: 1, padding: theme.spacing.m, borderRadius: theme.radii.m, alignItems: 'center', backgroundColor: 'transparent' },
	tabActive: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border },
	tabText: { color: theme.colors.textSecondary },
	tabTextActive: { color: theme.colors.textPrimary, fontWeight: '700' },
	listContainer: { flex: 1 },
	placeholderText: { color: theme.colors.textSecondary, textAlign: 'center', marginTop: 40 },
	ghostCard: {
		backgroundColor: theme.colors.surface,
		padding: theme.spacing.l,
		borderRadius: theme.radii.m,
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 1,
		borderColor: theme.colors.border
	},
	ghostTitle: {
		fontSize: theme.typography.size.l,
		color: theme.colors.textPrimary,
		fontWeight: '700',
		marginBottom: 4
	},
	ghostSubtitle: {
		fontSize: theme.typography.size.s,
		color: theme.colors.textSecondary
	},
	ghostStat: {
		fontSize: theme.typography.size.xl,
		color: theme.colors.primary,
		fontWeight: '700'
	},
	ghostSmall: {
		fontSize: theme.typography.size.s,
		color: theme.colors.textSecondary,
		marginTop: 4
	}
});
