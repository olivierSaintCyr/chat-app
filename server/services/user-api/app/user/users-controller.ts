import { FriendRequestsService } from '@app/friend-requests/friend-requests.service';
import { UsersService } from '@app/user/users.service';
import { isUuid } from '@app/utils';
import express from 'express';
import proxy from 'express-http-proxy';

export class UsersController {
    router = express.Router();

    private readonly IMAGE_SERVER_URL = process.env.IMAGE_SERVER_HOST as string;

    constructor(
        private usersService: UsersService,
        private friendReqService: FriendRequestsService
    ) {
        this.setRoutes();
    }

    private setRoutes() {
        this.router.get('/:userId', async (req, res) => {
            const { userId } = req.params;
            if (userId === undefined) {
                return res.sendStatus(400);
            }

            if (!isUuid(userId)) {
                return res.sendStatus(400);
            }

            try {
                // TODO turn it into public user for privacy purposes Get private only
                // if the userId is the searched id
                const user = await this.usersService.getPublicUser(userId);
                return res.send(user);
            } catch (e) {
                console.error(e);
                return res.sendStatus(400);
            }
        });

        this.router.post('/:friendId/friend-request', async (req, res) => {
            // TODO cant if already friends
            const { friendId: friendToAdd } = req.params;
            const { userId } = res.locals;
            console.log(friendToAdd);
            if (userId === friendToAdd) {
                return res.sendStatus(400);
            }

            if (userId === undefined || friendToAdd === undefined) {
                return res.sendStatus(400);
            }

            if (!isUuid(userId) || !isUuid(friendToAdd)) {
                return res.sendStatus(400);
            }

            try {
                await this.friendReqService.send(userId, friendToAdd);
                return res.sendStatus(200);
            } catch (e) {
                return res.sendStatus(400);
            }
        });

        this.router.get('/:friendId/friend-request', async (req, res) => {
            const { friendId: friendToAdd }= req.params;
            const { userId } = res.locals;
            if (userId === friendToAdd) {
                return res.sendStatus(400);
            }

            if (userId === undefined || friendToAdd === undefined) {
                return res.sendStatus(400);
            }

            if (!isUuid(userId) || !isUuid(friendToAdd)) {
                return res.sendStatus(400);
            }

            try {
                const isAlreadySent = await this.friendReqService.isAlreadySent(userId, friendToAdd);
                return res.send({ isAlreadySent });
            } catch (e) {
                return res.sendStatus(400);
            }
        });

        this.router.get('/:userId/profile-picture', proxy(this.IMAGE_SERVER_URL, {
                    proxyReqPathResolver: async (req) => {
                        const { userId } = req.params;
                        const profilePicturePath = await this.usersService.getProfilePicture(userId);
                        return `/${profilePicturePath}`;
                    }
                }
            )
        );

        // cancel 
        this.router.delete('/:userId/friend-request', async (req, res) => {
            const friendToAdd = req.params.userId;
            // TODO to get with auth
            const { userId } = res.locals;
            if (userId === friendToAdd) {
                return res.sendStatus(400);
            }

            if (userId === undefined || friendToAdd === undefined) {
                return res.sendStatus(400);
            }

            try {
                await this.friendReqService.cancel(userId, friendToAdd);
                return res.sendStatus(200);
            } catch (e) {
                return res.sendStatus(400);
            }
        });
    }
}
