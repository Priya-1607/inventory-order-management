# Inventory & Order Management System

A full-stack application for managing products, customers, orders, and inventory tracking.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React (JavaScript), Vite |
| Backend | Python, FastAPI |
| Database | PostgreSQL |
| Containerization | Docker, Docker Compose |

## Features

- **Product Management** — CRUD operations with unique SKU validation and stock tracking
- **Customer Management** — Create, view, and delete customers with unique email validation
- **Order Management** — Create orders with automatic stock reduction and total calculation
- **Dashboard** — Summary stats and low-stock alerts
- **Business Rules** — Inventory validation, non-negative stock, automatic order totals

## Quick Start (Docker)

### Prerequisites

- Docker and Docker Compose installed

### Run the Application

```bash
# Clone the repository
git clone <your-repo-url>
cd inventory-order-management

# Copy environment file
cp .env.example .env

# Start all services
docker compose up --build
```

Access the application:

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

### Stop Services

```bash
docker compose down
```

To remove database data:

```bash
docker compose down -v
```

## Local Development (Without Docker)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Update DATABASE_URL to point to your local PostgreSQL
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## API Endpoints

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/products` | Create product |
| GET | `/products` | List all products |
| GET | `/products/{id}` | Get product by ID |
| PUT | `/products/{id}` | Update product |
| DELETE | `/products/{id}` | Delete product |

### Customers
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/customers` | Create customer |
| GET | `/customers` | List all customers |
| GET | `/customers/{id}` | Get customer by ID |
| DELETE | `/customers/{id}` | Delete customer |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/orders` | Create order |
| GET | `/orders` | List all orders |
| GET | `/orders/{id}` | Get order by ID |
| DELETE | `/orders/{id}` | Cancel order (restores stock) |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard/summary` | Dashboard statistics |

## Deployment

### Backend (Render)

1. Push code to GitHub
2. Create a new **Web Service** on [Render](https://render.com)
3. Connect your repository and set root directory to `backend`
4. Use **Docker** as the environment
5. Add environment variables:
   - `DATABASE_URL` — Your PostgreSQL connection string (use Render PostgreSQL or external)
   - `CORS_ORIGINS` — Your frontend URL (e.g., `https://your-app.vercel.app`)
6. Deploy and note the backend URL

### Backend (Railway)

1. Create a new project on [Railway](https://railway.app)
2. Add PostgreSQL service
3. Add backend service from GitHub repo (root: `backend`)
4. Set `DATABASE_URL` from PostgreSQL service reference
5. Set `CORS_ORIGINS` to your frontend URL

### Frontend (Vercel)

1. Import repository on [Vercel](https://vercel.com)
2. Set root directory to `frontend`
3. Add environment variable:
   - `VITE_API_URL` — Your deployed backend URL
4. Deploy

### Frontend (Netlify)

1. Import repository on [Netlify](https://netlify.com)
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add environment variable `VITE_API_URL`

### Docker Hub (Backend Image)

```bash
# Build and tag
docker build -t your-dockerhub-username/inventory-backend:latest ./backend

# Login and push
docker login
docker push your-dockerhub-username/inventory-backend:latest
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `POSTGRES_USER` | Database user | `postgres` |
| `POSTGRES_PASSWORD` | Database password | `postgres` |
| `POSTGRES_DB` | Database name | `inventory_db` |
| `DATABASE_URL` | Full PostgreSQL connection URL | — |
| `CORS_ORIGINS` | Comma-separated allowed origins | `http://localhost:3000` |
| `VITE_API_URL` | Backend API URL for frontend | `http://localhost:8000` |

## Project Structure

```
inventory-order-management/
├── backend/
│   ├── app/
│   │   ├── models/       # SQLAlchemy models
│   │   ├── schemas/      # Pydantic schemas
│   │   ├── routes/       # API route handlers
│   │   ├── config.py
│   │   ├── database.py
│   │   └── main.py
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API client
│   │   └── context/      # State management
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md
```

## License

MIT
