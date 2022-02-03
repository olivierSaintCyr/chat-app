import 'module-alias/register';
import 'reflect-metadata';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { UsersService } from '@app/users.service';
import { UsersController } from '@app/users-controller';
import Container from 'typedi';
import { FriendRequestsService } from '@app/friend-requests.service';
import { MeController } from '@app/me-controller-controller';

dotenv.config({ path: path.join(__dirname, `./.env`)});

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());
app.use(cors());

app.get('/', (req, res) => {
    res.send('Hello World! welcome to user api');
});

const usersService = Container.get(UsersService);
const friendRequestService = Container.get(FriendRequestsService);

const usersController = new UsersController(usersService, friendRequestService);
app.use('/users', usersController.router);

const meController = new MeController(usersService, friendRequestService);
app.use('/me', meController.router);

const PORT = 8083;
app.listen(PORT, () => console.log(`Chat server listenning on port: ${PORT}`));