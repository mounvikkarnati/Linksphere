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
