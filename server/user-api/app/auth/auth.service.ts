import express from 'express';
import { Service } from 'typedi';

@Service()
export class AuthService {
    get middleware() {
        return async (req: express.Request,
            res: express.Response,
            next: express.NextFunction
        ) => {
            const authHeader = req.header('Authorization');
            if (authHeader === undefined) {
                return res.sendStatus(401);
            }

            const [ authScheme, token ] = authHeader.split(' ');
            console.log('token', token);
            if (authScheme !== 'Bearer') {
                return res.sendStatus(401);
            }

            try {
                const userId = await this.getUserId(token);
                console.log('userId', userId);
                if (!userId) {
                    return res.sendStatus(401);
                }
                res.locals.userId = userId;
                return next();
            } catch(e) {
                return res.sendStatus(401);
            }
        }
    }

    async getUserId(token: string) {
        // TODO check with aws cognito jwt validator
        switch (token) {
            case 'abc':
                return '5b6962dd-3f90-4c93-8f61-eabfa4a803e2';
            case 'def':
                return '5b6962dd-3f90-4c93-8f61-eabfa4a803e1';
            case 'ghi':
                return '5b6962dd-3f90-4c93-8f61-eabfa4a803e0';
        }
    }
}
