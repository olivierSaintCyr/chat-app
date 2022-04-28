import { JWTValidatorService } from '@app/auth/jwt-aws-validator';
import express from 'express';
import { Service } from 'typedi';

@Service()
export class AuthService {
    constructor(private jwtValidator: JWTValidatorService) {}

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
            if (authScheme !== 'Bearer') {
                return res.sendStatus(401);
            }

            try {
                const payload = await this.getUserId(token);
                res.locals.userId = payload.username;
                return next();
            } catch(e) {
                return res.sendStatus(401);
            }
        }
    }

    async getUserIdMock(token: string) {
        // TODO remove in prod
        switch (token) {
            case 'abc':
                return {username: '5b6962dd-3f90-4c93-8f61-eabfa4a803e2'};
            case 'def':
                return {username: '5b6962dd-3f90-4c93-8f61-eabfa4a803e1'};
            case 'ghi':
                return {username: '5b6962dd-3f90-4c93-8f61-eabfa4a803e0'};
            case 'jkl':
                return {username: '5b6962dd-3f90-4c93-8f61-eabfa4a803e3'};
            default:
                return undefined;
        }
    }

    async getUserId(token: string) {
        // TODO remove in prod
        const mockUserId = await this.getUserIdMock(token);
        if (mockUserId) {
            return mockUserId;
        }
        return await this.jwtValidator.validate(token);
    }
}
