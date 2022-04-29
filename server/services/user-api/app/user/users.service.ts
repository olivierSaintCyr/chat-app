import { UsersDBService } from '@app/db-services/users-db.service';
import { ProfilePictureService } from '@app/me/profile-picture.service';
import { NewUser } from '@app/user/user.interface';
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

    async getProfilePicture(userId: string) {
        return await this.usersDB.getProfilePicture(userId);
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

    async createUser(newUser: NewUser) {
        await this.usersDB.createUser(newUser);
    }

    async areTheyFriends(userId: string, friendId: string) {
        return await this.usersDB.isFriendOf(userId, friendId);
    }

    async updateProfilePicture(userId: string, file: Express.Multer.File) {
        const filePath = file.path;
        const profilePictureId = await this.profilePicService.updatePictureFile(file);
        if (profilePictureId) {
            await this.usersDB.updateProfilePicture(userId, profilePictureId);
        }
        this.removeTempFile(filePath);
        return profilePictureId;
    }

    private removeTempFile(filePath: string) {
       fs.unlinkSync(filePath);
    }
}
