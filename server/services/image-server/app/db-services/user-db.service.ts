import { CassandraDBClient } from '@app/db-services/cassandra-db-client.service';
import { Service } from 'typedi';

@Service()
export class UserDBService {
    constructor(private clientDB: CassandraDBClient) {}
    private get client() {
        return this.clientDB.client;
    }

    async isUserExist(userId: string) {
        const query = 'SELECT * FROM user WHERE id = ?;';
        const params = [userId];
        const result = await this.client.execute(query, params);
        return result.rowLength > 0;
    }
}
