# **Real-Time Chat Application**

A real-time chat application built with **WebSocket + Express + MongoDB + React + Vite + Tailwind.**

### **_Tech Stack_**

**Backend:** Node.js, Express + express-ws, MongoDB + Mongoose, WebSocket, TypeScript, Nodemon

**Frontend:** React, Vite, Tailwind CSS, TypeScript

### **_Features_**

_* Authentication_

1. Login by username
2. User must exist in the database (seed-users)

_* Channels_

1. Create new channels
2. View channel list
3. Channel owner role
4. Subscribe to channels
5. Channel message history
6. Automatic entry into General channel on login

_* Messages_

1. Real-time messaging
2. Broadcasts messages to all connected participants
3. Stored in MongoDB
4. Timestamp display

_* Channel Participants_

1. View list of active participants
2. Automatic updates when users join/leave
3. Channel owner can remove users
4. Visual indicators: owner / you

_* Global User Search_

1. Search users by username
2. See whether a user is already in the current channel

### **_Installation & Setup_**

1. Clone the repository
`   git clone <repo-url>`
2. Install dependencies in backend
`   cd api`
`   npm install`
3. Configure MongoDB default configuration is inside config.ts. Make sure MongoDB is running.
`   mongodb://localhost/real-chat`
4. Start the server
`   npm run dev`
Server will run at:
`http://localhost:8000`
5. Install dependencies in frontend
`   cd frontend-chat`
`   npm install`
6. Start frontend
`   npm run dev`
Frontend will be available at:
`http://localhost:5173`