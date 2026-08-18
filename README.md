# 🚀 LinkSphere — Real‑Time AI Powered Chat Application

LinkSphere is a modern real‑time chat application with AI integration, file sharing, reactions, and room‑based communication. It enables users to create private chat rooms, communicate instantly, and interact with an AI assistant inside conversations.

---

# 📌 Features

## 👥 User Features
- User registration and login (JWT authentication)
- Create and join chat rooms
- Real‑time messaging using Socket.IO
- Send and receive messages instantly
- AI chat helper integration inside chat rooms
- File upload and sharing
- Emoji reactions on messages
- Typing indicators
- Date separators between messages
- Role‑based permissions (Admin / Member)
- Room expiry and extension system

---

## 🤖 AI Features
- Integrated with Google Gemini API
- AI responds inside chat rooms
- Context‑aware responses
- Clean plain text responses
- Question + Answer format
- AI messages stored in database

---

## 📂 File Sharing
- Upload files in chat rooms
- Download shared files
- Cloud storage support ready (Cloudinary compatible)
- Real‑time file message updates

---

## 😀 Reactions
- React to messages with emojis
- Real‑time reaction updates
- Reaction counts stored in database

---

## ⚡ Real‑Time Capabilities
Powered by Socket.IO:
- Instant message delivery
- AI responses in real time
- Typing indicators
- Reaction updates
- File message updates

---

# 🏗️ System Architecture

```
Frontend (React + Socket.IO)
        │
        ▼
Backend (Node.js + Express + Socket.IO)
        │
        ▼
Database (MongoDB)
        │
        ▼
AI Service (Google Gemini API)
```

---

# 🛠️ Tech Stack

## Frontend
- React.js
- Socket.IO Client
- Axios
- Tailwind CSS
- Framer Motion

## Backend
- Node.js
- Express.js
- Socket.IO
- MongoDB
- Mongoose
- JWT Authentication

## AI Integration
- Google Gemini API

## Storage
- MongoDB Atlas
- Cloudinary (optional)

---

# 📁 Project Structure

```
LinkSphere/
│
├── backend/
│   ├── config/
│   │   └── db.js
│   │
│   ├── controllers/
│   │   └── roomController.js
│   │
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── upload.js
│   │   └── checkRoomAdmin.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Room.js
│   │   └── Message.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── roomRoutes.js
│   │
│   ├── utils/
│   │   └── ai.js
│   │
│   └── server.js
│
├── frontend/
│   ├── pages/
│   │   └── Room.jsx
│   │
│   ├── components/
│   └── App.jsx
│
└── README.md
```

---

# ⚙️ Installation Guide

## 1. Clone Repository

```
git clone https://github.com/yourusername/linksphere.git
cd linksphere
```

---

## 2. Backend Setup

```
cd backend
npm install
```

Create `.env` file:

```
PORT=5001

MONGO_URI=your_mongodb_uri

JWT_SECRET=your_secret_key

GEMINI_API_KEY=your_gemini_api_key
```

Run backend:

```
npm run dev
```

---

## 3. Frontend Setup

```
cd frontend
npm install
npm run dev
```

---

# 🔐 Authentication Flow

```
User Login/Register
        │
        ▼
Server generates JWT
        │
        ▼
Client stores token
        │
        ▼
Token used for API + Socket authentication
```

---

# 💬 Messaging Flow

```
User sends message
      │
      ▼
Socket emits send_message
      │
      ▼
Server saves message to MongoDB
      │
      ▼
Server emits receive_message
      │
      ▼
All users receive message instantly
```

---

# 🤖 AI Flow

```
User asks AI question
      │
      ▼
Server receives ask_ai event
      │
      ▼
Server sends prompt to Gemini API
      │
      ▼
Gemini returns response
      │
      ▼
Server saves AI message
      │
      ▼
Server emits receive_message
```

---

# 🧠 Database Schema

## User
```
username
email
password
createdAt
```

