import { Message } from '@app/message.interface';

export interface Conversation extends ConversationCreationParams {
    id: string;
}

export interface ConversationCreationParams {
    title: string;
    users: string[]; // user_id[]
    icon: string; // image url
}

export interface ConversationRow extends Conversation {
    lastMessageDate: Date;
    lastMessageId: string | null;
}

export interface ActiveConversation extends Conversation {
    lastMessage: Message | null;
}
