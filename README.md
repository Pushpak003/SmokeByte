# SmokeByte – File Conversion API

[![Node.js](https://img.shields.io/badge/Node.js-v18.17.1-green)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-4.x-blue)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15.5-blue)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7.2-orange)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-latest-blue?logo=docker)](https://www.docker.com/)
[![Supabase](https://img.shields.io/badge/Supabase-1.0-green)](https://supabase.com/)

SmokeByte is a **robust file conversion API** built with Node.js and Express.  
It supports **document, image, and audio/video conversions**, provides a **job queue**, and secure access with **JWT tokens**.  

---

## Features

- ✅ Multiple file conversions  
  - Documents: Word ↔ PDF, TXT; PowerPoint → PDF; PDF → Images  
  - Images: JPEG ↔ PNG, PDF; PNG → JPEG, PDF  
  - Audio/Video: Format conversions via FFmpeg  
- ✅ Queue-based processing (Bull + Redis)  
- ✅ Temporary storage (`temp/`) for uploads and `public/uploads/` for converted files  
- ✅ Supabase integration for permanent file storage  
- ✅ Access + Refresh token authentication  
  - Access token: 15 min  
  - Refresh token: 7 days  
- ✅ Job ID system to track and access converted files  
- ✅ Dockerized for easy deployment  

---

## Folder Structure
```
public
└── uploads # Temporary storage for converted files
```
```
src
├── config # DB, FFmpeg, Supabase configs
├── controllers # Route controllers
├── jobs # Queue and worker logic
├── middlewares # Auth, upload, rate limiter
├── models # Database models
├── routes # API routes
├── services # Conversion & storage logic
├── temp # Pre-conversion temp storage
├── utils # File utils, JWT, logging
├── app.js # Route assembly
└── server.js # Entry point
```


---

## Workflow Diagram

```mermaid
flowchart TD
    A[User Uploads File] --> B[Saved to temp/ Folder]
    B --> C[Job Added to Queue]
    C --> D[Worker Processes Conversion]
    D --> E[Upload to Supabase Bucket]
    D --> F[Delete temp File]
    D --> G[Save Conversion Log in DB]
    H[User Requests File with Job ID + Access Token] --> I[Fetch File from Supabase]



```

## Environment variables
```
PORT=3000

DATABASE_URL=postgres://postgres:password@host.docker.internal:5432/SmokeByte

JWT_SECRET=<ACCESS_SECRET>
JWT_REFRESH_SECRET=<REFRESH_SECRET>

REDIS_HOST=redis
REDIS_PORT=6379
UID=1000

SUPABASE_URL=<SUPABASE_URL>
SUPABASE_KEY=<SUPABASE_KEY>
SUPABASE_SERVICE_ROLE_KEY=<SUPABASE_SERVICE_ROLE_KEY>
SUPABASE_BUCKET=convert-files
```

## Getting Started 

 ### Install Dependencies
 ```
  npm install
 ```
 ### Run Docker
 ```
  docker-compose up -d
 ```
 ### Start Server
 ```
  npm start
 ```

## API Workflow

1.Upload File → Returns Job ID

2.Job Processing → Queue handles conversion, upload, and cleanup

3.Retrieve Converted File → Use Job ID + Access Token

## Example Endpoints
```
| Method | Endpoint              | Description                |
| ------ | --------------------- | -------------------------- |
| POST   | `/auth/register`      | Register user              |
| POST   | `/auth/login`         | Login user                 |
| GET    | `/user/history`       | Get user history           |
| GET    | `/user/me`            | User profile               |
| POST   | `/convert/image`      | Convert image files        |
| POST   | `/convert/document`   | Convert document files     |
| POST   | `/convert/media`      | Convert media files        |
| GET    | `/status/:jobId`      | Get File Status            |
| GET    | `/download`           | Download files             |
| POST   | `/refersh-token`      | Generate refresh token     |
| POST   | `/logout`             | Logout user                |

```
## Tech Stack
```
• Backend: Node.js, Express.js
• Database: PostgreSQL
• Queue: Bull (Redis)
• Storage: Supabase
• Media Conversion: FFmpeg
• Document Conversion: LibreOffice
• Authentication: JWT (Access + Refresh tokens)
• Dockerized for easy deployment
```


