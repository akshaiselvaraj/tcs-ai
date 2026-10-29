# CanteenIQ — AI-Powered Canteen Menu Mix Optimization

[![TCS Hackathon 2026](https://img.shields.io/badge/TCS_Hackathon-2026-005691.svg)]()
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg)]()
[![React](https://img.shields.io/badge/React-19-61DAFB.svg)]()
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg)]()
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791.svg)]()

CanteenIQ is an intelligent, data-driven canteen decision-support system that predicts food demand, optimizes menu mix and preparation portion quantities, and recommends practical 7-day weekly menus.

---

## 🚀 Key Capabilities

1. **Item-Level Demand Forecasting:** LightGBM & Random Forest regressors with chronological holdout validation and SHAP explainability.
2. **Intelligent Menu Mix Optimization:** Mixed-Integer Linear Programming (PuLP / CBC solver) balancing profit, waste minimization, budget caps, kitchen capacity, and dietary diversity.
3. **7-Day Weekly Menu Planner:** Automated, repetition-penalized scheduling across Breakfast, Lunch, and Dinner with full administrative review, overrides, and CSV export.
4. **Food Waste & Profitability Analytics:** Deep breakdown of preparation vs. sales vs. waste, margin analysis, and simulated waste reduction metrics.

---

## 🛠️ Architecture & Tech Stack

- **Backend:** Python, FastAPI, SQLAlchemy 2.0 (ORM), Pydantic v2, Uvicorn.
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Lucide React, React Router.
- **Database:** Pure PostgreSQL (Supabase / local PostgreSQL via `DATABASE_URL`).
- **Optimization:** PuLP (CBC Mixed-Integer Linear Programming).
- **ML / Data Science:** LightGBM, Scikit-learn, Pandas, NumPy, SHAP, Joblib.

---

## 📂 Repository Structure

```
├── backend/
│   ├── app/
│   │   ├── api/v1/controllers/   # REST API Controllers (Health, MenuItems, etc.)
│   │   ├── core/                 # Config (Pydantic Settings), Logging
│   │   ├── db/                   # PostgreSQL Session & Base Mixins
│   │   ├── models/               # SQLAlchemy ORM Models (35 dataset dimensions)
│   │   ├── repositories/         # Data Access Layer
│   │   ├── schemas/              # Pydantic DTOs
│   │   ├── services/             # Business Logic Layer
│   │   └── main.py               # FastAPI App Entrypoint
│   ├── tests/                    # Pytest Suite
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/layout/    # Sidebar, TopBar, AppLayout
│   │   ├── controllers/          # View Controllers (Hooks)
│   │   ├── models/               # TypeScript Domain Interfaces
│   │   ├── routes/               # Centralized Router
│   │   ├── services/             # Axios API Client
│   │   └── views/                # 10 SaaS Pages
│   ├── package.json
│   └── tailwind.config.js
├── data/                         # datasets.csv ingestion target
└── README.md
```

---

## ⚡ Quickstart Guide

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Configure your PostgreSQL DATABASE_URL in .env
uvicorn app.main:app --reload --port 8000
```
Backend API docs available at: `http://localhost:8000/docs`

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend UI running at: `http://localhost:5173`