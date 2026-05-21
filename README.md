# BookLeaf Author Support & Communication Portal

## Overview
This is a full-stack web application designed to help BookLeaf operations scale their author support. It features two portals (Author and Admin) with real-time polling and an AI Engine powered by OpenAI that auto-classifies tickets, assigns priority scores, and drafts context-aware responses based on BookLeaf policies.

## Setup Instructions

### 1. Backend Setup
1. Open a terminal and navigate to the `backend` folder.
2. Create a virtual environment: `python -m venv venv`
3. Activate it: `source venv/bin/activate`
4. Install dependencies: `pip install "fastapi[standard]" sqlalchemy bcrypt "python-jose[cryptography]" gemini`
5. Create a `.env` file in the `backend/` directory with your database URL (optional, defaults to SQLite) and gemini key:
   ```env
   DATABASE_URL="sqlite:///./bookleaf.db"
   gemini_api_key="sk-your-key-here"
   ```
6. Seed the database with the sample JSON: `python app/seed.py`
7. Run the server: `uvicorn app.main:app --reload` (Runs on port 8000)

### 2. Frontend Setup
1. Open a new terminal and navigate to the `frontend` folder.
2. Run `npm install`
3. Run `npm run dev` to start the Vite server.

## Test Credentials
The database has been seeded with data from `bookleaf_sample_data.json`.
- **Admin:** `admin@bookleaf.com` / `admin123`
- **Author (Priya):** `priya.sharma@email.com` / `password123`
- **Author (Rahul):** `rahul.verma@email.com` / `password123`
*(All seeded authors use `password123`)*

## API Documentation

| Method | Endpoint | Description | Role |
|---|---|---|---|
| POST | `/api/token` | Get JWT access token (login) | Public |
| GET | `/api/users/me` | Get current user profile | Authenticated |
| GET | `/api/books` | Get books (filtered for author, all for admin) | Authenticated |
| GET | `/api/tickets` | Get tickets (filtered for author, all for admin) | Authenticated |
| POST | `/api/tickets` | Create a new ticket (triggers AI classification) | Author |
| GET | `/api/tickets/{id}` | Get ticket details and full thread | Authenticated |
| PUT | `/api/tickets/{id}` | Update ticket status, internal notes, category, priority | Admin |
| POST | `/api/tickets/{id}/messages` | Add a reply to the ticket thread | Authenticated |
| POST | `/api/tickets/{id}/draft` | Trigger AI to draft a response based on KB | Admin |

## Architecture Write-Up

### Clean Abstractions & API Routing
- **Frontend:** React + Vite + TailwindCSS. We used Vite for rapid development. TailwindCSS is used for a premium, glassmorphism-inspired UI. We implemented a unified API client (`src/lib/api.ts`) using Axios interceptors to automatically attach the JWT token to all requests.
- **Backend:** Python FastAPI + SQLAlchemy. We unified routes (e.g., `/api/tickets` instead of separate author/admin prefixes). The backend uses role-based access control (RBAC) dependencies (`get_current_author`, `get_current_admin`) to ensure data privacy. If an Author tries to hit an admin route, it cleanly throws a 403 Forbidden JSON error. Input validation is strictly handled by FastAPI's Pydantic schemas.

### AI Prompt Engineering & Knowledge Base
The AI service (`ai_service.py`) uses `gemini-3-flash`. The prompt is injected with the exact BookLeaf Knowledge Base provided (80/20 splits, 45-day payouts, free reprints with photo proof). It enforces strict JSON outputs for classification (`Category` and `Priority`), utilizing rules like "wrong ISBN is High priority". For drafting, it uses strict instructions to "own the fault", provide specifics, and use an empathetic tone.

### Cost Management
To optimize OpenAI API costs, we split the AI logic into two steps:
1. **Classification (Low Cost):** When an author submits a ticket, a background task instantly runs a very small prompt to classify the category and priority so the ticket queue is organized.
2. **Drafting On-Demand (High Cost):** We do *not* generate drafts for all tickets upfront. Generating long-form drafts is token-heavy. Instead, the draft is only generated *on-demand* when an Admin explicitly clicks the "Generate AI Draft" button inside the Ticket Detail view. This saves significant API costs for tickets that might be closed without a reply or handled via internal notes.

### Graceful Degradation
All OpenAI calls are wrapped in `try/except` blocks. If the OpenAI API rate-limits us or goes down, the system does not crash.
- If classification fails, the ticket gracefully defaults to "General Inquiry" and "Medium" priority.
- If drafting fails, it returns a generic, polite fallback string: *"Thank you for reaching out to BookLeaf Publishing. We have received your query..."* so the admin still has a base to work from.
