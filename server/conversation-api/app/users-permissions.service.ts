import { ConversationsDBService } from '@app/db-services/conversations-db.service';
import { UsersDBService } from '@app/db-services/users-db.service';
import { Service } from 'typedi';

@Service()
export class UsersPermissionsService {
    constructor(
        private conversationsDB: ConversationsDBService,
        private userDB: UsersDBService,
    ) {}

    async hasPermissionToView(userId: string, conversationId: string) {
        return await this.isUserIn(userId, conversationId);
    }

    async hasPermissionToEdit(userId: string, conversationId: string) {
        return await this.isUserIn(userId, conversationId);
    }

    async hasPermissionToAddUsers(userId: string, userIdsToAdd: string[]) {
        const areFriends: boolean[] = [];
        await Promise.all(
            userIdsToAdd.map((potentialFriendId) => 
                this.userDB.isFriendOf(userId, potentialFriendId).then(
                    (isFriend) => areFriends.push(isFriend)
                )
            )
        );
        const allFriends = areFriends.findIndex((value) => !value) === -1;
        return allFriends;
    }

    private async isUserIn(userId: string, conversationId: string) {
        try {
            const users = await this.conversationsDB.getUsers(conversationId);
            const userInConvo = users.find((user) => user === userId) !== undefined;
            return userInConvo;
        } catch (e) {
            return false;
        }
    }
}
