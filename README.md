# noVNC Proxy Server

Proxy server untuk noVNC dengan dukungan koneksi dinamis ke berbagai VNC server.

## Fitur

- ✅ Proxy WebSocket untuk noVNC
- ✅ Konfigurasi IP/Host dinamis via URL parameter
- ✅ Interface web untuk mudah koneksi
- ✅ Docker support dengan health check
- ✅ Multi-stage Docker build
- ✅ Development mode dengan hot reload

## Cara Penggunaan

### 1. Manual (Development)

```bash
# Install dependencies
npm install
# atau jika menggunakan pnpm
pnpm install

# Jalankan server
node server.js
```

Akses:

- Main interface: http://localhost:7575
- noVNC direct: http://localhost:7575/vnc/vnc.html
- Dynamic connection: http://localhost:7575/vnc/vnc.html?host=192.168.1.100&port=5900

### 2. Docker Compose (Production)

```bash
# Build dan jalankan
docker-compose up -d

# Lihat logs
docker-compose logs -f

# Stop
docker-compose down
```

### 3. Docker Compose (Development)

```bash
# Development mode dengan hot reload
docker-compose -f docker-compose.dev.yml up -d

# Debug mode tersedia di port 9229
```

## Environment Variables

| Variable           | Default    | Description                |
| ------------------ | ---------- | -------------------------- |
| `HTTP_PORT`        | 7575       | Port untuk HTTP server     |
| `WEBSOCKET_PORT`   | 7576       | Port untuk WebSocket proxy |
| `DEFAULT_VNC_HOST` | 10.8.10.6  | Default VNC host           |
| `DEFAULT_VNC_PORT` | 5900       | Default VNC port           |
| `NODE_ENV`         | production | Environment mode           |

## URL Parameters

Anda bisa mengatur koneksi VNC secara dinamis menggunakan URL parameter:

- `host`: IP address atau hostname VNC server
- `port`: Port VNC server (default: 5900)

### Contoh:

```
# Koneksi ke Raspberry Pi
http://localhost:7575/vnc/vnc.html?host=192.168.1.100&port=5900

# Koneksi ke Windows VNC
http://localhost:7575/vnc/vnc.html?host=10.0.0.50&port=5900

# Koneksi ke server lain
http://localhost:7575/vnc/vnc.html?host=192.168.10.200&port=5901
```

## Docker Commands

```bash
# Build image
docker build -t novnc-proxy .

# Run container
docker run -d -p 7575:7575 -p 7576:7576 --name novnc-proxy novnc-proxy

# Check health
docker ps
docker logs novnc-proxy

# Stop dan remove
docker stop novnc-proxy
docker rm novnc-proxy
```

## VPS sebagai VPN Server

Jika VPS Anda adalah server VPN dan ingin mengakses client VPN (seperti `10.8.10.6`):

### 1. Gunakan Host Network Mode (Direkomendasikan)

```bash
# Gunakan docker-compose.yml yang sudah dikonfigurasi dengan host network
docker-compose up -d
```

### 2. Alternatif: Bridge Network dengan Extra Capabilities

```bash
# Jika host network tidak bekerja, gunakan bridge network
docker-compose -f docker-compose.bridge.yml up -d
```

### 3. Troubleshooting Network

```bash
# Cek apakah VPS bisa ping ke target VNC
ping 10.8.10.6

# Cek port VNC terbuka
telnet 10.8.10.6 5900

# Cek routing table
ip route | grep 10.8.10

# Cek interface VPN
ip addr show tun0
# atau
ip addr show tap0

# Cek logs container
docker-compose logs -f novnc-proxy
```

### 4. Test Koneksi dari Container

```bash
# Masuk ke container untuk debug
docker exec -it novnc-proxy sh

# Test ping dari dalam container
ping 10.8.10.6

# Test telnet dari dalam container
telnet 10.8.10.6 5900
```

## Troubleshooting

### Container tidak start

```bash
docker-compose logs novnc-proxy
```

### Health check failed

```bash
docker exec novnc-proxy wget -qO- http://localhost:7575/vnc/
```

### WebSocket connection error

- Pastikan port 7576 tidak digunakan aplikasi lain
- Check firewall rules
- Verify VNC server dapat diakses

### Permission denied

```bash
# Fix file permissions
sudo chown -R 1001:1001 .
```

## Development

```bash
# Install dependencies
npm install
# atau jika menggunakan pnpm
pnpm install

# Development mode
npm run dev

# Build untuk production
docker build --target production -t novnc-proxy:prod .
```

## Network Configuration

Jika menggunakan Docker network yang custom:

```yaml
networks:
  custom-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.25.0.0/16
```
