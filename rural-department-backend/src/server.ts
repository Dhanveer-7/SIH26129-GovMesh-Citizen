import app from './app.js';

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log(`============================================================`);
  console.log(` GovMesh Rural Department Demo API is active!`);
  console.log(` Running locally on port: http://localhost:${PORT}`);
  console.log(` Endpoints:`);
  console.log(` - POST /api/rural/address-update (Submit update)`);
  console.log(` - GET  /api/rural/application/:id (Query status)`);
  console.log(` - POST /api/rural/demo/toggle-failure (Simulate crash)`);
  console.log(`============================================================`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error(`[Fatal Server Error] Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});
