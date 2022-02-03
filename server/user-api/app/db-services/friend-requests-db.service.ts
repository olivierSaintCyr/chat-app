import { CassandraDBClient } from '@app/db-services/cassandra-db-client.service';
import { Service } from 'typedi';
import * as cassandra from 'cassandra-driver';
import { FriendRequest } from '@app/friend-request.interface';

@Service()
export class FriendRequestsDB  {
    constructor(private clientDB: CassandraDBClient) {}
    private get client() {
        return this.clientDB.client;
    }

    async insert(from: string, to: string) {
        const query = `INSERT INTO friendrequest (to_id, from_id) VALUES (
            ${to},
            ${from}
        ) IF NOT EXISTS;`;
        await this.client.execute(query);
    }

    async isAlreadySent(from: string, to: string): Promise<boolean> {
        const query = `
            SELECT COUNT(*) 
            FROM friendrequest
            WHERE to_id = ${to}
            AND from_id = ${from};
        `;
        const result = await this.client.execute(query);
        const count = result.rows[0].count as cassandra.types.Long;
        return count.toNumber() === 1;
    }

    async delete(from: string, to: string) {
        const query = `
            DELETE FROM friendrequest
            WHERE to_id = ${to} and from_id = ${from}
            IF EXISTS;`;
        const response = await this.client.execute(query);
        if (!response.wasApplied()) {
            throw Error(`No Friend request with for to: ${to} from : ${from}`)
        }
    }

    async getFriendRequests(userId: string): Promise<FriendRequest[]> {
        const query = `
            SELECT * FROM friendrequest WHERE to_id = ${userId}
        `;
        const result = await this.client.execute(query);
        if (result.rows.length === 0) {
            return [];
        }
        const rows = result.rows;
        const friendRequests = this.rowsToFriendRequests(rows);
        return friendRequests
    }

    private rowsToFriendRequests(rows: cassandra.types.Row[]): FriendRequest[] {
        const friendRequest = rows.map((row) => {
            const from = row.from_id.toString();
            const to = row.to_id.toString();
            return {
                from,
                to,
            }
        });
        return friendRequest;
    }
}
