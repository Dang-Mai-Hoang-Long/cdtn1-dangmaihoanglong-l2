import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import pool from './db.js';
import TicketRepository from './repositories/ticketRepository.js';
import createTicketRoutes from './routes/TicketRoute.js';
import TicketService from './services/ticketService.js';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const buildDirectory = path.join(projectRoot, 'dist');

export function createApp({ database = pool } = {}) {
  const app = express();

  app.disable('x-powered-by');
  app.use(express.json());

  app.get('/health', (_request, response) => {
    response.json({ status: 'ok' });
  });

  const ticketRepository = new TicketRepository(database);
  const ticketService = new TicketService(ticketRepository);
  app.use('/api/tickets', createTicketRoutes(ticketService));

  app.use('/api', (error, _request, response, _next) => {
    console.error('Lỗi API:', error.message);
    response.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Không thể xử lý yêu cầu lúc này.',
    });
  });

  app.use(express.static(buildDirectory, { index: 'index.html' }));

  return app;
}

const app = createApp();

export default app;
