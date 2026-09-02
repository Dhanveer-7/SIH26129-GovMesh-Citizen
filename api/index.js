import app from '../govmesh-core-backend/dist/server.js';

export default function handler(req, res) {
  return app(req, res);
}
