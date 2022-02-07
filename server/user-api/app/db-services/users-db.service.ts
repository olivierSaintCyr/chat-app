import { CassandraDBClient } from '@app/db-services/cassandra-db-client.service';
import { Service } from 'typedi';
import * as cassandra from 'cassandra-driver';
import { BaseUser, PrivateUser, PublicUser } from '@app/user/user.interface';

@Service()
export class UsersDBService  {
    constructor(private clientDB: CassandraDBClient) {}
    private get client() {
        return this.clientDB.client;
    }

    async getPublicUser(userId: string) {
        const query = `SELECT id, image_url, name, friends FROM user WHERE id = ${userId};`;
        const result = await this.client.execute(query);
        if (result.rows.length === 0) {
            throw Error(`No user has the id: ${userId}`);
        }
        const row = result.rows[0];
        return this.rowToPublicUser(row);
    }

    async getPrivateUser(userId: string) {
        const query = `SELECT * FROM user WHERE id = ${userId};`;
        const result = await this.client.execute(query);
        if (result.rows.length === 0) {
            throw Error(`No user has the id: ${userId}`);
        }
        const row = result.rows[0];
        return this.rowToPrivateUser(row);
    }

    async addFriendToUser(userId: string, newFriendId: string) {
        const query = `
            UPDATE user 
            SET friends = friends + {${newFriendId}} 
            WHERE id = ${userId};
        `;
        await this.client.execute(query);
    }

    async removeFriendFromUser(userId: string, friendId: string) {
        const query = `
            UPDATE user 
            SET friends = friends - {${friendId}} 
            WHERE id = ${userId};
        `;
        await this.client.execute(query);
    }

    async changeName(userId: string, newName: string) {
        const query = `
            UPDATE user
            SET name = '${newName}'
            WHERE id = ${userId};
        `;
        await this.client.execute(query);
    }

    async createUser(baseUser: BaseUser) {
        const query = `
            INSERT INTO user (id, name, image_url, friends, conversations) VALUES (
                ${baseUser.id},
                '${baseUser.name}',
                '${baseUser.imageUrl}',
                {},
                {}
            ) IF NOT EXISTS;
        `;
        await this.client.execute(query);
    }

    async isUserExist(userId: string) {
        const query = `
            SELECT COUNT(*)
            FROM user
            WHERE id = ${userId};
        `;
        const result = await this.client.execute(query);
        console.log(result.rows[0]);
        const count: cassandra.types.Long = result.rows[0].count;
        return count.toNumber() === 1;
    }

    private rowToPublicUser(row: cassandra.types.Row): PublicUser {
        const friends = row.friends !== null ? 
            row.friends.map((uuid: cassandra.types.Uuid) => uuid.toString()) 
            : [];
        return {
            id: row.id.toString(),
            friends,
            imageUrl: row.image_url,
            name: row.name
        };
    }

    private rowToPrivateUser(row: cassandra.types.Row): PrivateUser {
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
