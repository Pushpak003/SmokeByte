# File COnversion API with Queue and cloud Storage

## Overview

This project is a scalable backend API which allowa users to convert images,documents,audio,video files.
This backend  uses **Node.js, Express, Sequelize ORM, BullMQ queue system** and **Supabase cloud storage** 

---

## Features

-User authentication(JWT with access and refresh tokens)
-File upload with size and MIME type validation
-Background file conversion queue using **BullMQ + Redis**
-Imagae conversion (Sharp), document conversion (LibreOffice), media conversion(Ffmpeg) 
-Converted files will be stored on Supabase storage
-Rate limitng for security
-Local temp folder for file processing cleanup
-API modular and scalable folder structure

---

## Folder Structure

public/uploads/ # Temporary uploaded & converted files

## Project Structure
Project standard Node.js MVC pattern follow karta hai:
- `controllers/` → Route handlers
- `services/` → Conversion & storage logic
- `jobs/` → Queue system (BullMQ)
- `models/` → Sequelize models
- `middlewares/` → Auth, validation
- `routes/` → API route files
- `utils/` → Helper utilities
- `config/` → DB, ffmpeg, supabase config
- `temp/` → Temporary file storage
- `public/uploads/` → Local storage for uploads

app.js   → Express app setup

server.js  →  Server entry point.

.env  →  Environment variables.

---

## Setup

1. **Clone the repo:**
   ```bash
   git clone <repo_url>
   cd <repo_folder>
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Setup .env file with variables**
   ```env
   PORT=3000
   DATABASE_URL=postgres://username:password@localhost:5432/dbname
   JWT_SECRET=your_jwt_secret
   JWT_REFRESH_SECRET=your_jwt_refresh_secret
   REDIS_URL=redis://localhost:6379
   SUPABASE_URL=https://your-supabase-url.supabase.co
   SUPABASE_ANON_KEY=your-supabase-anon-key
   ```
4. **Start Redis server locally (if not already running)6:**
   ```bash
   redis-server
   ```
5. **Run migrations & seed database if needed (using Sequelize CLI or custom scripts).**
6. **Start the queue worker in a separate terminal:**
   ```bash
   node src/jobs/worker.js
   ```
7. **Start the backend server:**
   ```bash
   npm start
   ```
# API Endpoints (examples)

POST /api/auth/register – User registration

POST /api/auth/login – User login

POST /api/conversion/image – Upload & convert image (adds job to queue)

GET /api/user/history – Get user conversion history (requires auth)

# Usage 

Upload file & specify target format to conversion routes.

Conversion job is queued and processed asynchronously.

Converted files are stored in Supabase and accessible via URLs.

Users can fetch their conversion history via protected routes.




   
          
