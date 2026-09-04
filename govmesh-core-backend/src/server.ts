import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import govmeshRouter from './routes/govmeshRouter.js';

const app = express();

// Allowed origin regexes for development and verified Vercel production/preview deployments
const ALLOWED_ORIGIN_PATTERNS = [
  /^https:\/\/sih-26129-gov-mesh-citizen(-[a-z0-9-]+)?\.vercel\.app$/,
  /^https:\/\/sih-26129-gov-mesh-rural-develpment(-[a-z0-9-]+)?\.vercel\.app$/,
  /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/
];

// Configure CORS for Citizen Portal and authenticated frontend/backend clients
app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server or non-browser requests without origin header
    if (!origin) return callback(null, true);
    
    // Check exact matches from configured origins
    if (config.frontendOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Check secure pattern matches (prevents vercel.app wildcard subdomain hijacking)
    const isPatternMatched = ALLOWED_ORIGIN_PATTERNS.some(pattern => pattern.test(origin));

    if (isPatternMatched) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} is not permitted by GovMesh CORS security policy.`));
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
