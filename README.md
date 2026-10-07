# DailyFlow

A modern full-stack web application for personal daily activity and habit tracking.

## Tech Stack
- Frontend: React, Vite, Tailwind CSS, React Router, Recharts, Lucide React
- Backend: Node.js, Express.js, MongoDB, Mongoose, JWT

## Prerequisites

- Node.js installed
- MongoDB installed locally OR a MongoDB Atlas URI
- A Google Cloud Project for Google Authentication

## Setting up Google Authentication

To enable "Continue with Google", you need to set up OAuth 2.0 in the Google Cloud Console.

### 1. Create a Google Cloud Project
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Click on the project drop-down and select **New Project**.
3. Name your project (e.g., `DailyTrack-Auth`) and click **Create**.

### 2. Configure OAuth Consent Screen
1. In the sidebar, navigate to **APIs & Services > OAuth consent screen**.
2. Choose **External** (or Internal if you only want organization members) and click **Create**.
3. Fill in the required fields (App name, User support email, Developer contact email).
4. Save and continue. You do not need to add scopes for basic profile/email access.
5. Add yourself as a test user if the app is in "Testing" status.

### 3. Create OAuth Credentials
1. Go to **APIs & Services > Credentials**.
2. Click **Create Credentials > OAuth client ID**.
3. Select **Web application** as the Application type.
4. Name the client (e.g., `DailyTrack Web Client`).
5. Under **Authorized JavaScript origins**, add your frontend URL:
   - `http://localhost:5173` (for local development)
6. Under **Authorized redirect URIs**, you can leave it blank (or add `http://localhost:5173` if required, though `@react-oauth/google` uses popup flow).
7. Click **Create**.
8. Copy the **Client ID** and **Client Secret**.

## Local Development Setup

### 1. Backend Setup

Create a `.env` file in the `server/` directory:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/dailytrack
JWT_SECRET=your_jwt_secret_here
GOOGLE_CLIENT_ID=your_copied_client_id
GOOGLE_CLIENT_SECRET=your_copied_client_secret
```

Start the backend:
```bash
cd server
npm install
npm run dev
```

### 2. Frontend Setup

Create a `.env` file in the `client/` directory:

```env
VITE_GOOGLE_CLIENT_ID=your_copied_client_id
```

Start the frontend:
```bash
cd client
npm install
npm run dev
```

The application will be accessible at `http://localhost:5173`.
