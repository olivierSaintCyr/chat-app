import 'module-alias/register';
import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { Container } from 'typedi';
import path from 'path';
import dotenv from 'dotenv';
import { AuthService } from '@app/auth/auth.service';
import { UsersAccessService } from '@app/users/users-access.service';
import { spawn } from 'child_process';
import { upload } from 'multer';

dotenv.config({ path: path.join(__dirname, `./.env`)});

spawn('mkdir', ['-p', 'data/images']);

const app = express();
app.use(express.json({ limit: '300mb' }));
app.use(express.urlencoded({ extended: true, limit: '300mb' }));
app.use(cookieParser());
app.use(cors());



app.get('/', (req, res) => {
    res.send('Hello World! welcome to user api');
});
const authService = Container.get(AuthService);
app.use(authService.middleware);

const userAccessService = Container.get(UsersAccessService);
app.use(userAccessService.middleware);

const PORT = 8084;
app.listen(PORT, () => console.log(`Conversation api is listenning on port: ${PORT}`));