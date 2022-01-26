import { Message } from '@app/message.interface';
import { MessagesDBService } from '@app/db-services/messages-db.service';
import { Service } from 'typedi';

export interface LastMessage {
    message: Message, // last message sent
    to: string[] // user_id[]
}

@Service()
export class MessagesService {
    private lastMessageListener: Array<(message: LastMessage) => void> = [];

    constructor(private messageDBService: MessagesDBService) {}

    receive(message: Message) {
        console.log('message received', message.content);
        // save to db
        // get user concerned by new message in conversation collection
        // notify user concerned
        this.messageDBService.addMessage(message);
        const to = [
            '5b6962dd-3f90-4c93-8f61-eabfa4a803e2',
            '5b6962dd-3f90-4c93-8f61-eabfa4a803e1'
        ];
        // update last message in convo
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
