# Docker Setup Guide for PetPal

## 📋 Prerequisites
- Docker Desktop installed ([Download here](https://www.docker.com/products/docker-desktop))
- Docker Compose (comes with Docker Desktop)

## 🚀 Quick Start

### 1. Configure Environment Variables
Edit `.env.docker` and add your Stripe keys:
```bash
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_PUBLIC_KEY=pk_test_your_public_key
```

### 2. Build and Run All Services
```bash
# From project root directory
docker-compose up -d --build
```

This will start:
- **PostgreSQL** database on `localhost:5432`
- **PgAdmin** on `http://localhost:5050` (admin@petpal.com / admin)
- **Backend API** on `http://localhost:8080`
- **Frontend** on `http://localhost:3000`

### 3. Access Your Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **Database Admin**: http://localhost:5050

## 📝 Common Commands

### Start services (background)
```bash
docker-compose up -d
```

### Stop services
```bash
docker-compose down
```

### View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Rebuild images (after code changes)
```bash
docker-compose up -d --build
```

### Remove everything (containers, volumes, images)
```bash
docker-compose down -v
```

## 🔧 Frontend Configuration

The frontend automatically connects to the backend API at:
```
http://backend:8080/api
```

This is set in the `VITE_API_BASE_URL` environment variable in `docker-compose.yml`.

Update [frontend/src/core/api/axiosInstance.js](frontend/src/core/api/axiosInstance.js) to use this variable if needed.

## ✅ Database Setup

- **Database**: petpal
- **User**: petpal_user
- **Password**: petpal_password
- **Host**: postgres (within Docker network)
- **Port**: 5432

Hibernate will automatically create/update tables on startup.

## 🐛 Troubleshooting

### Backend fails to connect to database
```bash
# Check postgres is healthy
docker-compose ps

# View backend logs
docker-compose logs backend
```

### Frontend can't reach API
- Check that backend is running: `docker-compose ps`
- Verify backend logs: `docker-compose logs backend`
- Frontend should use `http://backend:8080` (not localhost) inside Docker

### Port already in use
Change ports in `docker-compose.yml`:
```yaml
ports:
  - "3001:3000"  # Frontend
  - "8081:8080"  # Backend
  - "5433:5432"  # Database
```

### Clean rebuild
```bash
docker-compose down -v
docker-compose up -d --build
```

## 📦 Production Deployment

For production, you should:
1. Use separate `.env.production` file
2. Set strong passwords
3. Configure proper SSL/TLS certificates
4. Use production-grade database backup strategies
5. Configure proper logging and monitoring

