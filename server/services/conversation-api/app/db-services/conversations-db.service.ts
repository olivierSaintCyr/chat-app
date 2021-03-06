import { Conversation, ConversationCreationParams, ConversationRow } from '@app/conversation.interface';
import { CassandraDBClient } from '@app/db-services/cassandra-db-client.service';
import { Service } from 'typedi';
import * as cassandra from 'cassandra-driver';

@Service()
export class ConversationsDBService {
    constructor(private dbClient: CassandraDBClient) {}
    private get client() {
        return this.dbClient.client;
    }

    async create(params: ConversationCreationParams) {
        const uuid = cassandra.types.Uuid.random();
        const now = new Date();
        const query = `INSERT INTO conversation (id, icon, title, users, last_message_date) VALUES (
            ${uuid},
            '${params.icon}',
            '${params.title}',
            {${params.users.join(',')}},
            ${now.getTime()}
        );`;
       await this.client.execute(query);
       return uuid.toString();
    }
    // TODO REFACTOR NO conversation row out of this service
    async getConversation(conversationId: string) {
        const query = `SELECT * FROM conversation WHERE id = ${conversationId};`;
        console.log(query);
        const result = await this.client.execute(query);
        if (result.rows.length === 0) {
            throw Error(`No conversation found with id: ${conversationId}`);
        }

        const conversationRow = this.rowToConversationRow(result.rows[0]);
        return conversationRow;
    }

    async addUser(userId: string, conversationId: string) {
        const query = `UPDATE conversation 
            SET users = users + {${userId}}
            WHERE id = ${conversationId};
        `;
        this.client.execute(query);
    }

    async removeUser(userId: string, conversationId: string) {
        const query = `UPDATE conversation 
            SET users = users - {${userId}}
            WHERE id = ${conversationId};
        `;
        this.client.execute(query);
    }

    async isUserInConversation(userId: string, conversationId: string) {
        const query = `
            SELECT users FROM conversation WHERE id = ${conversationId};
        `;
        const result = await this.client.execute(query);
        if (result.rows.length === 0) {
            return false;
        }
        const users = result.rows[0].users;
        console.log(users);
        for (const user of users) {
            if (user === userId.toString()) {
                return true;
            }
        }
        return false;
    }

    async getUsers(conversationId: string): Promise<string[]> {
        const query = `
            SELECT users FROM conversation WHERE id = ${conversationId};
        `;
        const result = await this.client.execute(query);
        if (result.rows.length === 0) {
            throw Error('Conversation not found');
        }
        const userUuids = result.rows[0].users;
        return userUuids.map((uuid: cassandra.types.Uuid) => uuid.toString());
    }

    async getUserConversations(userId: string): Promise<Conversation[]> {
        const query = `SELECT * FROM conversation WHERE users CONTAINS ${userId} ALLOW FILTERING;`;
        const result = await this.client.execute(query);
        if (result.rows.length == 0) {
            return [];
        }
        const rows = result.rows;
        const conversations = rows.map((row) => this.rowToConversation(row));
        return conversations;
    }

    async delete(conversationId: string) {
        const query = `DELETE FROM conversation WHERE id = ${conversationId};`;
        this.client.execute(query);
    }

    async updateTitle(title: string, conversationId: string) {
        const query = `UPDATE conversation 
            SET title = '${title}'
            WHERE id = ${conversationId} IF EXISTS;
        `;
        const response = await this.client.execute(query);
        console.log(response);
    }

    private rowToConversation(row: cassandra.types.Row): Conversation {
        const userUuids: cassandra.types.Uuid[] = row.users;
        const users = userUuids.map((uuid) => uuid.toString());
        return {
            id: row.id,
            title: row.title,
            icon: row.icon,
            users
        };
    }

    private rowToConversationRow(row: cassandra.types.Row): ConversationRow {
        const userUuids: cassandra.types.Uuid[] = row.users;
        const users = userUuids.map((uuid) => uuid.toString());
        return {
            id: row.id,
            title: row.title,
            icon: row.icon,
            users,
            lastMessageDate: row.last_message_date,
            lastMessageId: row.last_message
        };
    }
}
