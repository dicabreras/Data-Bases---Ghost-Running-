import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, GestureResponderEvent, ViewStyle } from 'react-native';
import { theme } from '../config/designSystem';

type Variant = 'primary' | 'secondary' | 'outline';

interface GrButtonProps {
  label: string;
  onPress?: (e: GestureResponderEvent) => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  // simple emoji for now
  leftIcon?: string;
}

export const grButton: React.FC<GrButtonProps> = ({
	label,
	onPress,
	variant = 'primary',
	disabled = false,
	loading = false,
	style,
	leftIcon
}) => {
	return (
		<TouchableOpacity
			onPress={onPress}
			disabled={disabled || loading}
			style={[styles.base, styles[variant], disabled && styles.disabled, style]}
			activeOpacity={0.85}
		>
			{loading ? (
				<ActivityIndicator color={variant === 'outline' ? theme.colors.primary : theme.colors.textPrimary} />
			) : (
				<Text style={[styles.label, variant === 'outline' && styles.labelOutline]}> {leftIcon ? leftIcon + ' ' : ''}{label}</Text>
			)}
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	base: {
		borderRadius: theme.radii.m,
		paddingVertical: theme.spacing.m + 3,
		paddingHorizontal: theme.spacing.l,
		alignItems: 'center',
		justifyContent: 'center'
	},
	label: {
		color: theme.colors.textPrimary,
		fontSize: theme.typography.size.l,
		fontWeight: '700'
	},
	labelOutline: {
		color: theme.colors.primary
	},
	primary: {
		backgroundColor: theme.colors.primary
	},
	secondary: {
		backgroundColor: theme.colors.surface,
		borderWidth: 2,
		borderColor: theme.colors.primary
	},
	outline: {
		backgroundColor: 'transparent',
		borderWidth: 2,
		borderColor: theme.colors.primary
	},
	disabled: {
		opacity: 0.5
	}
});

export default grButton;
