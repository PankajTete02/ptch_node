import express, { Request, Response } from 'express';
import routes from "./src/routes/routes"
 
 
const app = express();
const port = 3000;
 
app.use(express.json());

const cors = require("cors");
app.use(
  cors({
    origin: [
      "https://vacana.cylsys.com",
      "http://localhost:4300"
    ],
    credentials: true,
    methods: "POST, GET, PUT, OPTIONS, DELETE,PATCH",
  })
);
 
 
// Use dashboard routes correctly
app.use('/api', routes);
 
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