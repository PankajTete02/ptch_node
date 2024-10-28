const jwt = require('jsonwebtoken');
import express, { NextFunction, request } from "express";
import {
	HEADER_USER_ID,
	HEADER_CONTAINER_NAME,
	HEADER_USER_EMAIL,
	HEADER_USER_NAME,
	HEADER_CLIENT_ID,
	HEADER_CLIENT_NAME,
	HEADER_USER_ROLE,
} from '../constants/constant';



export function jwtMiddleware(req: express.Request, res: express.Response, next: NextFunction) {
	const authHeader = req.headers['authorization'];;
	const secretKey = process.env.jwt_secret;

	if (!authHeader) {
		console.log('Missing Authorization header');
		return res.status(401).json({ code: 401, error: 'Authorization header is missing' });
	}

	const token = authHeader.split(' ')[1];

	if (!token) {
		console.log('Missing JWT token');
		return res.status(401).json({ code: 401, error: 'JWT token is missing' });
	}

	try {
		// Verify the token
		const decoded: any = jwt.verify(token, secretKey);

		// Add the user details (from the decoded token) into the request headers for future use
		req.headers[HEADER_USER_ID] = decoded.id;
		req.headers[HEADER_USER_EMAIL] = decoded.emailId;
		req.headers[HEADER_USER_NAME] = decoded.username;
		req.headers[HEADER_CLIENT_ID] = decoded.clientId;
		req.headers[HEADER_CLIENT_NAME] = decoded.clientName;
		req.headers[HEADER_USER_ROLE] = decoded.roleName;
		req.headers[HEADER_CONTAINER_NAME] = decoded.cname;
	} catch (error: any) {
		console.log('Error verifying token:', error);

		// Handle specific JWT errors for better clarity
		if (error.name === 'TokenExpiredError') {
			return res.status(401).json({ code: 401, error: 'JWT token has expired' });
		} else if (error.name === 'JsonWebTokenError') {
			return res.status(401).json({ code: 401, error: 'Invalid JWT token' });
		} else {
			return res.status(401).json({ code: 401, error: 'Failed to authenticate token' });
		}
	}

	const userId = req.headers[HEADER_USER_ID] || process.env.DEV_USER_ID;

	// Get the container name from JWT
	const containerName = req.headers[HEADER_CONTAINER_NAME] || process.env.PORTFOLIO_STORAGE_CONTAINER_NAME;

	if (!userId) {
		return res.status(401).json({ code: 401, error: 'User not found' });
	}

	// Call the next handler in the chain
	next();
}