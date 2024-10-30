import express, { Request, Response } from 'express';
// import routes from "../src/routes/routes";
import routes from "./routes/routes"; 
 
 
const app = express();
const port = 4000;
 
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
    console.log('request received');
    res.status(200).send("Welcome to root URL of Server");
});

