import { CassandraDBClient } from '@app/db-services/cassandra-db-client.service';
import { Message } from '@app/message.interface';
import { Service } from 'typedi';

@Service()
export class MessagesDBService {

    constructor(private cassandraDBClient: CassandraDBClient) {}
    get client() {
        return this.cassandraDBClient.client;
    }

    addMessage(message: Message) {
        const query = this.createNewMessageQuery(message);
        this.client.execute(query).then((res) => console.log(res));
    }

    getMessage(messageId: string) {

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
