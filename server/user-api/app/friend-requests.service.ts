import { FriendRequestsDB } from '@app/db-services/friend-requests-db.service';
import { UsersService } from '@app/users.service';
import { Service } from 'typedi';

@Service()
export class FriendRequestsService {
    constructor(
        private friendReqDB: FriendRequestsDB,
        private userService: UsersService
    ) {}

    async send(from: string, to: string) {
        const alreadyReceived = await this.friendReqDB.isAlreadySent(to, from);
        if (alreadyReceived) {
            await this.addFriend(from, to);
            return;
        }
        await this.friendReqDB.insert(from, to);
    }

    async cancel(from: string, to: string) {
        await this.friendReqDB.delete(from, to);
    }

    async remove(userId: string, friendId: string) {
        await this.userService.removeFriend(userId, friendId);
    }

    async isAlreadySent(from: string, to: string) {
        return await this.friendReqDB.isAlreadySent(from, to);
    }

    private async addFriend(from: string, to: string) {
        this.userService.addFriend(from, to);
        this.userService.addFriend(to, from);
        // delete old request
        this.friendReqDB.delete(to, from);
    }
}
