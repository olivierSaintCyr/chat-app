
import { BaseUser } from '@app/user/user.interface';
import { UsersService } from '@app/user/users.service';
import express from 'express';

export class UserCreationController {
    router = express.Router();
    constructor(
        private usersService: UsersService
    ) {
        this.setRoutes();
    }

    private setRoutes() {
        this.router.post('/', async (req, res) => {
            // TODO get userId from auth middle ware
            const { userId } = res.locals;
            const { name } = req.body;
            console.log(name, userId);
            if (name === undefined) {
                return res.sendStatus(400);
            }
            // TODO verify imageUrl
            const newUser: BaseUser = {
                id: userId,
                name,
                imageUrl: 'default_profile_img'
            };
            try {
                await this.usersService.createUser(newUser);
                return res.sendStatus(200);
            } catch (e) {
                return res.sendStatus(400);
            }
        });
    }
}