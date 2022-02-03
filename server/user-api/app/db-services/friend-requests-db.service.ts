import { CassandraDBClient } from '@app/db-services/cassandra-db-client.service';
import { Service } from 'typedi';
import * as cassandra from 'cassandra-driver';

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
}