## Room
```
name
roomId
members
expiryDate
createdAt
```

## Message
```
room
sender
content
fileUrl
reactions
isAI
createdAt
```

---

# 🔄 Socket Events

## Client → Server

```
join_room
send_message
ask_ai
typing
stop_typing
```

## Server → Client

```
receive_message
user_typing
user_stop_typing
message_updated
```

---

# 📡 API Endpoints

## Auth

```
POST /api/auth/register
POST /api/auth/login
GET /api/auth/me
```

## Rooms

```
POST /api/rooms/create
POST /api/rooms/join
GET /api/rooms/my-rooms
GET /api/rooms/:roomId/messages
DELETE /api/rooms/:roomId
```

## Messages

```
POST /api/rooms/:roomId/upload
POST /api/rooms/message/:messageId/react
```

---

# 🧩 Key Functional Modules

## 1. Real‑Time Messaging
Uses Socket.IO for instant message transfer.

## 2. AI Integration
Uses Gemini API for intelligent chat responses.

## 3. File Upload System
Supports file sharing inside chat rooms.

## 4. Reaction System
Users can react to messages.

## 5. Room Management
Admin can:
- delete room
- remove members
- extend expiry

---

# 🔒 Security Features

- JWT Authentication
- Protected routes
- Socket authentication
- Input validation
- Secure environment variables

---

# 🚀 Deployment

## Backend
- Render
- 
## Frontend
- Vercel

## Database
- MongoDB Atlas

## Files Storage
- Cloudinary

---

# 📈 Future Improvements

- Message editing
- Message deletion
- Voice messages
- Video chat
- Notifications
- AI memory per user
- Read receipts

---

## ⚡ Production Latency Guide (Vercel + Render)

After deploying the frontend to Vercel and the backend to Render, 1‑second first‑request latency is almost always caused by **Render's free tier sleeping the instance when idle** (plus cross‑region round‑trips). Fixes, in priority order:

1. **Keep the backend awake (biggest win).** Render free instances spin down after ~15 min without traffic; the next request pays a cold‑start tax (~1s+). Point a **free uptime monitor** at the new health endpoint every 5 minutes:
   - UptimeRobot → *New Monitor → HTTP(S)* → URL: `https://<your-backend>.onrender.com/api/health` → interval: 5 min.
   - Cron‑job.org / Better Stack works the same.
   - Or upgrade to Render's **Starter** plan and enable **Always‑On** (a few $/mo).

2. **Pick regions close to each other.** Vercel's default region is `us-east` (Washington DC) and Render free is `us-west` (Oregon) — every request pays ~80ms RTT. On Render's paid plans you can select a region (pick one nearest to your Mongo Atlas cluster). On Mongo Atlas, choose an **M0 region close to your Render instance** (e.g. AWS Oregon).

3. **What the code already does to help:**
   - `/api/health` — lightweight no‑DB endpoint for keep‑alive pings.
   - gzip compression on every API response.
   - User‑count endpoint cached 60s in‑memory (landing page no longer hits Mongo every visit).
   - Chat history limited to the 100 most‑recent messages, backed by a `{ room, createdAt }` compound index.
   - Mongo pool tuned (`maxPoolSize: 10`, fail‑fast `serverSelectionTimeoutMS: 5000`).
   - All email (Brevo) sends are fire‑and‑forget — they never block the API response.
   - WebSocket‑only socket transport (no polling fallback).

4. **Still expect a warm‑up hit after a real cold start** (deploy, or ~15+ min idle on free tier). That single request is unavoidable on free hosting; everything after a keep‑alive ping should feel instant.

---

# 👨‍💻 Author

Rohith Narayanan
Mounvik Karnati

---



# ⭐ Conclusion

LinkSphere is a full‑featured real‑time chat application combining:

- Real‑time communication
- AI assistance
- File sharing
- Modern UI
- Secure authentication
- Scalable architecture

Built using modern industry‑standard technologies.

---
