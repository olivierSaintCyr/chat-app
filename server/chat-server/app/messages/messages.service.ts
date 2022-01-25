import { Message } from '@app/message.interface';
import { MessagesDBService } from '@app/messages/messages-db.service';
import { Service } from 'typedi';

export interface LastMessage {
    message: Message, // last message sent
    to: string[] // user_id[]
}

@Service()
export class MessagesService {
    private lastMessageListener: Array<(message: LastMessage) => void> = [];

    constructor(messageDBService: MessagesDBService) {}

    receive(message: Message) {
        // save to db
        // get user concerned by new message in conversation collection
        // notify user concerned 
        const to = ['abcdef', 'ghijklm'];
        const lastMessage = { message, to };
        this.emitLastMessage(lastMessage);
    }

    subscribe(onNewMessage: (message: LastMessage) => void) {
        this.lastMessageListener.push(onNewMessage);
    }

    private emitLastMessage(lastMessage: LastMessage) {
        this.lastMessageListener.forEach((onNewMessage) => {
            onNewMessage(lastMessage);
        });
    }
}
