import { ConversationsDBService } from '@app/db-services/conversations-db.service';
import { Service } from 'typedi';

@Service()
export class ConversationsService {
    constructor(private conversationsDBService: ConversationsDBService) {}
    async getUsers(conversationId: string): Promise<string[]> {
        const users = await this.conversationsDBService.getUsersInConversation(conversationId);
        return users;
    }

    async getPermission(userId: string, conversationId: string): Promise<boolean> {
        const users = await this.conversationsDBService.getUsersInConversation(conversationId);
        for (const user of users) {
            if (user === userId) {
                return true;
            }
        }
        return false;
    }
}
