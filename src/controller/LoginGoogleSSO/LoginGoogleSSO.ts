import { LoginRequest, Token } from "../../models/token";
import express from "express";
const { OAuth2Client } = require('google-auth-library');
const sql = require('mssql');
import { generateToken } from '../../utils/jwtUtils';
import { sqlConfig } from '../../../config/dbConfig';



const app = express();
app.use(express.json());

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

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


// export const LoginGoogleSSO = async(req:express.Request,res:express.Response)=>{
//     try {
// 		const reqBody: LoginRequest = req.body;

// 		if (!reqBody) {
// 			return {
// 				status: 400,
// 				jsonBody: { error: 'Request body is missing' },
// 			};
// 		}

// 		if (!reqBody.token) {
// 			return { status: 400, jsonBody: { error: 'Token is require' } };
// 		}

// 		let username: string;
// 		try {
// 			username = await verifyToken(reqBody.token);
// 		}  catch (err:any) {
//             if (err.code && err.code > 1) {
//               res.status(err.code).json({
//                 statusCode: err.code, message: err.message ? err.message : err
//               })
//             } else {
//               res.status(200).json({
//                 statusCode: err.code ? err.code : 500, message: err.message ? err.message : err
//               })
//             }
//           }
// 		const user = await findUser(username);
// 		if (!user) {
// 			return { status: 404, jsonBody: { status: 404, error: 'User not found' } };
// 		}

// 		const token: Token = { jwt: generateToken(user) } as Token;

// 		return {
// 			status: 200,
// 			jsonBody: { token: token, message: 'Login successful' },
// 		};
// 	}catch (err:any) {
//         if (err.code && err.code > 1) {
//           res.status(err.code).json({
//             statusCode: err.code, message: err.message ? err.message : err
//           })
//         } else {
//           res.status(200).json({
//             statusCode: err.code ? err.code : 500, message: err.message ? err.message : err
//           })
//         }
//       }
// }

export const LoginGoogleSSO = async (req: express.Request, res: express.Response) => {
	try {
		const reqBody: LoginRequest = req.body;

		if (!reqBody) {
			return res.status(400).json({ error: 'Request body is missing' });
		}

		if (!reqBody.token) {
			return res.status(400).json({ error: 'Token is required' });
		}

		let username: string;

		// Token verification
		try {
			username = await verifyToken(reqBody.token);
		} catch (err: any) {
			if (err.code && err.code > 1) {
				return res.status(err.code).json({
					statusCode: err.code,
					message: err.message ? err.message : err,
				});
			} else {
				return res.status(401).json({
					statusCode: 401,
					message: err.message ? err.message : 'Unauthorized',
				});
			}
		}

		// Fetch the user by username
		const user = await findUser(username);
		if (!user) {
			return res.status(404).json({ statusCode: 404, error: 'User not found' });
		}

		// Generate JWT token
		const token: Token = { jwt: generateToken(user) } as Token;

		return res.status(200).json({ token, message: 'Login successful' });
	} catch (err: any) {
		console.error(err); // Log the error for debugging

		// Handle unexpected errors
		return res.status(500).json({
			statusCode: 500,
			message: err.message ? err.message : 'Internal Server Error',
		});
	}
};

