import { Request, Response } from 'express';
import Database from '../db/Database';
import { User } from '../entity/User';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client();
const acceptedAudiences = [
	process.env.GOOGLE_CLIENT_ID,
	process.env.GOOGLE_WEB_CLIENT_ID,
	process.env.GOOGLE_ANDROID_CLIENT_ID,
	process.env.GOOGLE_IOS_CLIENT_ID
].filter(Boolean) as string[];
const userRepository = Database.getInstance().getRepository(User);

// POST /api/auth/google
export const verifyGoogleToken = async (req: Request, res: Response) => {
	try {
		const { idToken } = req.body ?? {};
		if (!idToken) {
			return res.status(400).json({ message: 'Missing idToken' });
		}

		const ticket = await client.verifyIdToken({ idToken, audience: acceptedAudiences });
		const payload = ticket.getPayload();
		if (!payload || !payload.email) {
			return res.status(400).json({ message: 'Invalid token payload' });
		}

		const email = payload.email;
		const givenName = payload.given_name || '';
		const familyName = payload.family_name || '';
		const picture = payload.picture;

		let user = await userRepository.findOne({ where: { email }});
		if (!user) {
			const newUser = userRepository.create({
				email,
				username: `${givenName} ${familyName}`.trim() || email,
				password: '',
				age: 0,
				names: givenName || undefined,
				lastNames: familyName || undefined,
				profilePhoto: picture || undefined
			});
			user = await userRepository.save(newUser);
		}

		const userData = {
			email: user.email,
			username: user.username,
			names: user.names,
			lastNames: user.lastNames,
			profilePhoto: user.profilePhoto,
			description: user.description,
			gender: user.gender
		};

		return res.status(200).json({ message: 'OK', user: userData });
	} catch (error) {
		console.error('Error verifying Google token:', error);
		return res.status(500).json({ message: 'Internal server error' });
	}
};

// POST /api/auth/google/code
export const exchangeCodeForToken = async (req: Request, res: Response) => {
	try {
		// We take them from either the body or the query params just to be safe
		const code = (req.body && (req.body.code as string)) || (req.query && (req.query.code as string));
		const codeVerifier = (req.body && (req.body.codeVerifier as string)) || (req.query && (req.query.codeVerifier as string));
		const redirectUri = (req.body && (req.body.redirectUri as string)) || (req.query && (req.query.redirectUri as string));

		if (!code) {
			return res.status(400).json({ message: 'Missing code' });
		}

		// Determine which client_id to use for the token
		let clientIdToUse = process.env.GOOGLE_WEB_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || '';
		if (redirectUri && redirectUri.startsWith('com.googleusercontent.apps.')) {
			if (process.env.GOOGLE_ANDROID_CLIENT_ID && redirectUri.includes('android')) {
				clientIdToUse = process.env.GOOGLE_ANDROID_CLIENT_ID;
			} else if (process.env.GOOGLE_IOS_CLIENT_ID) {
				clientIdToUse = process.env.GOOGLE_IOS_CLIENT_ID;
			} else if (process.env.GOOGLE_ANDROID_CLIENT_ID) {
				clientIdToUse = process.env.GOOGLE_ANDROID_CLIENT_ID;
			}
		}

		// Build token request params
		const params = new URLSearchParams();
		params.append('code', code);
		params.append('client_id', clientIdToUse);

		if ((process.env.GOOGLE_WEB_CLIENT_ID && clientIdToUse === process.env.GOOGLE_WEB_CLIENT_ID) && process.env.GOOGLE_WEB_CLIENT_SECRET) {
			params.append('client_secret', process.env.GOOGLE_WEB_CLIENT_SECRET as string);
		}
		params.append('grant_type', 'authorization_code');

		if (redirectUri) {
			params.append('redirect_uri', redirectUri);
		}
		if (codeVerifier) {
			params.append('code_verifier', codeVerifier);
		}

		// Finally get the token from google
		const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: params.toString()
		});

		if (!tokenRes.ok) {
			const text = await tokenRes.text();
			console.error('Token endpoint error:', text);
			return res.status(502).json({ message: 'Failed to exchange code', details: text });
		}

		const tokenJson = await tokenRes.json();
		const idToken = tokenJson.id_token as string | undefined;
		if (!idToken) {
			return res.status(400).json({ message: 'No id_token in token response', tokenResponse: tokenJson });
		}

		const ticket = await client.verifyIdToken({ idToken, audience: acceptedAudiences });
		const payload = ticket.getPayload();
		if (!payload || !payload.email) {
			return res.status(400).json({ message: 'Invalid token payload' });
		}

		const email = payload.email;
		const givenName = payload.given_name || '';
		const familyName = payload.family_name || '';
		const picture = payload.picture;

		let user = await userRepository.findOne({ where: { email }});
		if (!user) {
			const newUser = userRepository.create({
				email,
				username: `${givenName} ${familyName}`.trim() || email,
				password: '',
				age: 0,
				names: givenName || undefined,
				lastNames: familyName || undefined,
				profilePhoto: picture || undefined
			});
			user = await userRepository.save(newUser);
		}

		const userData = {
			email: user.email,
			username: user.username,
			names: user.names,
			lastNames: user.lastNames,
			profilePhoto: user.profilePhoto,
			description: user.description,
			gender: user.gender
		};

		return res.status(200).json({ message: 'OK', user: userData, tokens: tokenJson });
	} catch (error) {
		console.error('Error exchanging code for token:', error);
		return res.status(500).json({ message: 'Internal server error' });
	}
};