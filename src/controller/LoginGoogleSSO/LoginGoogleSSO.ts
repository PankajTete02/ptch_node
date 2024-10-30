import { LoginRequest, Token } from "../../models/token";
import express from "express";
const { OAuth2Client } = require('google-auth-library');
const sql = require('mssql');
import { generateToken } from '../../utils/jwtUtils';
import { sqlConfig } from '../../../src/config/dbConfig';

import { GOOGLE_CLIENT_ID } from '../../../src/config/environment'
import { Request, Response } from 'express';

const app = express();
app.use(express.json());

const CLIENT_ID = GOOGLE_CLIENT_ID;

async function verifyToken(token: string) {
	const client = new OAuth2Client(CLIENT_ID);
	const ticket = await client.verifyIdToken({
		idToken: token,
		audience: CLIENT_ID,
	});
	const payload = ticket.getPayload();

	return payload['email'];
}

async function findUser(username: string) {
	const poolConnection = await sql.connect(sqlConfig);

	// Query to find user details
	const resultSet = await poolConnection.request().query(`
        SELECT a.id, a.emailId, a.firstname, a.lastname, a.username, a.clientId, b.clientName, 
               b.containerName AS cname, c.roleName 
        FROM users a 
        JOIN clients b ON a.clientId = b.id 
        JOIN userRoleMap d ON a.id = d.userid 
        JOIN roles c ON d.roleid = c.id
        WHERE a.username = '${username}'
    `);

	console.log(`${resultSet.recordset.length} rows returned.`);

	const user = resultSet.recordset[0];
	return user ? user : null;
}


export async function LoginGoogleSSO(req: Request, res: Response): Promise<void> {
	try {
		console.log(req.body);
		
		const reqBody: LoginRequest = req.body;

		if (!reqBody) {
			res.status(400).json({ error: 'Request body is missing' });
			return;
		}

		if (!reqBody.token) {
			res.status(400).json({ error: 'Token is required' });
			return;
		}

		let username: string;

		// Token verification
		try {
			username = await verifyToken(reqBody.token);
		} catch (err: any) {
			if (err.code && err.code > 1) {
				 res.status(err.code).json({statusCode: err.code,message: err.message ? err.message : err});
				 return;
			} else {
				res.status(401).json({
					statusCode: 401,
					message: err.message ? err.message : 'Unauthorized',
				});
				return;
			}
		}

		// Fetch the user by username
		const user = await findUser(username);
		if (!user) {
			res.status(404).json({ statusCode: 404, error: 'User not found' });
			return;
		}

		// Generate JWT token
		const token: Token = { jwt: generateToken(user) } as Token;

		res.status(200).json({ token, message: 'Login successful' });
		return;
	} catch (err: any) {
		console.error(err); // Log the error for debugging

		// Handle unexpected errors
		 res.status(500).json({
			statusCode: 500,
			message: err.message ? err.message : 'Internal Server Error',
		});
		return;
	}
};

