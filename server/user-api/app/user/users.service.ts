import { UsersDBService } from '@app/db-services/users-db.service';
import { BaseUser } from '@app/user/user.interface';
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
        const removePromise1 = this.usersDB.removeFriendFromUser(userId, friendId);
        const removePromise2 = this.usersDB.removeFriendFromUser(friendId, userId);
        await Promise.all([removePromise1, removePromise2])
    }

    async changeName(userId: string, newName: string) {
        await this.usersDB.changeName(userId, newName);
    }

    async createUser(baseUser: BaseUser) {
        await this.usersDB.createUser(baseUser);
    }

    async areTheyFriends(userId: string, friendId: string) {
        return await this.usersDB.isFriendOf(userId, friendId);
    }
}
