import { ConversationsDBService } from '@app/db-services/conversations-db.service';
import { Service } from 'typedi';

@Service()
export class UsersPermissionsService {
    constructor(
        private conversationsDB: ConversationsDBService
    ) {}

    async hasPermissionToView(userId: string, conversationId: string) {
        return await this.isUserIn(userId, conversationId);
    }

    async hasPermissionToEdit(userId: string, conversationId: string) {
        return await this.isUserIn(userId, conversationId);
    }

    private async isUserIn(userId: string, conversationId: string) {
        try {
            const users = await this.conversationsDB.getUsers(conversationId);
            console.log(users);
            console.log(users.find((user) => user === userId));
            const userInConvo = users.find((user) => user === userId) !== undefined;
            return userInConvo;
        } catch (e) {
            return false;
        }
    }
}
