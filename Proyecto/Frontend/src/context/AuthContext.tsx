import React, {
	createContext,
	useState,
	useContext,
	ReactNode,
	useEffect,
	useRef
} from "react";
import { Linking, Platform } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Crypto from "expo-crypto";
import Constants from 'expo-constants';
import { apiUrl } from "../config/api";

WebBrowser.maybeCompleteAuthSession();

interface UserData {
  email: string;
  username: string;
  names: string;
  lastNames: string;
  profilePhoto?: string;
  description?: string;
  gender?: string;
}

interface AuthContextType {
  user: UserData | null;
  setUser: (user: UserData | null) => void;
  isAuthenticated: boolean;
  signInWithGoogle: () => Promise<void>;
  processAuthRedirect: (url: string) => Promise<void>;
  logout: () => void;
}


const authContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<UserData | null>(null);
	const codeVerifierRef = useRef<string | null>(null);

	const generateCodeVerifier = (length = 128) => {
		const validCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
		let codeVerifier = "";
		for (let i = 0; i < length; i++) {
			codeVerifier += validCharacters.charAt(Math.floor(Math.random() * validCharacters.length));
		}
		return codeVerifier;
	};

	const sha256base64url = async (plain: string) => {
		const b64 = await Crypto.digestStringAsync(
			Crypto.CryptoDigestAlgorithm.SHA256,
			plain,
			{ encoding: Crypto.CryptoEncoding.BASE64 }
		);
		return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
	};

	// Before you yell at us, since all IDs and redirects are public info I opted to save them as part of the app's configs
	const typedConstants = Constants as unknown as {
		expoConfig?: { extra?: Record<string, unknown> };
		manifest?: { extra?: Record<string, unknown> };
	};
	const extras: Record<string, unknown> = typedConstants.expoConfig?.extra ?? typedConstants.manifest?.extra ?? {};
	const getStringValue = (key: string) => (typeof extras[key] === "string" ? (extras[key] as string) : undefined);
	const expoClientId = getStringValue("GOOGLE_EXPO_CLIENT_ID");
	const androidClientId = getStringValue("GOOGLE_ANDROID_CLIENT_ID");
	const iosClientId = getStringValue("GOOGLE_IOS_CLIENT_ID");

	const getNativeClientId = () => {
		if (Platform.OS === "ios") {
			return {
				id: iosClientId || expoClientId,
				os: "ios"
			};
		}

		if (Platform.OS === "android") {
			return {
				id: androidClientId || expoClientId,
				os: "android"
			};
		}

		return {
			id: expoClientId,
			os: "web"
		};
	};

	const buildNativeRedirectUri = (clientId: string | undefined | null, os: string) => {
		if (!clientId) {
			return null;
		};
		// Google native redirect URIs use the scheme: com.googleusercontent.apps.<CLIENT_ID_PREFIX>:/oauthredirect
		// Client IDs usually end with ".apps.googleusercontent.com"; strip that if present.
		let prefix = clientId;
		if (prefix.endsWith('.apps.googleusercontent.com')) {
			prefix = prefix.replace(/\.apps\.googleusercontent\.com$/, '');
		}
		// For Android/iOS native apps use the same scheme
		if (os === 'android' || os === 'ios') {
			return `com.googleusercontent.apps.${prefix}:/oauthredirect`;
		}
		// Fallback: return null so caller can decide alternative redirect
		return null;
	};

	const processAuthRedirect = async (url: string) => {
		try {
			if (!url) {
				return;
			}

			const parsedUrl = new URL(url);
			const code = parsedUrl.searchParams.get("code");
			if (code) {
				const proxyRedirect = `${parsedUrl.protocol}//${parsedUrl.host}${parsedUrl.pathname}`;
				const response = await fetch(apiUrl("/api/auth/google/code"), {
					body: JSON.stringify({	code, redirectUri: proxyRedirect, codeVerifier: codeVerifierRef.current	}),
					headers: {	"Content-Type": "application/json"	},
					method: "POST"
				});
				const data = await response.json();

				if (data?.user) {
					setUser(data.user);
				}
				return;
			}

			let idToken: string | null = null;
			const queryParams = parsedUrl.searchParams.get("id_token") || parsedUrl.searchParams.get("idToken");
			if (queryParams) {
				idToken = queryParams;
			}

			// This is safe legacy, cause I was working with redirects through auth.expo but it used # instead of ? for their starter query params
			if (!idToken && parsedUrl.hash) {
				const hash = parsedUrl.hash.replace(/^#/, "");
				const hashParams = new URLSearchParams(hash);
				idToken = hashParams.get("id_token") || hashParams.get("idToken");
			}

			if (idToken) {
				const response = await fetch(apiUrl("/api/auth/google"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ idToken })
				});
				const data = await response.json();

				if (data?.user) {
					setUser(data.user);
				}
			}
		} catch (err) {
			console.error("Error processing auth redirect", err);
		}
	};

	useEffect(() => {
		const handleOpen = ({ url }: { url: string }) => processAuthRedirect(url);
		const sub = Linking.addEventListener("url", handleOpen);

		(async () => {
			const initial = await Linking.getInitialURL();
			if (initial) {
				processAuthRedirect(initial);
			}
		})();

		return () => {
			sub.remove();
		};
	}, []);


	const logout = () => {
		setUser(null);
	};


	const signInWithGoogle = async () => {
		console.log("signInWithGoogle invoked");

		const codeVerifier = generateCodeVerifier(64);
		codeVerifierRef.current = codeVerifier;
		const codeChallenge = await sha256base64url(codeVerifier);

		const { id: clientId, os } = getNativeClientId();
		if (!clientId) {
			console.error("No native Google Client ID configured.");
			return;
		}

		const redirectUri = buildNativeRedirectUri(clientId, os) || (() => {
			const fallback = clientId.endsWith('.apps.googleusercontent.com')
				? clientId.replace(/\.apps\.googleusercontent\.com$/, '')
				: clientId;
			return `com.googleusercontent.apps.${fallback}:/oauthredirect`;
		})();
		console.log("Using redirectUri:", redirectUri, "(platform:", os, ")");

		const scope = "openid profile email";

		const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}`
			+ `&redirect_uri=${encodeURIComponent(redirectUri)}`
			+ `&response_type=code&scope=${encodeURIComponent(scope)}`
			+ `&prompt=consent&access_type=offline`
			+ `&code_challenge=${encodeURIComponent(codeChallenge)}&code_challenge_method=S256`;

		console.log("Opening authUrl:\n", authUrl);

		let result: WebBrowser.WebBrowserAuthSessionResult | null = null;
		try {
			const authSessionResult = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
			result = authSessionResult;
		} catch (error) {
			console.warn("WebBrowser.openAuthSessionAsync failed", error);
		}

		console.log("Auth flow result:\n", result);

		let code: string | null = null;
		if (result?.type === "success" && result.url) {
			try {
				const parsed = new URL(result.url);
				code = parsed.searchParams.get("code");
			} catch (error) {
				console.warn("Failed parsing code from result.url\n", error);
			}
		}

		if (code) {
			const response = await fetch(apiUrl("/api/auth/google/code"), {
				body: JSON.stringify({	code, redirectUri, codeVerifier: codeVerifierRef.current	}),
				headers: {	"Content-Type": "application/json"	},
				method: "POST"
			});

			const data = await response.json();
			if (data?.user) {
				setUser(data.user);
			}
			WebBrowser.dismissBrowser?.();
			return;
		}

		console.log("No code returned synchronously; waiting for deep link (Linking listener) to fire.");
	};

	return (
		<authContext.Provider
			value={{
				user,
				setUser,
				isAuthenticated: !!user,
				signInWithGoogle,
				processAuthRedirect,
				logout
			}}
		>
			{children}
		</authContext.Provider>
	);
};

export const useAuth = () => {
	const context = useContext(authContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};
