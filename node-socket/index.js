
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// Store uploaded images for each room
const roomImages = {};

// Handle API route to receive an image
io.of('/api').on('connection', (socket) => {
  console.log('User connected');

  // Handle joining a room
  socket.on('joinRoom', (roomName) => {
    socket.join(roomName);
    console.log(`User joined room: ${roomName}`);

    // Emit the stored images for the joined room, if any
    if (roomImages[roomName]) {
      roomImages[roomName].forEach((image) => {
        socket.emit('image', image);
      });
    }
  });

  // Handle leaving a room
  socket.on('leaveRoom', (roomName) => {
    socket.leave(roomName);
    console.log(`User left room: ${roomName}`);
  });

  // Handle image upload
  socket.on('uploadImage', ({ room, image }, callback) => {
    // Store the image for the room
    if (!roomImages[room]) {
      roomImages[room] = [];
    }
    roomImages[room].push(image);

    // Broadcast the image to all connected clients in the specified room
    io.of('/api').to(room).emit('image', image);

    callback('Image uploaded successfully');
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Start the server
const port = process.env.PORT || 3000;
http.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
