import { CassandraDBClient } from '@app/db-services/cassandra-db-client.service';
import { Service } from 'typedi';
import * as cassandra from 'cassandra-driver';
import { Message } from '@app/message.interface';
@Service()
export class ConversationsDBService {
    constructor(private cassandraDBClient: CassandraDBClient) {}
    private get client() {
        return this.cassandraDBClient.client;
    }

    async isUserInConversation(userId: string, conversationId: string) {
        const query = `
            SELECT * FROM conversation
            WHERE id = ?
            AND users CONTAINS ?
            ALLOW FILTERING;
        `;
        const params = [ conversationId, userId ];
        const result = await this.client.execute(query, params);
        return result.rowLength > 0;
    }

    async getUsersInConversation(conversationId: string): Promise<string[]> {
        const query = `
            SELECT users
            FROM conversation
            WHERE id = ?;
        `;
        const params = [ conversationId ];
        const result = await this.client.execute(query, params);
        if (result.rows.length === 0) {
            return [];
        }
        const row = result.rows[0];
        const userIds: string[] = row.users.map((uuid: cassandra.types.Uuid) => uuid.toString());
        return userIds;
    }

    async updateLastMessage(message: Message, messageId: string) {
        const query = `
            UPDATE conversation 
            SET last_message = ?, last_message_date = ?
            WHERE id = ?;
        `;
        const params = [ messageId, message.date, message.conversation ];
        await this.client.execute(query, params, { prepare: true });
    }
}
