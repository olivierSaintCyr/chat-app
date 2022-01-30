import { Message } from '@app/message.interface';
import { MessagesDBService } from '@app/db-services/messages-db.service';
import { Service } from 'typedi';
import { ConversationsService } from '@app/conversations/conversations.service';

export interface LastMessage {
    message: Message, // last message sent
    to: string[] // user_id[]
}

@Service()
export class MessagesService {
    private lastMessageListener: Array<(message: LastMessage) => void> = [];

    constructor(
        private messageDBService: MessagesDBService,
        private conversationService: ConversationsService
    ) {}

    async receive(message: Message) {
        const messageId  = await this.messageDBService.addMessage(message);
        this.conversationService.updateLastMessage(message, messageId);
        const to = await this.conversationService.getUsers(message.conversation);
        // TODO update last message in convo
        const lastMessage = { message, to };
        this.emitLastMessage(lastMessage);
    }

    subscribe(onNewMessage: (message: LastMessage) => void) {
        this.lastMessageListener.push(onNewMessage);
    }

    async getLastMessages(conversationId: string) {
        return await this.messageDBService.getLastestMessages(conversationId);
    }

    private emitLastMessage(lastMessage: LastMessage) {
        this.lastMessageListener.forEach((onNewMessage) => {
            onNewMessage(lastMessage);
        });
    }
}
