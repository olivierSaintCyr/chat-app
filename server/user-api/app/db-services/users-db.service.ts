import { CassandraDBClient } from '@app/db-services/cassandra-db-client.service';
import { Service } from 'typedi';
import * as cassandra from 'cassandra-driver';
import { User } from '@app/user.interface';

@Service()
export class UsersDBService  {
    constructor(private clientDB: CassandraDBClient) {}
    private get client() {
        return this.clientDB.client;
    }

    async getPublicUser(userId: string) {
        const query = `SELECT * FROM user WHERE id = ${userId};`;
        const result = await this.client.execute(query);
        if (result.rows.length === 0) {
            throw Error(`No user has the id: ${userId}`);
        }
        const row = result.rows[0];
        return this.rowToUser(row);
    }

    async getPrivateUser() {
        
    }

    async addFriendToUser(userId: string, newFriendId: string) {
        const query = `
            UPDATE user 
            SET friends = friends + {${newFriendId}} 
            WHERE id = ${userId};
        `;
        await this.client.execute(query);
    }

    private rowToUser(row: cassandra.types.Row): User {
        const conversations = row.conversations !== null ? 
            row.conversations.map((uuid: cassandra.types.Uuid) => uuid.toString()) 
            : [];
        const friends = row.friends !== null ? 
            row.friends.map((uuid: cassandra.types.Uuid) => uuid.toString()) 
            : [];
        return {
            id: row.id.toString(),
            conversations,
            friends,
            imageUrl: row.image_url,
            name: row.name
        };
    }
}
