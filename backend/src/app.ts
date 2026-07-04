import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { connectDb } from './config/db';
import { connectRedis } from './config/redis';
import router from './routes/api';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
  }
});

// Configure Security Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json());

// Express Rate Limiter for DDoS / Brute Force prevention
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api', apiLimiter);

// Bind API Router
app.use('/api', router);

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// Socket.io WebSockets connection handler for real-time dashboard events
io.on('connection', (socket) => {
  console.log(`[Socket]: Client connected: ${socket.id}`);
  
  socket.on('join_account_room', (address) => {
    socket.join(address);
    console.log(`[Socket]: Client ${socket.id} joined room ${address}`);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket]: Client disconnected: ${socket.id}`);
  });
});

// Expose WebSocket instance for event emitters
export const emitLedgerEvent = (roomAddress: string, eventName: string, data: any) => {
  io.to(roomAddress).emit(eventName, data);
  console.log(`[WebSocket]: Broadcasted event ${eventName} to room ${roomAddress}`);
};

const PORT = process.env.PORT || 3001;

const startServer = async () => {
  // 1. Connect database (Prisma / PostgreSQL)
  await connectDb();
  
  // 2. Connect Redis cache / pub-sub
  await connectRedis();

  httpServer.listen(PORT, () => {
    console.log(`[Server]: StreamSave Backend running on port ${PORT}`);
  });
};

startServer();
