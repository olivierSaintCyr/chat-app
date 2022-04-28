import { CassandraDBClient } from '@app/db-services/cassandra-db-client.service';
import { Message, MessageType } from '@app/message.interface';
import { Service } from 'typedi';
import * as cassandra from 'cassandra-driver';

export const MAX_MESSAGES_PER_QUERY = 20;
@Service()
export class MessagesDBService {

    constructor(private cassandraDBClient: CassandraDBClient) {}
    private get client() {
        return this.cassandraDBClient.client;
    }

    addMessage(message: Message) {
        const uuid = cassandra.types.Uuid.random();
        const query = `INSERT INTO message (id, conversation, author, content, sent_date) VALUES (
            ${uuid},
            ${message.conversation},
            ${message.author},
            '${message.content}',
            ${message.date.getTime()}
        )`;
        this.client.execute(query);
        return uuid.toString();
    }

    async getLastestMessages(conversationId: string) {
        const query = `SELECT author, content, sent_date
            FROM message
            WHERE conversation = ${conversationId}
            ORDER BY sent_date DESC
            LIMIT ${MAX_MESSAGES_PER_QUERY};
        `;
        return await this.getMessagesWithQuery(query);
    }

    async getLastestMessagesFrom(conversationId: string, date: Date) {
        const query = `SELECT author, content, sent_date
            FROM message
            WHERE conversation = ${conversationId}
            AND sent_date < ${date.getTime()}
            ORDER BY sent_date DESC
            LIMIT ${MAX_MESSAGES_PER_QUERY};
        `;
        return await this.getMessagesWithQuery(query);
    }

    async getMessage(messageId: string): Promise<Message> {
        const query = `SELECT author, content, conversation, date 
            FROM message 
            WHERE id = ${messageId};`;
        const messages = await this.getMessagesWithQuery(query);
        if (messages.length === 0) {
            throw Error(`No message with id: ${messageId}`);
        }
        return messages[0];
    }

    private async getMessagesWithQuery(query: string) {
        const result = await this.client.execute(query);
        if (result.rows.length === 0) {
            return [] as Message[];
        }
        const messages: Message[] = result.rows.map((row) => {
            const message: Message = {
                author: row.author,
                conversation: row.conversation,
                content: row.content,
                type: MessageType.Text,
                date: row.sent_date,
            }
            return message;
        });
        return messages;
    }
}
