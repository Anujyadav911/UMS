# Premium User Management System (UMS)

A production-grade, full-stack MERN application that manages user accounts with robust Role-Based Access Control (RBAC), secure authentication, and a stunning glassmorphism design.

## Features Built
- **Authentication:** JWT-based access and refresh tokens, secure `httpOnly` cookie handling, bcrypt password hashing.
- **Roles & Permissions:** Admin, Manager, and User roles with strictly enforced capabilities on both API and UI layers.
- **Premium UI:** Custom dark-themed cyber aesthetic with glass panel effects, modern typography (Outfit), and smooth animations.
- **User Management Lifecycle:** Create, Read, Update, Soft-Delete functionality with active/inactive statuses and audit trails (Created By, Updated By).
- **Security First:** Express Rate Limiting, Helmet headers, CORS restrictions, Mongo injection prevention via Mongoose ORM, and comprehensive payload validation.

## Tech Stack
- **Frontend:** React (Vite), React Router v6, Axios, Lucide Icons, plain CSS with custom design tokens.
- **Backend:** Node.js, Express, Mongoose (MongoDB), JSONWebToken.

## Getting Started

### 1. Database Setup
You will need a MongoDB instance running locally on `localhost:27017` or a MongoDB Atlas URI.
To seed the initial admin account (`admin@ums.com` / `password123`):
```bash
cd server
npm run test # wait we did not add a script for this
node src/utils/seeder.js
```

### 2. Run the Backend
```bash
cd server
npm install
npm run dev
```

### 3. Run the Frontend
```bash
cd client
npm install
npm run dev
```

### 4. Default Credentials
- **Admin:** admin@ums.com / password123

## Deployment Architecture

For deployment as per requirements:
1. **Frontend (Vercel / Netlify)**
   - Connect GitHub repository
   - Build command: `npm run build`
   - Output directory: `dist`
   - Add Environment Variable: `VITE_API_URL` pointing to backend deployed URL.

2. **Backend (Render / Railway)**
   - Connect GitHub repository
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Add Environment Variables: `MONGO_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `CLIENT_URL` (Frontend URL).
