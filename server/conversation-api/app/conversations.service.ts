import { ActiveConversation, ConversationRow } from '@app/conversation.interface';
import { ConversationsDBService } from '@app/db-services/conversations-db.service';
import { MessageDBService } from '@app/db-services/messages-db.service';
import { UsersDBService } from '@app/db-services/users-db.service';
import { Message } from '@app/message.interface';
import { Service } from 'typedi';

const DEFAULT_ICON = 'default_conversation_icon';

@Service()
export class ConversationsService {
    constructor(
        private conversationDB: ConversationsDBService,
        private userDB: UsersDBService,
        private messageDB: MessageDBService
    ) {}

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
    // TODO maybe do a micro service with this kind of an expensive task to complete
    async getLastActiveConversations(userId: string) {
        const conversationsIds = await this.userDB.getConversations(userId);
        const conversationRows = await Promise.all(conversationsIds.map(
            async (conversationId) => this.conversationDB.getConversation(conversationId)
        ));
        // TODO maybe client might sort his conversations maybe remove lastMessage date from db
        conversationRows.sort((a, b) => a.lastMessageDate.getTime() - b.lastMessageDate.getTime());
        
        const activeConversations = await Promise.all(conversationRows.map((conversationRow) =>
            this.conversationRowToActiveConversation(conversationRow)
        ));
        return activeConversations;
    }
    // maybe remove conversation id from lastMessage
    private async conversationRowToActiveConversation(conversationRow: ConversationRow) {
        const lastMessage = await this.getLastMessage(conversationRow);
        const activeConversation: ActiveConversation = {
            title: conversationRow.title,
            users: conversationRow.users,
            icon: conversationRow.icon,
            id: conversationRow.id.toString(),
            lastMessage,
        };
        return activeConversation;
    }

    private async getLastMessage(conversationRow: ConversationRow): Promise<null | Message> {
        const messageId = conversationRow.lastMessageId;
        if (conversationRow.lastMessageId === null) {
            return null;
        }
        const sentDate = new Date(conversationRow.lastMessageDate);
        const messageQueryParams = {
            id: messageId.toString(),
            conversationId: conversationRow.id.toString(),
            sentDate
        };
        return await this.messageDB.getMessage(messageQueryParams)
    }
}