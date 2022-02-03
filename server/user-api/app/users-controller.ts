import { FriendRequestsService } from '@app/friend-requests.service';
import { UsersService } from '@app/users.service';
import { isUuid } from '@app/utils';
import express from 'express';

export class UsersController {
    router = express.Router();
    constructor(
        private usersService: UsersService,
        private friendReqService: FriendRequestsService
    ) {
        this.setRoutes();
    }

    private setRoutes() {
        this.router.get('/:userId', async (req, res) => {

            const userId = req.params.userId;
            if (userId === undefined) {
                return res.sendStatus(400);
            }

            if (!isUuid(userId)) {
                return res.sendStatus(400);
            }

            try {
                // TODO turn it into public user for privacy purposes Get private only
                // if the userId is the searched id
                const user = await this.usersService.getPrivateUser(userId);
                return res.send(user);
            } catch (e) {
                console.error(e);
                return res.sendStatus(400);
            }
        });

        this.router.post('/:userId/friend-request', async (req, res) => {
            // TODO cant if already friends
            const friendToAdd = req.params.userId;
            // TODO to get with auth
            const userId = req.body.userId;
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
                this.friendReqService.send(userId, friendToAdd);
                return res.sendStatus(200);
            } catch (e) {
                return res.sendStatus(401);
            }
        });

        this.router.get('/:userId/friend-request', async (req, res) => {
            const friendToAdd = req.params.userId;
            // TODO to get with auth
            const userId = req.body.userId;
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
                return res.sendStatus(401);
            }
        });

        // cancel 
        this.router.delete('/:userId/friend-request', async (req, res) => {
            const friendToAdd = req.params.userId;
            // TODO to get with auth
            const userId = req.body.userId;
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
        })
        // TODO MAYBE DO A ME ROUTER TO GET INCOMING REQUEST AND DELETE FRIEND
    }
}
