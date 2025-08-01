const express = require('express');
const WebSocket = require('ws');
const net = require('net');
const http = require('http');
const path = require('path');

const app = express();
const HTTP_PORT = 7575;     // port HTTP untuk serve noVNC
const WS_PORT = 5900;       // port VNC tujuan (misalnya Raspberry Pi 1)
const WEBSOCKET_PORT = HTTP_PORT + 1; // WebSocket port, contoh 7576

const VNC_HOST = '10.8.10.6'; // alamat internal Raspberry Pi (via VPN) - default

app.use('/vnc', express.static(path.join(__dirname, 'public')));

// Redirect root to index page
app.get('/', (req, res) => {
  res.redirect('/vnc/index.html');
});

// Redirect /vnc/ to /vnc/vnc.html
app.get('/vnc/', (req, res) => {
  res.redirect('/vnc/vnc.html');
});

// API endpoint untuk mendapatkan informasi koneksi
app.get('/vnc/info', (req, res) => {
  const targetHost = req.query.host || VNC_HOST;
  const targetPort = req.query.port || WS_PORT;
  res.json({
    websocketPort: WEBSOCKET_PORT,
    targetHost: targetHost,
    targetPort: parseInt(targetPort)
  });
});

const server = http.createServer(app);

server.listen(HTTP_PORT, () => {
  console.log(`HTTP server running at http://localhost:${HTTP_PORT}/vnc`);
});

// WebSocket proxy (Websockify) - meneruskan ke VNC backend
const wss = new WebSocket.Server({ port: WEBSOCKET_PORT });

wss.on('connection', (ws, req) => {
  console.log('WebSocket connection established from:', req.connection.remoteAddress);
  
  // Parse URL untuk mendapatkan parameter host dan port
  const url = new URL(req.url, `http://localhost:${WEBSOCKET_PORT}`);
  const targetHost = url.searchParams.get('host') || VNC_HOST;
  const targetPort = parseInt(url.searchParams.get('port')) || WS_PORT;
  
  console.log(`Attempting to connect to VNC server at ${targetHost}:${targetPort}`);
  
  // Create TCP connection to VNC server
  const vnc = net.createConnection(targetPort, targetHost);
  
  vnc.on('connect', () => {
    console.log(`✅ Successfully connected to VNC server at ${targetHost}:${targetPort}`);
  });
  
  vnc.on('data', (data) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(data);
    }
  });
  
  vnc.on('error', (err) => {
    console.error(`❌ VNC connection error to ${targetHost}:${targetPort}:`, err.message);
    console.error('Full error:', err);
    ws.close();
  });
  
  vnc.on('close', () => {
    console.log(`🔌 VNC connection to ${targetHost}:${targetPort} closed`);
    ws.close();
  });
  
  ws.on('message', (data) => {
    vnc.write(data);
  });
  
  ws.on('close', () => {
    console.log('🔌 WebSocket connection closed');
    vnc.end();
  });
  
  ws.on('error', (err) => {
    console.error('❌ WebSocket error:', err.message);
    vnc.end();
  });
});

console.log(`WebSocket proxy running on port ${WEBSOCKET_PORT}, forwarding to ${VNC_HOST}:${WS_PORT}`);
