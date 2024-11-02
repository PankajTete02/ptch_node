import express, { Request, Response } from 'express';
// import routes from "../src/routes/routes";
import routes from "./routes/routes"; 
 
 
const app = express();
const port = 4000;
 
app.use(express.json());

const cors = require("cors");
// Use dashboard routes correctly
app.use('/api', routes);

app.get('/', (req: Request, res: Response) => {
  console.log('request received');
  res.send("Welcome to root URL of Server");
  // res.status(200).send("Welcome to root URL of Server");
});

app.get('/hello', (req: Request, res: Response) => {
  // res.status(200).send("Hello World");
  res.send("Hello, World!");
});
 

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


// Start the server with a typed error parameter
app.listen(port, (error?: any) => {
    if (!error) {
        console.log(`Server is running on http://localhost:${port}`);
    } else {
        console.log("Error occurred, server can't start", error);
    }
});