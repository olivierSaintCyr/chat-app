import { JWTValidatorService } from '@app/auth/jwt-aws-validator';
import { Socket } from 'socket.io';
import { ExtendedError } from 'socket.io/dist/namespace';
import { Service } from 'typedi';

@Service()
export class AuthService {
    constructor(private tokenValidator: JWTValidatorService) {}

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

    async getUserPayload(token: string) {
        // TODO remove in prod
        const mockUserId = await this.getUserIdMock(token);
        if (mockUserId) {
            return mockUserId;
        }
        return await this.tokenValidator.validate(token);
    }

    get socketMiddleware() {
        return async (
            socket: Socket,
            next: (err?: ExtendedError | undefined) => void
        ) => {
            const authHeader = socket.handshake.headers.auth as string;
            if (authHeader === undefined) {
                const error: ExtendedError = {
                    name: 'Bad request',
                    message: 'Missing auth token',
                };
                next(error);
                return;
            }

            const [ authScheme, token ] = authHeader.split(' ');
            if (authScheme !== 'Bearer') {
                const error: ExtendedError = {
                    name: 'Unauthorized',
                    message: 'Wrong Auth Scheme'
                };
                next(error);
                return;
            }

            try {
                const payload = await this.getUserPayload(token);
                const userId = payload.username;
                socket.data.userId = userId;
                next();
            } catch (e) {
                const error: ExtendedError = {
                    name: 'Unauthorized',
                    message: 'Expired Auth Token',
                };
                next(error);
            }
        }
    }
}
