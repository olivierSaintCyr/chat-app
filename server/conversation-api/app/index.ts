import 'module-alias/register';
import 'reflect-metadata';
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { Container } from 'typedi';
import { ConversationsService } from '@app/conversations.service';
import { ConversationsController } from '@app/conversations-controller';
import { UsersPermissionsService } from '@app/users-permissions.service';
import { AuthService } from '@app/auth/auth.service';
import { UsersAccessService } from '@app/users/users-access.service';
import { UsersService } from '@app/users/users.service';

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());
app.use(cors());

const conversationsService = Container.get(ConversationsService);
const usersPermissionsService = Container.get(UsersPermissionsService);
const usersService = Container.get(UsersService);
const conversationsController = new ConversationsController(
    conversationsService,
    usersPermissionsService,
    usersService
);

app.get('/', (req, res) => {
    res.send('Hello World! welcome to user api');
});
const authService = Container.get(AuthService);
app.use(authService.middleware);

const userAccessService = Container.get(UsersAccessService);
app.use(userAccessService.middleware);

app.use('/conversations', conversationsController.router);

const PORT = 8082;
app.listen(PORT, () => console.log(`Conversation api is listenning on port: ${PORT}`));