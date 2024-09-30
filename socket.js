import express from 'express';
import { Server } from 'socket.io';
import http from 'http';

export const app = express();

export const server = http.createServer(app);

export const io = new Server(server, {
    cors: {
        origin: ['http://localhost:3000'],
    },
});

const userIdMap = {};

export const getSocketId = (userId) => {
    return userIdMap[userId];
};

io.on('connect', (socket) => {
    console.log(`Client is connected to: ${socket.id}`);

    const userId = socket.handshake.query.userId;

    if (userId) {
        userIdMap[userId] = socket.id;
    }

    // Emit online users to all clients
    io.emit('getOnlineUsers', Object.keys(userIdMap));

    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);

        // Remove the userId from userIdMap
        for (const [key, value] of Object.entries(userIdMap)) {
            if (value === socket.id) {
                delete userIdMap[key];
                break;
            }
        }

        // Emit online users to all clients after a user disconnects
        io.emit('getOnlineUsers', Object.keys(userIdMap));
    });
});
