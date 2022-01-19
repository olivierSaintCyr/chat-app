import express from 'express';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { SocketHandler } from './socket-handler';

const app = express();
const server = createServer(app); // TODO: change to https
const io = new SocketHandler(server);
io.handleSocket();

app.get('/', (req, res) => {
    res.send('Hello World!');
});

const PORT = 8080;
server.listen(PORT, () => console.log(`Chat server listenning on port: ${PORT}`))