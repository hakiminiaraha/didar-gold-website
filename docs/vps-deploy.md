# Didar Gold VPS Deployment

This is the production path for a Linux VPS using Docker Compose, PostgreSQL,
and Nginx + Let's Encrypt.

## Required Inputs

- Server IP address
- Domain name and DNS panel access
- SSH user with sudo access
- Admin mobile number
- PayamSMS production credentials

## 1. DNS

Create these records in the domain DNS panel:

```text
A      @      SERVER_IP
A      www    SERVER_IP
```

Wait until:

```bash
dig +short didargold.com
dig +short www.didargold.com
```

returns the server IP.

## 2. Server Packages

Run on the VPS:

```bash
sudo apt update
sudo apt install -y git nginx certbot python3-certbot-nginx docker.io docker-compose-plugin
sudo systemctl enable --now docker nginx
sudo usermod -aG docker $USER
```

Log out and log in again after adding the user to the docker group.

## 3. Clone And Configure

```bash
sudo mkdir -p /var/www
sudo chown -R $USER:$USER /var/www
cd /var/www
git clone https://github.com/hakiminiaraha/didar-gold-website.git didar
cd didar
cp .env.production.example .env.production
```

Edit `.env.production` and set:

- `POSTGRES_PASSWORD`
- `AUTH_HASH_SECRET`
- `SESSION_SECRET`
- `ADMIN_MOBILES`
- all `PAYAMSMS_*` values
- `APP_ORIGINS=https://YOUR_DOMAIN,https://www.YOUR_DOMAIN`

Generate strong secrets:

```bash
openssl rand -base64 48
```

## 4. Build And Start

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
docker compose -f docker-compose.prod.yml --env-file .env.production ps
docker compose -f docker-compose.prod.yml --env-file .env.production logs -f app
```

Check locally on the server:

```bash
curl -I http://127.0.0.1:8787/
curl http://127.0.0.1:8787/api/health
```

## 5. Nginx And SSL

Copy the template:

```bash
sudo cp nginx/didar.conf.example /etc/nginx/sites-available/didar
sudo nano /etc/nginx/sites-available/didar
```

Replace `example.com` and `www.example.com` with the real domain.

Enable it:

```bash
sudo ln -s /etc/nginx/sites-available/didar /etc/nginx/sites-enabled/didar
sudo nginx -t
sudo systemctl reload nginx
```

Issue SSL:

```bash
sudo certbot --nginx -d YOUR_DOMAIN -d www.YOUR_DOMAIN
sudo nginx -t
sudo systemctl reload nginx
```

## 6. Production QA

From your local machine:

```bash
PRODUCTION_URL=https://YOUR_DOMAIN npm run audit:production
```

On the server:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production logs --tail=200 app
```

## 7. Update Deployment

```bash
cd /var/www/didar
git pull --ff-only origin main
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
docker compose -f docker-compose.prod.yml --env-file .env.production logs --tail=100 app
```
