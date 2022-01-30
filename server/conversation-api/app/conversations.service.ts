import { ConversationsDBService } from '@app/db-services/conversations-db.service';
import { UsersDBService } from '@app/db-services/users-db.service';
import { Service } from 'typedi';

const DEFAULT_ICON = 'default_conversation_icon';

@Service()
export class ConversationsService {
    constructor(
        private conversationDB: ConversationsDBService,
        private userDB: UsersDBService) {}
    async create(users: string[], title: string) {
        const params = {
            title,
            users,
            icon: DEFAULT_ICON,
        };
        const conversationId = await this.conversationDB.create(params);
        users.forEach((userId) => {
            this.userDB.addConversation(userId, conversationId);
        });
    }

    async delete(conversationId: string) {
        // TODO give this only to admin or a democratic vote system
        const users = await this.conversationDB.getUsers(conversationId);
        users.forEach((userId) => {
            this.userDB.removeConversation(userId, conversationId);
        });
        await this.conversationDB.delete(conversationId);
    }

    async addUser(userId: string, conversationId: string) {
        this.conversationDB.addUser(userId, conversationId);
        this.userDB.addConversation(userId, conversationId);
    }

    async removeUser(userId: string, conversationId: string) {
        // TODO only user that are in the conversation can kick the person
        await this.conversationDB.removeUser(userId, conversationId);
        await this.userDB.removeConversation(userId, conversationId);
    }

    async getUsers(conversationId: string) {
        const users = await this.conversationDB.getUsers(conversationId);
        return users;
    }

    async getConversations(userId: string) {
        return this.userDB.getConversations(userId);
    }

    async changeTitle(title: string, conversationId: string) {
        await this.conversationDB.updateTitle(title, conversationId);
    }
}