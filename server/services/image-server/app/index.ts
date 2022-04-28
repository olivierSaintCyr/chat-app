import 'module-alias/register';
import 'reflect-metadata';
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { Container } from 'typedi';
import { ProfilePictureService } from '@app/image-services/profile-picture.service';
import { ProfilePictureController } from '@app/image-services/profile-picture-controller';

const app = express();
app.use(express.json({ limit: '300mb' }));
app.use(express.urlencoded({ extended: true, limit: '300mb' }));
app.use(cookieParser());
app.use(cors());

app.get('/', (req, res) => {
    res.send('Hello World! Welcome to image api');
});

// const authService = Container.get(AuthService);
// app.use(authService.middleware);

// const userAccessService = Container.get(UsersAccessService);
// app.use(userAccessService.middleware);

const profilePictureService = Container.get(ProfilePictureService);
const profilePictureController = new ProfilePictureController(profilePictureService);
app.use('/profile-pictures', profilePictureController.router);

const PORT = 8080;
app.listen(PORT, () => console.log(`Image server is listenning on port: ${PORT}`));