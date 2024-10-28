import express from 'express';
import type { Request, Response } from 'express';

const app = express();
const port = 3000;

// Define the route with types for `req` and `res`
app.get('/', (req: Request, res: Response) => {
    res.status(200).send("Welcome to root URL of Server");
});

// Start the server with a typed error parameter
app.listen(port, (error?: any) => {
    if (!error) {
        console.log(`Server is running on http://localhost:${port}`);
    } else {
        console.log("Error occurred, server can't start", error);
    }
});
