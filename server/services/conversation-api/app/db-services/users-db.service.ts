import { CassandraDBClient } from '@app/db-services/cassandra-db-client.service';
import { Service } from 'typedi';
import * as cassandra from 'cassandra-driver';

@Service()
export class UsersDBService {
    constructor(private dbClient: CassandraDBClient) {}
    private get client() {
        return this.dbClient.client;
    }

    async getConversations(userId: string): Promise<string[]> {
        const query = `SELECT conversations FROM user WHERE id = ${userId};`;
        const result = await this.client.execute(query);
        if (result.rows.length === 0) {
            throw Error(`No user found with id: ${userId}`);
        }
        
        const uuids: cassandra.types.Uuid[] = result.rows[0].conversations;
        if (uuids === null) {
            return [];
        }
        const conversations = uuids.map((uuid) => uuid.toString());
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

    async isUserExist(userId: string) {
        const query = `
            SELECT COUNT(*)
            FROM user
            WHERE id = ${userId};
        `;
        const result = await this.client.execute(query);
        const count: cassandra.types.Long = result.rows[0].count;
        return count.toNumber() === 1;
    }

    async isFriendOf(userId: string, friendId: string) {
        const query = `
            SELECT COUNT(*)
            FROM user
            WHERE id = ${userId}
            AND friends CONTAINS ${friendId}
            ALLOW FILTERING;
        `;
        const result = await this.client.execute(query);
        const count: cassandra.types.Long = result.rows[0].count;
        return count.toNumber() === 1;
    }
}
