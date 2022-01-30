import { Conversation } from '@app/conversation.interface';
import { CassandraDBClient } from '@app/db-services/cassandra-db-client.service';
import { Service } from 'typedi';

@Service()
export class UsersDBService {
    constructor(private dbClient: CassandraDBClient) {}
    private get client() {
        return this.dbClient.client;
    }

    async getConversations(userId: string): Promise<Conversation[]> {
        const query = `SELECT conversations FROM user WHERE id = ${userId}`;
        const result = await this.client.execute(query);
        if (result.rows.length === 0) {
            throw Error(`No user found with id: ${userId}`);
        }

        const conversations: Conversation[] = result.rows[0].conversations;
        if (conversations === null) {
            return [];
        }
        return conversations;
    }

    async addConversation(userId: string, conversationId: string) {
        const query = `UPDATE user SET conversations = conversations + {${conversationId}} WHERE id = ${userId};`;
        await this.client.execute(query);
    }

    async removeConversation(userId: string, conversationId: string) {
        const query = `UPDATE user SET conversations = conversations - {${conversationId}} WHERE id = ${userId};`;
        await this.client.execute(query);
    }
}
