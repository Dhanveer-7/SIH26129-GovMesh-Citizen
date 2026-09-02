import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendOrigins: (process.env.FRONTEND_ORIGIN || 'https://sih-26129-gov-mesh-citizen.vercel.app,http://localhost:5173')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean),
  revenueApiBaseUrl: process.env.REVENUE_API_BASE_URL || 'https://sih-2026-revenue-dept.onrender.com',
  foodApiBaseUrl: process.env.FOOD_API_BASE_URL || 'http://localhost:8081',
  ruralApiBaseUrl: process.env.RURAL_API_BASE_URL || 'http://localhost:5003',
  govmeshApiKey: process.env.GOVMESH_API_KEY || 'gm-secret-key-2026-interop'
};
