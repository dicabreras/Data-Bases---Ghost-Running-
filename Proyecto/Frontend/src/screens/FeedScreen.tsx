import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { commonStyles } from '../config/commonStyles';
import { theme } from '../config/designSystem';

export default function FeedScreen() {
	return (
		<SafeAreaView style={commonStyles.container} edges={['top', 'bottom']}>
			<View style={commonStyles.header}>
				<Text style={commonStyles.headerText}>Feed</Text>
			</View>

			<ScrollView style={styles.content}>
				<View style={styles.placeholderContainer}>
					<Text style={styles.placeholderIcon}>📱</Text>
					<Text style={styles.placeholderTitle}>Feed coming soon!</Text>
					<Text style={styles.placeholderSubtext}>Here you'll see posts from other runners</Text>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	content: {
		flex: 1
	},
	placeholderContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: theme.spacing.xl * 2,
		marginTop: theme.spacing.xl * 2.5
	},
	placeholderIcon: {
		fontSize: 60,
		marginBottom: theme.spacing.l
	},
	placeholderTitle: {
		color: theme.colors.textPrimary,
		fontSize: theme.typography.size.xl,
		fontWeight: '700',
		marginBottom: theme.spacing.s,
		textAlign: 'center'
	},
	placeholderSubtext: {
		color: theme.colors.textSecondary,
		fontSize: theme.typography.size.m,
		textAlign: 'center'
	}
});
