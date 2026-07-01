# Cabinet Dentaire Ivoire — Full Deployment Guide

**Stack:** React/Vite (frontend) · Spring Boot (backend) · PostgreSQL (database) · Nginx (reverse proxy) · Docker Compose  
**Target server:** Ubuntu/Debian Linux VPS  
**Author:** Aka Konin  

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [What You Need Before Starting](#2-what-you-need-before-starting)
3. [Step 1 — Prepare the Server](#step-1--prepare-the-server)
4. [Step 2 — Install Docker and Docker Compose](#step-2--install-docker-and-docker-compose)
5. [Step 3 — Upload the Source Code](#step-3--upload-the-source-code)
6. [Step 4 — Configure Environment Variables](#step-4--configure-environment-variables)
7. [Step 5 — Update docker-compose.yml for the Server](#step-5--update-docker-composeyml-for-the-server)
8. [Step 6 — Build and Start the Application](#step-6--build-and-start-the-application)
9. [Step 7 — Verify Everything Is Running](#step-7--verify-everything-is-running)
10. [Step 8 — Configure the Firewall](#step-8--configure-the-firewall)
11. [Step 9 — Point Your Domain to the Server](#step-9--point-your-domain-to-the-server)
12. [Step 10 — Enable HTTPS with Let's Encrypt (SSL)](#step-10--enable-https-with-lets-encrypt-ssl)
13. [Routine Operations](#routine-operations)
14. [Troubleshooting](#troubleshooting)

---

## 1. Architecture Overview

When deployed, the application runs as three Docker containers managed by Docker Compose:

```
Internet
    │
    ▼
[ Nginx - Port 80/443 ]   ← Frontend container (serves React app)
    │
    │  /api/* requests
    ▼
[ Spring Boot - Port 8090 ]  ← Backend container (internal only)
    │
    ▼
[ PostgreSQL - Port 5432 ]   ← Database container (internal only)
```

- **Nginx** receives all traffic. Static React files are served directly. Any request starting with `/api/` is forwarded (proxied) to the Spring Boot backend.
- **Spring Boot** handles business logic, authentication, and data access. It is not exposed to the internet directly — only Nginx can reach it.
- **PostgreSQL** stores all data. It is not exposed to the internet — only Spring Boot can reach it.
- All three containers communicate through a private Docker network called `app-network`.

---

## 2. What You Need Before Starting

### On your local machine:
- Git installed
- Both projects committed and pushed to GitHub (or another remote):
  - Backend: `hospital` project
  - Frontend: `cdi` project
- Access to your server (SSH key or password)

### On the server:
- A Linux VPS (Ubuntu 22.04 LTS recommended)
- A public IP address (e.g. `95.217.183.200`)
- SSH access as root or a sudo user
- Optional: a domain name pointed to the server IP (e.g. `cabinetdentaireivoire.com`)

### Credentials you must have ready:
| Variable | Description |
|---|---|
| `DB_USERNAME` | PostgreSQL username you choose |
| `DB_PASSWORD` | PostgreSQL password you choose (make it strong) |
| `MAIL_USERNAME` | Gmail address used to send emails |
| `MAIL_PASSWORD` | Gmail App Password (16-character, not your real Gmail password) |
| `JWT_SECRET` | A long random string (64+ characters) for signing tokens |
| `JWT_EXPIRATION_MS` | Token lifetime in milliseconds (e.g. `86400000` = 24 hours) |
| `BASE_URL` | The public URL of your app (e.g. `https://cabinetdentaireivoire.com`) |

---

## Step 1 — Prepare the Server

Connect to your server via SSH:

```bash
ssh root@95.217.183.200
```

Update the system packages:

```bash
apt update && apt upgrade -y
```

Install essential tools:

```bash
apt install -y git curl wget unzip ufw
```

Create a dedicated directory for the application:

```bash
mkdir -p /opt/cdi
cd /opt/cdi
```

---

## Step 2 — Install Docker and Docker Compose

### Install Docker

Run the official Docker installation script:

```bash
curl -fsSL https://get.docker.com | sh
```

Verify Docker is installed:

```bash
docker --version
# Expected output: Docker version 26.x.x, build ...
```

### Install Docker Compose plugin

Docker Compose v2 is installed as a plugin (command is `docker compose`, not `docker-compose`):

```bash
apt install -y docker-compose-plugin
```

Verify Docker Compose is installed:

```bash
docker compose version
# Expected output: Docker Compose version v2.x.x
```

### Start Docker and enable it on boot

```bash
systemctl start docker
systemctl enable docker
```

---

## Step 3 — Upload the Source Code

You have two options: clone from GitHub, or upload directly from your machine.

### Option A — Clone from GitHub (recommended)

If both projects are on GitHub, SSH into the server and clone them:

```bash
cd /opt/cdi

# Clone the backend
git clone https://github.com/YOUR_USERNAME/hospital.git

# Clone the frontend
git clone https://github.com/YOUR_USERNAME/cdi.git
```

Your directory structure will look like this:

```
/opt/cdi/
├── hospital/     ← Spring Boot backend
└── cdi/          ← React/Vite frontend
```

### Option B — Upload with SCP (if not on GitHub)

From your **local machine** (Windows terminal), upload the projects:

```bash
# Upload backend
scp -r "C:\Users\DELL\Documents\workspace-spring-tools-for-eclipse-4.30.0.RELEASE\hospital" root@95.217.183.200:/opt/cdi/

# Upload frontend
scp -r "C:\Users\DELL\Desktop\frontends\cdi" root@95.217.183.200:/opt/cdi/
```

---

## Step 4 — Configure Environment Variables

The backend reads secrets from a `.env` file at startup. This file is **never committed to Git** (it is in `.gitignore`) — you must create it manually on the server every time.

On the server, inside the `hospital` directory:

```bash
cd /opt/cdi/hospital
nano .env
```

Paste and fill in your values:

```env
DB_URL=jdbc:postgresql://db:5432/hospital
DB_USERNAME=cdi_user
DB_PASSWORD=YourStrongPasswordHere

MAIL_USERNAME=dentaireivoirecabinet@gmail.com
MAIL_PASSWORD=your_gmail_app_password_here

JWT_SECRET=ThisIsAVeryLongSecretKeyThatShouldBeAtLeast64CharactersForSecurity1234
JWT_EXPIRATION_MS=86400000

BASE_URL=https://cabinetdentaireivoire.com
```

Save and close: press `Ctrl+X`, then `Y`, then `Enter`.

> **Important notes:**
> - `DB_URL` must use `db` as the hostname (not `localhost`) — that is the name of the PostgreSQL container in Docker Compose.
> - `MAIL_PASSWORD` is a Gmail **App Password**, not your real Gmail password. Generate one at: Google Account → Security → 2-Step Verification → App Passwords.
> - `JWT_SECRET` must be at least 64 characters. You can generate one with: `openssl rand -hex 64`

---

## Step 5 — Update docker-compose.yml for the Server

The `docker-compose.yml` in the `hospital` project references the frontend with a local Windows path. On the server, the path is different.

Open the file:

```bash
cd /opt/cdi/hospital
nano docker-compose.yml
```

Find the `frontend` service build section and update the context path:

```yaml
# BEFORE (Windows local path):
  frontend:
    build:
      context: ../../../Desktop/frontends/cdi

# AFTER (server path):
  frontend:
    build:
      context: ../cdi
```

The full updated `docker-compose.yml` should look like this:

```yaml
services:
  db:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_DB: hospital
      POSTGRES_USER: ${DB_USERNAME}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - app-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USERNAME} -d hospital"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: .
      dockerfile: Dockerfile
    restart: unless-stopped
    ports:
      - "8090:8090"
    environment:
      DB_URL: jdbc:postgresql://db:5432/hospital
      DB_USERNAME: ${DB_USERNAME}
      DB_PASSWORD: ${DB_PASSWORD}
      MAIL_USERNAME: ${MAIL_USERNAME}
      MAIL_PASSWORD: ${MAIL_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      JWT_EXPIRATION_MS: ${JWT_EXPIRATION_MS}
      BASE_URL: ${BASE_URL}
    depends_on:
      db:
        condition: service_healthy
    networks:
      - app-network

  frontend:
    build:
      context: ../cdi
      dockerfile: Dockerfile
    restart: unless-stopped
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - app-network

networks:
  app-network:
    driver: bridge

volumes:
  postgres_data:
```

Save and close with `Ctrl+X`, then `Y`, then `Enter`.

---

## Step 6 — Build and Start the Application

Make sure you are in the `hospital` directory (where `docker-compose.yml` lives):

```bash
cd /opt/cdi/hospital
```

Build all Docker images and start the containers in detached mode (running in the background):

```bash
docker compose up -d --build
```

What happens during this command:
1. Docker downloads the PostgreSQL image from Docker Hub
2. Docker builds the **backend** image: downloads Maven, compiles the Spring Boot project, packages it as a JAR, then creates a lean JRE image
3. Docker builds the **frontend** image: downloads Node.js, installs npm packages, runs `npm run build` to compile React, then creates an Nginx image serving the compiled files
4. Docker creates the private network `app-network`
5. Docker starts all three containers in the correct order: database first, then backend (waits for DB health check), then frontend

This process can take **5 to 15 minutes** on the first run because Maven downloads all dependencies. Subsequent builds are much faster due to Docker layer caching.

---

## Step 7 — Verify Everything Is Running

### Check container status

```bash
docker compose ps
```

Expected output (all should show `Up` or `running`):

```
NAME                    STATUS          PORTS
hospital-db-1           Up (healthy)    5432/tcp
hospital-backend-1      Up              0.0.0.0:8090->8090/tcp
hospital-frontend-1     Up              0.0.0.0:80->80/tcp
```

### Check container logs

View backend logs (useful to confirm Spring Boot started successfully):

```bash
docker compose logs backend --tail=50
```

Look for a line like:
```
Started HospitalApplication in 12.345 seconds
```

View frontend/Nginx logs:

```bash
docker compose logs frontend --tail=20
```

View database logs:

```bash
docker compose logs db --tail=20
```

### Test the public API endpoint

```bash
curl http://localhost/api/v1/hospital/public
```

Expected: a JSON response with clinic information.

### Test in a browser

Open your browser and go to:
```
http://95.217.183.200
```

The React application should load.

---

## Step 8 — Configure the Firewall

Allow only necessary ports through the firewall. The database (5432) and backend (8090) should **not** be accessible from the internet — only from within Docker.

```bash
# Allow SSH (keep this or you'll lock yourself out)
ufw allow 22/tcp

# Allow HTTP (the frontend Nginx)
ufw allow 80/tcp

# Allow HTTPS (for SSL, added later)
ufw allow 443/tcp

# Enable the firewall
ufw enable
```

Verify the rules:

```bash
ufw status
```

Expected:
```
Status: active

To                         Action      From
--                         ------      ----
22/tcp                     ALLOW       Anywhere
80/tcp                     ALLOW       Anywhere
443/tcp                    ALLOW       Anywhere
```

> Note: Port 8090 is intentionally NOT opened. The backend is only reachable from within the Docker network (by Nginx). This is correct and secure.

---

## Step 9 — Point Your Domain to the Server

If you have a domain name (e.g. `cabinetdentaireivoire.com`), go to your domain registrar's DNS settings and add these records:

| Type | Name | Value | TTL |
|---|---|---|---|
| A | `@` | `95.217.183.200` | 300 |
| A | `www` | `95.217.183.200` | 300 |

DNS propagation takes between 5 minutes and 48 hours depending on the registrar. You can check propagation at [https://dnschecker.org](https://dnschecker.org).

Once DNS is pointing to your server, `http://cabinetdentaireivoire.com` should load the application.

---

## Step 10 — Enable HTTPS with Let's Encrypt (SSL)

HTTPS is strongly recommended — it protects your users' data (login credentials, patient info) and is required by modern browsers for some features.

### Install Certbot

```bash
apt install -y certbot python3-certbot-nginx
```

### Stop Nginx temporarily

Certbot needs port 80 free to verify your domain:

```bash
docker compose stop frontend
```

### Obtain the SSL certificate

```bash
certbot certonly --standalone -d cabinetdentaireivoire.com -d www.cabinetdentaireivoire.com
```

Certbot will ask for your email address and accept the terms of service. If successful, certificates are saved to:
```
/etc/letsencrypt/live/cabinetdentaireivoire.com/fullchain.pem
/etc/letsencrypt/live/cabinetdentaireivoire.com/privkey.pem
```

### Update nginx.conf to serve HTTPS

On your **local machine**, update `cdi/nginx.conf`:

```nginx
server {
    listen 80;
    server_name cabinetdentaireivoire.com www.cabinetdentaireivoire.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name cabinetdentaireivoire.com www.cabinetdentaireivoire.com;

    ssl_certificate     /etc/letsencrypt/live/cabinetdentaireivoire.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/cabinetdentaireivoire.com/privkey.pem;

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://backend:8090/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
    }
}
```

Also update `docker-compose.yml` to mount the certificates into the Nginx container and expose port 443:

```yaml
  frontend:
    build:
      context: ../cdi
      dockerfile: Dockerfile
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /etc/letsencrypt:/etc/letsencrypt:ro
    depends_on:
      - backend
    networks:
      - app-network
```

Push the changes to GitHub, pull on the server, and rebuild:

```bash
cd /opt/cdi/cdi && git pull
cd /opt/cdi/hospital && git pull
docker compose up -d --build frontend
```

### Auto-renew the certificate

Let's Encrypt certificates expire after 90 days. Set up a cron job to renew automatically:

```bash
crontab -e
```

Add this line:

```
0 3 * * * certbot renew --quiet && docker compose -f /opt/cdi/hospital/docker-compose.yml restart frontend
```

This checks for renewal every day at 3:00 AM and restarts Nginx if a new certificate was obtained.

---

## Routine Operations

### Deploying a code update

After pushing changes to GitHub:

```bash
cd /opt/cdi/hospital
git pull

cd /opt/cdi/cdi
git pull

cd /opt/cdi/hospital
docker compose up -d --build
```

Docker will only rebuild images that changed. Unchanged containers are not restarted.

### Stopping the application

```bash
cd /opt/cdi/hospital
docker compose down
```

This stops and removes containers but **keeps the database volume** — your data is safe.

### Stopping and deleting everything (including data)

```bash
docker compose down -v
```

> Warning: the `-v` flag deletes the PostgreSQL volume. All database data will be lost. Only use this if you want a completely fresh start.

### Viewing live logs

```bash
# All services
docker compose logs -f

# Backend only
docker compose logs -f backend

# Frontend only
docker compose logs -f frontend
```

Press `Ctrl+C` to stop following logs.

### Accessing the database directly

```bash
docker compose exec db psql -U cdi_user -d hospital
```

Replace `cdi_user` with the value of `DB_USERNAME` from your `.env` file.

### Restarting a single service

```bash
docker compose restart backend
docker compose restart frontend
docker compose restart db
```

---

## Troubleshooting

### The application is not loading

1. Check if containers are running: `docker compose ps`
2. Check for startup errors: `docker compose logs backend --tail=100`
3. Verify port 80 is open: `ufw status`

### "Connection refused" on port 80

- Nginx container may have failed to start. Check: `docker compose logs frontend`
- The `nginx.conf` file may have a syntax error. The log will show the exact line.

### Backend is running but API returns 500 errors

- Usually a database connection issue. Check: `docker compose logs backend | grep -i error`
- Verify the `.env` file values are correct, especially `DB_USERNAME` and `DB_PASSWORD`.
- Verify the database is healthy: `docker compose ps` — the `db` service should show `(healthy)`.

### "No space left on device" error during build

Docker build cache can accumulate. Clean unused images and containers:

```bash
docker system prune -af
```

Then retry the build.

### JWT errors / users can't log in

- The `JWT_SECRET` in `.env` must be consistent. If you change it, all existing tokens become invalid and users must log in again.
- Verify `JWT_EXPIRATION_MS` is set (e.g. `86400000` for 24 hours).

### Emails are not being sent

- Verify `MAIL_USERNAME` and `MAIL_PASSWORD` in `.env`.
- `MAIL_PASSWORD` must be a **Gmail App Password**, not your regular Gmail password.
- Generate an App Password: Google Account → Security → 2-Step Verification → App Passwords.
- Gmail must have 2-Step Verification enabled for App Passwords to work.

### SSL certificate renewal fails

```bash
certbot renew --dry-run
```

This simulates renewal without actually doing it. If it fails, the error message will explain why.

---

*Document generated for Cabinet Dentaire Ivoire deployment — April 2026*
