import { UserDBService } from '@app/db-services/user-db.service';
import { Socket } from 'socket.io';
import { ExtendedError } from 'socket.io/dist/namespace';
import { Service } from 'typedi';

@Service()
export class UserAccessService {
    constructor(private userDB: UserDBService) {}

    async getConnectionRights(userId: string) {
        const userExists = await this.userDB.hasUser(userId);
        return userExists;
    }

    get socketMiddleware() {
        return async (
            socket: Socket,
            next: (err?: ExtendedError | undefined) => void
        ) => {
            const { userId } = socket.data;
            const hasConnectionRights = await this.getConnectionRights(userId);
            if (!hasConnectionRights) {
                const error: ExtendedError = {
                    name: 'No user created',
                    message: 'Please register a username with our User api to start using the chat service'
                }
                next(error);
                return;
            }
            next();
        }
    }
}
