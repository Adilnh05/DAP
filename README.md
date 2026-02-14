# DAP (Data Anonymization Platform)

DAP is a web-based Data Anonymization Platform that allows users to upload CSV datasets, detect sensitive columns (PII), apply anonymization transformations, compute re-identification risk, and generate a downloadable privacy report.

## Tech Stack

- Frontend: React (Vite) + TypeScript
- Backend: FastAPI + SQLAlchemy
- Database: PostgreSQL
- Storage: Local filesystem (CSV uploads, anonymized outputs, reports)

## Prerequisites

Install the following:

* Git
* Python 3.10+ (recommended 3.11)
* Node.js 18+
* Docker Desktop (recommended for PostgreSQL)
* PostgreSQL (optional if not using Docker)

## Environment Setup

DAP uses a single `.env` file in the repository root.

1. Copy the example environment file:

```bash
cp .env.example .env
```

2. Update `.env` if needed:

```env
DATABASE_URL=postgresql+psycopg://dap:dap@localhost:5432/dap
STORAGE_PATH=storage
BACKEND_PORT=8000
FRONTEND_PORT=5173
ENV=dev
```

## Database Setup (Docker Recommended)

1. Start PostgreSQL:

```bash
cd infra
docker compose up -d
```

2. Verify the container is running:

```bash
docker ps
```

PostgreSQL will be available on:

* Host: localhost
* Port: 5432
* User: dap
* Password: dap
* Database: dap

To stop the database:

```bash
cd infra
docker compose down
```

## Backend Setup (FastAPI)

1. Create and activate a virtual environment.

Windows:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
```

Mac/Linux:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Run the backend:

```bash
uvicorn main:app --reload --port 8000
```

4. Verify backend health:

* [http://localhost:8000/health](http://localhost:8000/health)

5. Swagger API docs:

* [http://localhost:8000/docs](http://localhost:8000/docs)

## Frontend Setup (React)

1. Install dependencies:

```bash
cd frontend
npm install
```

2. Run the frontend:

```bash
npm run dev
```

3. Open the app:

* [http://localhost:5173](http://localhost:5173)

## Running the Full System

Open two terminals.

Terminal 1 (backend):

```bash
cd backend
# activate venv
uvicorn main:app --reload --port 8000
```

Terminal 2 (frontend):

```bash
cd frontend
npm run dev
```

Database (if using Docker):

```bash
cd infra
docker compose up -d
```

## Storage

DAP stores files in the `storage/` directory at the repository root.

This includes:

* uploaded CSV files
* anonymized output CSVs
* generated PDF reports

Do not commit `storage/` to Git.

## Development Notes

* Backend reads `.env` from the repository root.
* Backend routes are mounted under `/api`.
* The backend is designed to run synchronously for MVP (no background queue).
* CSV is the only supported dataset format for the MVP.

## Core Features (MVP)

* Upload CSV dataset
* Schema inference and preview
* PII detection (email, phone, DOB, ID, name, address)
* Anonymization actions:

  * MASK
  * HASH
  * GENERALIZE
  * DROP
  * NONE
* Risk scoring dashboard:

  * risk score (0–100)
  * risk level (LOW/MEDIUM/HIGH)
  * uniqueness estimate
  * k-anonymity estimate
* Attacker View Mode:

  * re-identification warnings
  * risky column combinations
* PDF report export

## Contribution Workflow

* Create a feature branch for each issue:
  * feature/<short-name>
* Keep commits small and readable
* Do not directly push to main
