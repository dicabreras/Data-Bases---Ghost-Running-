import { StyleSheet } from 'react-native';
import { theme } from './designSystem';

export const commonStyles = StyleSheet.create({
	container: { flex: 1, backgroundColor: theme.colors.background },
	header: { paddingHorizontal: theme.spacing.xl, paddingVertical: theme.spacing.l, backgroundColor: theme.colors.background, borderBottomColor: theme.colors.border, borderBottomWidth: 1 },
	headerText: { color: theme.colors.textPrimary, fontSize: theme.typography.size.xxl, fontWeight: '700' },
	sectionSurface: { backgroundColor: theme.colors.surface, borderRadius: theme.radii.l },
	center: { justifyContent: 'center', alignItems: 'center' },
	placeholderText: { color: theme.colors.textSecondary, fontSize: theme.typography.size.l, textAlign: 'center' },
	profileImageBorder: { borderColor: theme.colors.primary, borderWidth: 4 },

	// Common input styles
	input: {
		backgroundColor: theme.colors.surface,
		borderWidth: 1,
		borderColor: theme.colors.primary,
		borderRadius: theme.radii.m,
		paddingVertical: theme.spacing.l,
		paddingHorizontal: theme.spacing.l,
		marginBottom: theme.spacing.m,
		color: theme.colors.textPrimary,
		fontSize: theme.typography.size.l
	},

	// Title styles
	title: {
		fontSize: 32,
		fontWeight: '700',
		color: theme.colors.textPrimary,
		marginBottom: theme.spacing.xxl,
		textAlign: 'center'
	},

	// Form container
	form: { width: '100%' },

	// Profile image components
	profileImageContainer: {
		width: 120,
		height: 120,
		borderRadius: 60,
		borderWidth: 4,
		borderColor: theme.colors.primary,
		padding: 3
	},
	profileImage: {
		width: '100%',
		height: '100%',
		borderRadius: 56
	},
	profileImagePlaceholder: {
		width: '100%',
		height: '100%',
		borderRadius: 56,
		backgroundColor: theme.colors.primary,
		justifyContent: 'center',
		alignItems: 'center'
	},
	profileImagePlaceholderText: {
		color: theme.colors.textPrimary,
		fontSize: 48,
		fontWeight: '700'
	}
});
