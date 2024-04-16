const { Server } = require("socket.io");
const express = require("express");
const { createServer } = require("http");
const router = require("./controllers/auth");
const cors = require('cors');
const pool = require('./db/connect');
const jwt = require('jsonwebtoken');

const app = express();
const httpServer = createServer(app);

const corsOptions = {
  origin: '*', // Allow only this origin to access
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use('/api', router);

const io = new Server(httpServer, {
	cors: {
		origin: "*",
	}
});

const onlineUsers = new Set();

io.on("connection", (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('sendMessage', (message) => {
    io.emit('receiveMessage', message);
  });

  socket.on('online', (username) => {
    // Broadcast this user's online status
    onlineUsers.add(username);
    console.log('on' + onlineUsers);
    io.emit('user_online', [...onlineUsers]);
  });

  socket.on('disconnect', () => {
      onlineUsers.delete(socket.handshake.query.username)
      console.log('dis' + onlineUsers);
      console.log(socket.handshake.query.username)
      io.emit('user_offline', [...onlineUsers]);  // Ensure 'socket.username' is set when they connect
  });
});

httpServer.listen(4000);
