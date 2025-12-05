import React from 'react';
import MainNavigator from './src/navigation/MainNavigator';
import WelcomeScreen from './src/screens/WelcomeScreen';
import { AuthProvider, useAuth } from './src/context/AuthContext';

function AppContent() {
	const { isAuthenticated } = useAuth();

	if (isAuthenticated) {
		return <MainNavigator />;
	}

	return <WelcomeScreen />;
}

export default function App() {
	return (
		<AuthProvider>
			<AppContent />
		</AuthProvider>
	);
}
