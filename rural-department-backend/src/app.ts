import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import ruralRouter from './routes/rural.js';

dotenv.config();

const app = express();

// Configure dynamic CORS allowed origins
const allowedOrigins = process.env.GOVMESH_ALLOWED_ORIGIN
  ? process.env.GOVMESH_ALLOWED_ORIGIN.split(',').map(o => o.trim())
  : [];

console.log(`[CORS Settings] Allowed origins: ${allowedOrigins.length > 0 ? allowedOrigins.join(', ') : 'None (Only local origin allowed)'}`);

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like server-to-server adapter curl/fetch)
    if (!origin) return callback(null, true);

    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`[CORS Blocked] Unauthorized origin blocked: ${origin}`);
      callback(new Error('CORS Policy: Request blocked by cross-origin resource rules.'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Mount the Rural API routes
app.use('/api/rural', ruralRouter);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({ 
    status: 'UP', 
    service: 'Simulated Rural Development Department API', 
    timestamp: new Date().toISOString() 
  });
});

export default app;
