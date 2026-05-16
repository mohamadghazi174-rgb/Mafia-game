// ═══════════════════════════════════════
//  MAFIA NOIR V2 — Server Entry
// ═══════════════════════════════════════
const express  = require('express');
const http     = require('http');
const path     = require('path');
const { Server } = require('socket.io');

const config        = require('./config');
const logger        = require('./logger');
const socketHandler = require('../socket/socketHandler');

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, {
  cors:          { origin: '*' },
  pingTimeout:   60000,
  pingInterval:  25000,
  transports:    ['websocket', 'polling'],
});

// ── Middleware ────────────────────────
app.use(express.json());

// ── Static ────────────────────────────
app.use(express.static(path.join(__dirname, '../public')));

// ── Routes ────────────────────────────
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../public/index.html')));
app.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

// ── Sockets ───────────────────────────
socketHandler(io);

// ── Init DB ───────────────────────────
try {
  require('../db/database').getDb();
} catch (e) {
  logger.warn('Server', 'DB init skipped (will use fallback)');
}

// ── Start ─────────────────────────────
server.listen(config.PORT, () => {
  logger.info('Server', `🎭 Mafia Noir V2 — http://localhost:${config.PORT}`);
});

// ── Graceful Shutdown ─────────────────
process.on('SIGTERM', () => { server.close(() => process.exit(0)); });
process.on('SIGINT',  () => { server.close(() => process.exit(0)); });
