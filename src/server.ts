import express, { Request, Response } from 'express';
import routes from "./routes/routes"; 
 
const app = express();
const port = process.env.PORT || 4000;

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

app.use(express.json());

app.use('/api', routes);

app.get('/', (req: Request, res: Response) => {
  console.log('request received');
  res.send("Welcome to root URL of Server");
});

app.get('/hello', (req: Request, res: Response) => {
  res.send("Hello, World!");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});