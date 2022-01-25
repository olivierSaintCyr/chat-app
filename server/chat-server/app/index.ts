import 'module-alias/register';
import 'reflect-metadata';
import { MessagesService } from '@app/messages/messages.service';
import express from 'express';
import { createServer } from 'http';
import { SocketHandler } from './socket-handler';
import Container from 'typedi';



const app = express();
const server = createServer(app); // TODO: change to https
const messagesService = Container.get(MessagesService);
const io = new SocketHandler(server, messagesService);
io.handleSocket();

app.get('/', (req, res) => {
    res.send('Hello World!');
});

const PORT = 8080;
server.listen(PORT, () => console.log(`Chat server listenning on port: ${PORT}`))