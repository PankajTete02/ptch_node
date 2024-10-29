import { Request, Response, NextFunction } from 'express';
const jwt = require('jsonwebtoken');

import {
    HEADER_USER_ID,
    HEADER_CONTAINER_NAME,
    HEADER_USER_EMAIL,
    HEADER_USER_NAME,
    HEADER_CLIENT_ID,
    HEADER_CLIENT_NAME,
    HEADER_USER_ROLE,
} from '../constants/constant';
import { jwt_secret } from '../../config/environment';

export function jwtMiddleware(req: Request, res: Response, next: NextFunction): void {
	console.log("req",req);
	
    const authHeader = req.headers['authorization'];
    const secretKey = process.env.jwt_secret || jwt_secret;
	console.log(authHeader,"authHeader");
	

    if (!authHeader) {
        console.log('Missing Authorization header');
        res.status(401).json({ code: 401, error: 'Authorization header is missing' });
        return;
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        console.log('Missing JWT token');
        res.status(401).json({ code: 401, error: 'JWT token is missing' });
        return;
    }

    try {
        const decoded: any = jwt.verify(token, secretKey);

        // Set headers with decoded token values
        req.headers[HEADER_USER_ID] = decoded.id;
        req.headers[HEADER_USER_EMAIL] = decoded.emailId;
        req.headers[HEADER_USER_NAME] = decoded.username;
        req.headers[HEADER_CLIENT_ID] = decoded.clientId;
        req.headers[HEADER_CLIENT_NAME] = decoded.clientName;
        req.headers[HEADER_USER_ROLE] = decoded.roleName;
        req.headers[HEADER_CONTAINER_NAME] = decoded.cname;

         // Proceed to next middleware or route handler
    } catch (error: any) {
        console.log('Error verifying token:', error);

        if (error.name === 'TokenExpiredError') {
            res.status(401).json({ code: 401, error: 'JWT token has expired' });
        } else if (error.name === 'JsonWebTokenError') {
            res.status(401).json({ code: 401, error: 'Invalid JWT token' });
        } else {
            res.status(401).json({ code: 401, error: 'Failed to authenticate token' });
        }
    }
	next();
}