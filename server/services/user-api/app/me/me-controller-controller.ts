import { FriendRequestsService } from '@app/friend-requests/friend-requests.service';
import { PROFILE_PICTURE_UPLOAD_DIR } from '@app/paths';
import { UsersService } from '@app/user/users.service';
import { isUuid } from '@app/utils';
import express from 'express';
import multer from 'multer';
import proxy from 'express-http-proxy';

export class MeController {
    router = express.Router();

    private readonly IMAGE_SERVER_URL = process.env.IMAGE_SERVER_HOST as string;

    private upload: multer.Multer = multer(
        {
            dest: PROFILE_PICTURE_UPLOAD_DIR,
        }
    );

    constructor(
        private usersService: UsersService,
        private friendReqService: FriendRequestsService
    ) {
        this.setRoutes();
    }

    private setRoutes() {
        this.router.get('/', async (req, res) => {
            // TODO get with auth
            const { userId } = res.locals;
            console.log('get', userId);
            if (userId === undefined) {
                return res.sendStatus(400);
            }

            if (!isUuid(userId)) {
                return res.sendStatus(400);
            }

            try {
                const user = await this.usersService.getPrivateUser(userId);
                return res.send(user);
            } catch (e) {
                return res.sendStatus(400);
            }
        });

        this.router.get('/friend-requests', async (req, res) => {
            // TODO get with auth
            const { userId } = res.locals;
            if (userId === undefined) {
                return res.sendStatus(400);
            }

            if (!isUuid(userId)) {
                return res.sendStatus(400);
            }

            try {
                const friendRequests = await this.friendReqService.getFriendRequests(userId);
                return res.send(friendRequests);
            } catch (e) {
                return res.sendStatus(400);
            }
        });

        this.router.get('/profile-picture', (req, res, next) => {
            const { userId } = res.locals;
            // used to gen the proxyReqPathResolver function with userId
            const proxyMiddleware = proxy(
                this.IMAGE_SERVER_URL, {
                proxyReqPathResolver: async () => {
                        const profilePicturePath = await this.usersService.getProfilePicture(userId);
                        return `/${profilePicturePath}`;
                    }
                }
            );
            proxyMiddleware(req, res, next);
        });

        this.router.delete('/friends', async (req, res) => {
            // TODO get with auth
            const { userId } = res.locals;
            const { friendId } = req.body;
            if (userId === undefined || friendId === undefined) {
                return res.sendStatus(400);
            }

            if (!isUuid(userId) || !isUuid(friendId)) {
                return res.sendStatus(400);
            }

            try {
                await this.usersService.removeFriend(userId, friendId);
                return res.sendStatus(200);
            } catch (e) {
                return res.sendStatus(400);
            }
        });

        this.router.post('/name', async (req, res) => {
            const { userId } = res.locals;
            const { newName } = req.body;
            console.log(userId, newName);
            if (newName === undefined || userId === undefined) {
                return res.sendStatus(400);
            }

            if (!isUuid(userId)) {
                return res.sendStatus(400);
            }

            try {
                await this.usersService.changeName(userId, newName);
                return res.sendStatus(200);
            } catch (e) {
                return res.sendStatus(400); 
            }
        });

        this.router.post('/profile-picture', this.upload.single('image'), async (req, res) => {
            const { file } = req;
            if (file === undefined) {
                return res.sendStatus(400);
            }
            const { userId } = res.locals;
            try {
                await this.usersService.updateProfilePicture(userId, file);
                return res.sendStatus(200);
            } catch (e) {
                return res.sendStatus(400);
            }
        })
    }
}
