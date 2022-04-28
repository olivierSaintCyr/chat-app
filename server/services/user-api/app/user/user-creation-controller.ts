
import { NewUserFactory } from '@app/user/new-user-factory.service';
import { UsersService } from '@app/user/users.service';
import express from 'express';

export class UserCreationController {
    router = express.Router();
    constructor(
        private usersService: UsersService,
        private newUserFactory: NewUserFactory,
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

            const newUser = this.newUserFactory.createNewUser(userId, name);
            try {
                await this.usersService.createUser(newUser);
                return res.sendStatus(200);
            } catch (e) {
                return res.sendStatus(400);
            }
        });
    }
}