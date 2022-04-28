import 'module-alias/register';
import 'reflect-metadata';
import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { UsersService } from '@app/user/users.service';
import { UsersController } from '@app/user/users-controller';
import Container from 'typedi';
import { FriendRequestsService } from '@app/friend-requests/friend-requests.service';
import { MeController } from '@app/me/me-controller-controller';
import { AuthService } from '@app/auth/auth.service';
import { UsersAccessService } from '@app/user/users-access.service';
import { UserCreationController } from '@app/user/user-creation-controller';
import { NewUserFactory } from '@app/user/new-user-factory.service';

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());
app.use(cors());

app.get('/', (req, res) => {
    res.send('Hello World! welcome to user api');
});

const authService = Container.get(AuthService);
app.use(authService.middleware);

const usersService = Container.get(UsersService);
const newUserFactory = Container.get(NewUserFactory)
const userCreationController = new UserCreationController(usersService, newUserFactory);
app.use('/register', userCreationController.router);

const userAccessService = Container.get(UsersAccessService);
app.use(userAccessService.middleware);

const friendRequestService = Container.get(FriendRequestsService);

const usersController = new UsersController(usersService, friendRequestService);
app.use('/users', usersController.router);

const meController = new MeController(usersService, friendRequestService);
app.use('/me', meController.router);

const PORT = 8080;
app.listen(PORT, () => console.log(`Chat server listenning on port: ${PORT}`));
