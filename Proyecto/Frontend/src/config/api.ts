import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Resolve API base URL in a way that works across dev environments:
 * - If running in Expo Go, try to infer the LAN host from hostUri/debuggerHost.
 * - Android emulator defaults to http://10.0.2.2:3000
 * - iOS simulator/web defaults to http://localhost:3000
 * - If EXPO extra/API_URL is provided, it will take precedence.
 */
export function getApiBaseUrl(): string {
	// 1) Try to infer from Expo Go host (LAN IP)
	type GoCfg = { expoGoConfig?: { hostUri?: string; debuggerHost?: string }; manifest?: { debuggerHost?: string } };
	const go = Constants as unknown as GoCfg;
	const goHost: string | undefined = go?.expoGoConfig?.hostUri || go?.expoGoConfig?.debuggerHost || go?.manifest?.debuggerHost;

	if (goHost) {
		// goHost looks like "192.168.1.23:19000" or "192.168.1.23:8081"
		const host = goHost.split(':')[0];
		if (host) {
			return `http://${host}:3000`;
		}
	}

	// 2) Platform-specific defaults
	if (Platform.OS === 'android') {
		return 'http://10.0.2.2:3000';
	}
	if (Platform.OS === 'ios') {
		return 'http://localhost:3000';
	}
	if (Platform.OS === 'web') {
		return (window?.location?.origin as string) || 'http://localhost:3000';
	}

	// 3) Final fallback
	return 'http://localhost:3000';
}

export function apiUrl(path: string): string {
	const base = getApiBaseUrl();
	return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
}
