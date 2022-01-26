import { CassandraDBClient } from '@app/db-services/cassandra-db-client.service';
import { Message, MessageType } from '@app/message.interface';
import { Service } from 'typedi';

@Service()
export class MessagesDBService {

    constructor(private cassandraDBClient: CassandraDBClient) {}
    private get client() {
        return this.cassandraDBClient.client;
    }

    addMessage(message: Message) {
        const query = this.createNewMessageQuery(message);
        this.client.execute(query).then((res) => console.log(res));
    }

    async getMessage(messageId: string): Promise<Message> {
        const query = `SELECT author, content, conversation, date 
            FROM chat_data.message 
            WHERE id = ${messageId};`;
        const result = await this.client.execute(query);
        if (result.rows.length === 0) {
            throw Error(`No message found with id: ${messageId}`);
        }
        const messageRow = result.rows[0];
        const message: Message = {
            conversation: messageRow.conversation,
            author: messageRow.author,
            content: messageRow.content,
            type: MessageType.Text, // TODO change for image suport 
            date: messageRow.date
        };
        return message;
    }

    private createNewMessageQuery(message: Message) {
        const query = `INSERT INTO chat_data.message (id, conversation, author, content, sent_date) VALUES (
            uuid(),
            ${message.conversation},
            ${message.author},
            '${message.content}',
            ${message.date.getTime()}
        )`;
        return query;
    }
}
