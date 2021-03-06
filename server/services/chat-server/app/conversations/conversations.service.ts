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

    // TODO optimise
    async getPermission(userId: string, conversationId: string): Promise<boolean> {
        const isUserInConversation = await this.conversationsDBService.isUserInConversation(userId, conversationId);
        return isUserInConversation;
    }

    async updateLastMessage(message: Message, messageId: string) {
        await this.conversationsDBService.updateLastMessage(message, messageId);
    }
}
