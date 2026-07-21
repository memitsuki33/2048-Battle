import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function gameServerPlugin() {
  return {
    name: 'game-server',
    async configureServer(server) {
      // Dynamically import ws so vite build succeeds even if ws is unavailable
      let WebSocketServer;
      try {
        ({ WebSocketServer } = await import('ws'));
      } catch {
        return; // ws not available; skip game server (production static build)
      }
      const wss = new WebSocketServer({ noServer: true });

      // In-memory rooms: code -> { players: [ws, ...], level: number }
      const rooms = new Map();

      function makeCode() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
        return rooms.has(code) ? makeCode() : code;
      }

      function relay(sender, msg) {
        const roomCode = sender._roomCode;
        if (!roomCode) return;
        const room = rooms.get(roomCode);
        if (!room) return;
        for (const p of room.players) {
          if (p !== sender && p.readyState === 1) {
            p.send(JSON.stringify(msg));
          }
        }
      }

      wss.on('connection', (ws) => {
        ws._roomCode = null;

        ws.on('message', (raw) => {
          let msg;
          try { msg = JSON.parse(raw); } catch { return; }

          if (msg.type === 'create') {
            const code = makeCode();
            rooms.set(code, { players: [ws], level: msg.level ?? 0 });
            ws._roomCode = code;
            ws.send(JSON.stringify({ type: 'created', code }));
            return;
          }

          if (msg.type === 'join') {
            const code = (msg.code ?? '').toUpperCase().trim();
            const room = rooms.get(code);
            if (!room) {
              ws.send(JSON.stringify({ type: 'error', message: 'Room not found' }));
              return;
            }
            if (room.players.length >= 2) {
              ws.send(JSON.stringify({ type: 'error', message: 'Room is full' }));
              return;
            }
            room.players.push(ws);
            ws._roomCode = code;
            ws.send(JSON.stringify({ type: 'joined', level: room.level }));
            // Both players ready — send start to each with their index
            room.players[0].send(JSON.stringify({ type: 'start', playerIndex: 0, level: room.level }));
            room.players[1].send(JSON.stringify({ type: 'start', playerIndex: 1, level: room.level }));
            return;
          }

          // Relay everything else (garbage, game_over, score, etc.)
          relay(ws, msg);
        });

        ws.on('close', () => {
          const code = ws._roomCode;
          if (!code) return;
          const room = rooms.get(code);
          if (!room) return;
          // Notify remaining player
          relay(ws, { type: 'opponent_left' });
          // Clean up room
          rooms.delete(code);
        });
      });

      // Intercept HTTP upgrade for our path only
      server.httpServer.on('upgrade', (request, socket, head) => {
        if (request.url === '/game-ws') {
          wss.handleUpgrade(request, socket, head, (ws) => {
            wss.emit('connection', ws, request);
          });
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), gameServerPlugin()],
  server: {
    host: '0.0.0.0',
    port: 5000,
    allowedHosts: true,
  },
});
