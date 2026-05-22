# BookLeaf Support Portal Documentation

Welcome to the detailed documentation for the BookLeaf Support Portal. This folder contains a comprehensive breakdown of the application's architecture, data flow, and file contributions.

The application is built using a modern, decoupled tech stack:
- **Frontend**: React + Vite + TailwindCSS
- **Backend**: Python FastAPI + SQLAlchemy + SQLite
- **AI Integration**: Google Generative AI (Gemini)

## How the Application Works (High-Level Flow)

1. **Authentication**: Users log in. The backend issues a JWT token. The user's role (`admin` or `author`) dictates their experience.
2. **Author Journey**: Authors view their book portfolio and royalties. If they have an issue, they create a Support Ticket, optionally attaching a file.
3. **AI Triage**: The moment a ticket is created, the FastAPI backend spawns a background task. The AI instantly classifies the ticket's category (e.g., Royalty, Printing) and assigns a Priority (Critical to Low).
4. **Admin Queue**: Admins view a real-time, priority-sorted queue of tickets. They can filter, search, and assign tickets.
5. **AI Drafting**: If an admin needs help replying, they click "Generate AI Draft". The backend securely pulls BookLeaf's knowledge base and the specific author's data to generate a context-aware response, saving the ops team time.
6. **Communication**: Authors and admins converse in a real-time chat thread. The ticket moves through states (`Open` -> `In Progress` -> `Resolved`).

## Documentation Index

Please read the following documents for deep dives into specific areas of the codebase:

1. [Backend Flow & Architecture](./backend_flow.md): Details the FastAPI service layers, routing, and error handling.
2. [Frontend Flow & Architecture](./frontend_flow.md): Details the React component tree, state management, routing, and real-time polling.
3. [AI & Database Integration](./ai_and_database.md): Explains how the Gemini AI prompt engineering works, cost-saving strategies, and the database schema structure.
