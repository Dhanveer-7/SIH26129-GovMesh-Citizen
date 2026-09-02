import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import govmeshRouter from './routes/govmeshRouter.js';

const app = express();

// Configure CORS for Citizen Portal and local frontend clients
app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server or non-browser requests without origin header
    if (!origin) return callback(null, true);
    
    // Check if origin is allowed or in local development
    const isAllowed = config.frontendOrigins.includes(origin) ||
                      origin.includes('localhost') ||
                      origin.includes('127.0.0.1') ||
                      origin.includes('vercel.app');

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} is not permitted by GovMesh CORS policy.`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-ID', 'Idempotency-Key'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// Serverless URL normalization
app.use((req, res, next) => {
  if (req.url.startsWith('/api/api/')) {
    req.url = req.url.substring(4);
  }
  next();
});

// Mount GovMesh Core Routers
app.use('/', govmeshRouter);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[GovMesh Server Error]', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = config.port;
if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`============================================================`);
    console.log(`GOVMESH CORE INTEROPERABILITY ENGINE ACTIVE`);
    console.log(`Port: ${PORT} | Environment: ${config.nodeEnv}`);
    console.log(`Health: http://localhost:${PORT}/api/health`);
    console.log(`Transactions: http://localhost:${PORT}/api/govmesh/transactions`);
    console.log(`============================================================`);
  });
}

export default app;
