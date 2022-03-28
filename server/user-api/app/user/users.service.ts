import { UsersDBService } from '@app/db-services/users-db.service';
import { ProfilePictureService } from '@app/me/profile-picture.service';
import { BaseUser } from '@app/user/user.interface';
import { Service } from 'typedi';
import fs from 'fs';

@Service()
export class UsersService {
    constructor(
        private usersDB: UsersDBService,
        private profilePicService: ProfilePictureService,
    ) {}

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

    async updateProfilePicture(userId: string, file: Express.Multer.File) {
        const filePath = file.path;
        const profilePicturePath = await this.profilePicService.updatePictureFile(file);
        if (!profilePicturePath) {
            this.removeTempFile(filePath);
            return null;
        }
        await this.usersDB.updateProfilePicture(userId, profilePicturePath);
        this.removeTempFile(filePath);
        return profilePicturePath;
    }

    private removeTempFile(filePath: string) {
       fs.unlinkSync(filePath);
    }
}
