import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { sqlConfig } from "../../config/dbConfig";
import { jwt_secret } from "../../config/environment";

const sql = require('mssql');
const envSecrectKey = jwt_secret

export async function login(req: Request, res: Response): Promise<void> {
    // console.log(`Processing request for URL: ${req.url}`);
    // console.log("kkkk");
    try {
        const { email, password } = req.body;
        // console.log(req.body);
        
        // Validate input
        // if (!email || !password) {
        //     res.status(400).json({ error: 'Email and password are required' });
        //     return;
        // }

        // Fetch user from the database by email
        const user = await findUser('pankajt0201@gmail.com');
        
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Compare the password with the stored hash
        // // const passwordMatch = await bcrypt.compare(password, user.password);
        // if (!passwordMatch) {
        //     res.status(401).json({ error: 'Invalid password' });
        //     return;
        // }

        // Generate JWT token
        const token = generateToken(user);
        // console.log(token,"tokennnn");
        
        // Return token and success message
        res.status(200).json({ token, message: 'Login successful' });

    }  catch (err: any) {
        console.error(err,"errrrrr"); // Log the error for debugging
 
        // Handle unexpected errors
         res.status(500).json({
            statusCode: 500,
            message: err.message ? err.message : 'Internal Server Error',
        });
        return;
    }
}

const generateToken = (user: any): string => {
    const payload = {
        id: user.id,
        email: user.emailId,
        // Add any other user info to the token payload as needed
    };
    const secretKey = envSecrectKey;  // Replace with your secret key
    return jwt.sign(payload, secretKey, { expiresIn: '1h' });  // Set expiration as needed
};
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
    // console.log(user,"check");
	return user;
}
