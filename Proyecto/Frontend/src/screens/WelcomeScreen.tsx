import React, { useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LoginScreen from './LoginScreen';
import SignupScreen from './SignupScreen';
import logo from '../../assets/logo.png';
import { theme } from '../config/designSystem';
import { commonStyles } from '../config/commonStyles';
import GRButton from '../components/GRButton';

type Screen = 'welcome' | 'login' | 'signup';

const welcomeScreen = () => {
	const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');

	if (currentScreen === 'login') {
		return <LoginScreen onBack={() => setCurrentScreen('welcome')} />;
	}

	if (currentScreen === 'signup') {
		return <SignupScreen onBack={() => setCurrentScreen('welcome')} />;
	}

	return (
		<SafeAreaView style={commonStyles.container}>
			<View style={styles.content}>
				<View style={styles.logoWrapper}>
					<Image source={logo} style={styles.logo} resizeMode="cover" />
				</View>
				<Text style={styles.appName}>Ghost Running</Text>
				<View style={styles.spacer} />
				<View style={styles.buttonContainer}>
					<GRButton label="Log In" variant="primary" onPress={() => setCurrentScreen('login')} style={styles.fullWidthButton} />
					<GRButton label="Sign Up" variant="outline" onPress={() => setCurrentScreen('signup')} style={styles.fullWidthButton} />
				</View>
			</View>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: theme.spacing.xl + 10 },
	logoWrapper: { width: 180, height: 180, borderRadius: 90, borderWidth: 5, borderColor: theme.colors.primary, overflow: 'hidden', marginBottom: theme.spacing.l, justifyContent: 'center', alignItems: 'center' },
	logo: { width: '100%', height: '100%' },
	appName: { fontSize: 32, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: theme.spacing.l, letterSpacing: 1, textAlign: 'center' },
	spacer: { flex: 0.2 },
	buttonContainer: { width: '100%', gap: theme.spacing.m },
	fullWidthButton: { width: '100%' }
});

export default welcomeScreen;
