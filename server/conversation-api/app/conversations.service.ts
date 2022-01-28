import { ConversationsDBService } from '@app/db-services/conversations-db.service';
import { Service } from 'typedi';

const DEFAULT_ICON = 'default_conversation_icon';

@Service()
export class ConversationsService {
    constructor(private conversationDB: ConversationsDBService) {}
    async create(users: string[], title: string) {
        const params = {
            title,
            users,
            icon: DEFAULT_ICON,
        };
        this.conversationDB.create(params);
    }

    async delete(conversationId: string) {
        // TODO give this only to admin or a democratic vote system
        await this.conversationDB.delete(conversationId);
    }

    async addUser(userId: string, conversationId: string) {
        await this.conversationDB.addUser(userId, conversationId);
    }

    async removeUser(userId: string, conversationId: string) {
        this.conversationDB.removeUser(userId, conversationId);
        // TODO only user that are in the conversation can kick the person
    }

    async getUsers(conversationId: string) {
        const users = await this.conversationDB.getUsers(conversationId);
        return users;
    }
}