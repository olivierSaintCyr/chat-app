import { Service } from 'typedi';
import express from 'express';
import { UserDBService } from '@app/db-services/user-db.service';

@Service()
export class UsersAccessService {
    constructor(private userDB: UserDBService) {}

    get middleware() {
        return async (req: express.Request,
            res: express.Response,
            next: express.NextFunction
        ) => {
            const { userId } = res.locals;
            const userCreated = await this.isUserCreated(userId);
            // TODO put more explicit error message 400 not explicit enough
            if (!userCreated) {
                return res.sendStatus(400);
            }
            return next();
        }
    }

    async isUserCreated(userId: string) {
        return await this.userDB.isUserExist(userId);
    }
}