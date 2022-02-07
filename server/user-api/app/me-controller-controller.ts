import { FriendRequestsService } from '@app/friend-requests.service';
import { BaseUser } from '@app/user.interface';
import { UsersService } from '@app/users.service';
import { isUuid } from '@app/utils';
import express from 'express';

export class MeController {
    router = express.Router();
    constructor(
        private usersService: UsersService,
        private friendReqService: FriendRequestsService
    ) {
        this.setRoutes();
    }

    private setRoutes() {
        this.router.get('/', async (req, res) => {
            // TODO get with auth
            const userId = req.body.userId;
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

        this.router.post('/', async (req, res) => {
            // TODO get userId from auth middle ware
            const { name, userId } = req.body;
            console.log(name, userId);
            if (name === undefined) {
                return res.sendStatus(400);
            }
            // TODO verify imageUrl
            const newUser: BaseUser = {
                id: userId,
                name,
                imageUrl: 'default_profile_img'
            }
            try {
                await this.usersService.createUser(newUser);
                return res.sendStatus(200);
            } catch (e) {
                return res.sendStatus(400);
            }
        });

        this.router.get('/friend-requests', async (req, res) => {
            // TODO get with auth
            const userId = req.body.userId;
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

        this.router.delete('/friends', async (req, res) => {
            // TODO get with auth
            const userId = req.body.myUserId;
            const friendId = req.body.userId;
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
            const {userId, newName } = req.body;
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
                console.error(e);
                return res.sendStatus(400); 
            }
        });
    }
}
