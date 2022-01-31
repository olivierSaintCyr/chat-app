import { UsersService } from '@app/users.service';
import { isUuid } from '@app/utils';
import express from 'express';

export class UsersController {
    router = express.Router();
    constructor(private usersService: UsersService) {
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
                const user = await this.usersService.getUser(userId);
                return res.send(user);
            } catch (e) {
                console.error(e);
                return res.sendStatus(400);
            }
        });
    }
}
