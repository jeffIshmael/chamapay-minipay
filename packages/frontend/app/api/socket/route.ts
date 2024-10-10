// app/api/socket/route.ts

import { NextResponse } from 'next/server';
import { Server } from 'socket.io';

export const GET = (request: Request) => {
  // Ensure the socket server is initialized only once
  if (!(global as any).io) {
    console.log('Initializing Socket.io server...');

    const io = new Server({
      path: '/api/socket', // Define the path for Socket.IO
      addTrailingSlash: false,
      cors: {
        origin: '*', // Adjust this in production for security
      },
    });

    // Attach the Socket.IO server to the global object to prevent re-initialization
    (global as any).io = io;

    io.on('connection', (socket) => {
      console.log('A user connected');

      socket.on('chat message', (msg) => {
        console.log('Message:', msg);
        io.emit('chat message', msg); // Broadcast to all connected clients
      });

      socket.on('disconnect', () => {
        console.log('User disconnected');
      });
    });

    // Attach Socket.IO to the Next.js server
    // This is specific to Next.js's custom server handling
    // Ensure that the server's upgrade event is handled
    const server = (request as any).socket.server;
    io.attach(server);
  } else {
    console.log('Socket.io server already running');
  }

  return new NextResponse('Socket.IO server initialized');
};
