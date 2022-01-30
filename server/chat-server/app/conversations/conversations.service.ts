import { ConversationsDBService } from '@app/db-services/conversations-db.service';
import { Message } from '@app/message.interface';
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

    async updateLastMessage(message: Message, messageId: string) {
        await this.conversationsDBService.updateLastMessage(message, messageId);
    }
}
