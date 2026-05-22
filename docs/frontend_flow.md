# Frontend Flow & Architecture

The frontend of the BookLeaf Support Portal is a Single Page Application (SPA) built with **React**, **Vite** (for fast bundling), and **TailwindCSS** (for styling).

## Directory Structure & File Contribution

The frontend code lives inside `/frontend/src/`.

### 1. `main.tsx` & `App.tsx`
**Purpose**: Bootstrapping and Routing.
- **How it works**: `main.tsx` mounts the React application to the DOM. `App.tsx` uses `react-router-dom` to define the application's routes. It sets up conditional rendering so that users are directed to the correct portal (e.g., `/author/*` vs `/admin/*`) based on their role.

### 2. `lib/api.ts`
**Purpose**: Centralized API Configuration.
- **How it works**: We use `axios` to make HTTP requests to the backend. This file creates a customized `axios` instance (`api`) that automatically intercepts every outgoing request and attaches the JWT token from `localStorage` to the `Authorization` header. It also intercepts responses—if the backend returns a 401 Unauthorized, it automatically logs the user out by triggering a custom event.

### 3. `hooks/` Directory
**Purpose**: Reusable State Management (Custom Hooks).
- **`useTickets.ts`**: Contains `useTickets` and `useTicket` hooks. These encapsulate the data fetching logic for the ticket queue and individual tickets, providing `tickets`, `loading`, and `refetch` states to the components.
- **`useBooks.ts`**: Similar to above, but for fetching the author's book portfolio.

### 4. `types/index.ts`
**Purpose**: TypeScript Type Definitions.
- **How it works**: Defines TypeScript interfaces (`User`, `Book`, `Ticket`, `TicketMessage`) that exactly mirror the backend Pydantic schemas. This ensures that the frontend code is strongly typed, preventing runtime errors (e.g., trying to access `ticket.book_id` when it's spelled differently).

### 5. `components/` Directory
**Purpose**: Reusable UI Elements.
- **`Layout.tsx`**: The main shell of the application. It renders the persistent sidebar navigation and handles the logout functionality. It dynamically adjusts its navigation links based on whether a `role="admin"` or `role="author"` prop is passed.
- **`tickets/ChatThread.tsx`**: A crucial component that renders the conversation history of a ticket. It automatically handles scrolling to the bottom when a new message arrives and differentiates visually between Admin (Support) messages and Author messages.
- **`tickets/ReplyBox.tsx`**: The input area for adding a new message to a ticket thread.

### 6. `pages/` Directory
**Purpose**: Route-level View Components.
- **`Login.tsx`**: Handles user authentication, saves the resulting JWT token, and redirects based on role.
- **`author/`**:
  - **`Dashboard.tsx`**: Displays the author's book portfolio and royalty metrics.
  - **`Tickets.tsx`**: Shows the author's ticket history. Implements real-time polling to display unread message badges.
  - **`NewTicket.tsx`**: A form for submitting new support requests, including file attachments (converting them to `FormData` for the backend).
  - **`TicketDetail.tsx`**: The view for a specific ticket, combining `ChatThread` and `ReplyBox`.
- **`admin/`**:
  - **`Dashboard.tsx`**: The main queue for the ops team. It includes complex filtering (by status, category, priority, custom date range) and a real-time polling loop that triggers "toast" notifications when new tickets or replies arrive.
  - **`TicketDetail.tsx`**: The most complex page. It allows admins to update the ticket status, edit internal notes, generate an AI draft response, assign the ticket, and reply to the author.

## Real-Time Polling & Data Flow

We implemented a simulated real-time experience using HTTP polling rather than WebSockets (for simplicity and ease of deployment).

1. **The Polling Loop**: In pages like `AdminDashboard`, an effect uses `setInterval` to fetch the `/api/tickets` endpoint every 5 seconds.
2. **Diffing State**: When new data arrives, the frontend compares it to a `useRef` holding the previous state (`prevTicketsRef`).
3. **Notification Triggers**: If a new ticket exists, or if an existing ticket has a new message count (and the sender was *not* an admin), the frontend triggers a floating toast notification ("New Reply on Ticket #X") and increments the unread badge count.
4. **Local Storage Tracking**: To track "read" vs "unread", the frontend saves a timestamp to `localStorage` (e.g., `ticket_read_123 = "2023-10...Z"`) whenever a user clicks into a ticket detail page. The badge count on the dashboard is calculated by counting how many messages have a `created_at` date newer than that local timestamp.
