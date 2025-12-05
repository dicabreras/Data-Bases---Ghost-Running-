import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function GhostMarker() {
	return (
		<View style={styles.container}>
			<Text style={styles.ghost}>👻</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		width: 40,
		height: 40,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'rgba(255, 255, 255, 0.9)',
		borderRadius: 20,
		borderWidth: 2,
		borderColor: '#FFFFFF',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 4,
		elevation: 5
	},
	ghost: {
		fontSize: 24
	}
});
