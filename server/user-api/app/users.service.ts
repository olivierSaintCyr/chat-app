import { UsersDBService } from '@app/db-services/users-db.service';
import { Service } from 'typedi';

@Service()
export class UsersService {
    constructor(private usersDB: UsersDBService) {}

    async getPrivateUser(userId: string) {
        return await this.usersDB.getPrivateUser(userId);
    }

    async getPublicUser(userId: string) {
        return await this.usersDB.getPublicUser(userId);
    }

    async addFriend(userId: string, newFriendId: string) {
        await this.usersDB.addFriendToUser(userId, newFriendId);
    }
}