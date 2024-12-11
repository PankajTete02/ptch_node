import express, { Request, Response } from 'express';
import routes from './routes/routes'; 

const app = express();
const port = 4000;

const cors = require('cors');


app.use(
  cors({
    origin: [
      'http://localhost:4300',
      'https://vacana.cylsys.com'
    ],
    credentials: true,
    methods: 'POST, GET, PUT, OPTIONS, DELETE, PATCH',
    allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  })
);

// Body parser middleware
app.use(express.json());

// Use the routes after enabling CORS
app.use('/api', routes);

app.get('/', (req: Request, res: Response) => {
  console.log('request received');
  res.send('Welcome to root URL of Server');
});

app.get('/hello', (req: Request, res: Response) => {
  res.send('Hello, World!');
});

// Handle OPTIONS preflight requests
app.options('*', cors());

// Start the server
app.listen(port, (error?: any) => {
  if (!error) {
    console.log(`Server is running on http://localhost:${port}`);
  } else {
    console.log("Error occurred, server can't start", error);
  }
});
