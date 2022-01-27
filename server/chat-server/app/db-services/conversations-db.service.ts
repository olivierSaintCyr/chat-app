import { CassandraDBClient } from '@app/db-services/cassandra-db-client.service';
import { Service } from 'typedi';
import * as cassandra from 'cassandra-driver';
@Service()
export class ConversationsDBService {
    constructor(private cassandraDBClient: CassandraDBClient) {}
    private get client() {
        return this.cassandraDBClient.client;
    }

    async getUsersInConversation(conversationId: string): Promise<string[]> {
        const query = `SELECT users
            FROM conversation
            WHERE id = ${conversationId};`;
        const result = await this.client.execute(query);
        if (result.rows.length === 0) {
            throw Error('Conversation not found');
        }
        const row = result.rows[0];
        const userIds: string[] = row.users.map((uuid: cassandra.types.Uuid) => uuid.toString());
        return userIds;
    }
}
