import 'module-alias/register';
import 'reflect-metadata';
import dotenv from 'dotenv';
import { MessagesService } from '@app/messages/messages.service';
import express from 'express';
import { createServer } from 'http';
import { SocketHandler } from './socket-handler';
import Container from 'typedi';
import path from 'path';
import { ConversationsService } from '@app/conversations/conversations.service';
import { AuthService } from '@app/auth/auth.service';

dotenv.config({ path: path.join(__dirname, `./.env`)});

const app = express();
const server = createServer(app); // TODO: change to https
const messagesService = Container.get(MessagesService);
const conversationsService = Container.get(ConversationsService)
const authService = Container.get(AuthService);
const io = new SocketHandler(server, messagesService, conversationsService, authService);
io.handleSocket();

app.get('/', (req, res) => {
    res.send('Hello World!');
});

const PORT = 8080;
server.listen(PORT, () => console.log(`Chat server listenning on port: ${PORT}`));