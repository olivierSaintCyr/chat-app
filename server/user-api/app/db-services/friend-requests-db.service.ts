import { CassandraDBClient } from '@app/db-services/cassandra-db-client.service';
import { Service } from 'typedi';
import * as cassandra from 'cassandra-driver';

@Service()
export class FriendRequestsDB  {
    constructor(private clientDB: CassandraDBClient) {}
    private get client() {
        return this.clientDB.client;
    }

    async send(from: string, to: string) {
        const query = `INSERT INTO FriendRequest (to_id, from_id) VALUES (
            ${to},
            ${from}
        ) IF NOT EXISTS;`;
        const response = await this.client.execute(query);
        console.log(response.wasApplied);
    }

    async isAlreadySent(from: string, to: string) {
        const query = `
            SELECT COUNT(*) 
            FROM FriendRequest
            WHERE to_id = ${to}
            AND from_id = ${from};
        `;
        const result = await this.client.execute(query);
        console.log(result.rows);
    }
}
