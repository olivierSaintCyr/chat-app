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

    async removeFriend(userId: string, friendId: string) {
        await this.usersDB.removeFriendFromUser(userId, friendId);
    }

    async changeName(userId: string, newName: string) {
        await this.usersDB.changeName(userId, newName);
    }
}
