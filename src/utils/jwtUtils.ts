const jwt = require('jsonwebtoken');

import {jwt_secret} from '../../config/environment'

export const generateToken = (payload: any) => {
	if (!payload) {
		return { status: 404, jsonBody: { status: 404, error: 'User not found in system' } };
	}
	const secretKey = jwt_secret; // Replace with your own secret key
	const options = {
		expiresIn: '1h', // Token expiration time
		issuer: 'Pitchlab.com',
		audience: 'Pitchlab.com',
	};

	const token = jwt.sign(payload, secretKey, options);
	return token;
};

export function verifyToken(token: string): any {
	if (!token) {
		return { status: 404, body: 'Token is required' };
	}

	try {
		const secretKey = jwt_secret;
		const options = {
			issuer: 'Pitchlab.com',
			audience: 'Pitchlab.com',
		};
		return jwt.verify(token, secretKey, options);
	} catch (error) {
		throw 'JWTInvalid';
	}
}
