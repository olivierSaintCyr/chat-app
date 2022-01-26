import { CassandraDBClient } from '@app/db-services/cassandra-db-client.service';
import { Service } from 'typedi';

@Service()
export class ConversationsDBService {
    constructor(private cassandraDBClient: CassandraDBClient) {}
    get client() {
        return this.cassandraDBClient.client;
    }

    async getUsersIdInConversation(conversationId: string): Promise<string[]> {
        const query = `SELECT id 
            FROM chat_data.conversation
            WHERE id = ${conversationId};`;
        const result = await this.client.execute(query);
        return Array.from(result.rows[0].users);
    }
}
