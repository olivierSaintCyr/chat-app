import { CassandraDBClient } from '@app/db-services/cassandra-db-client.service';
import { Service } from 'typedi';
import * as cassandra from 'cassandra-driver';

@Service()
export class ImageDBService {
    constructor(private clientDB: CassandraDBClient) {}
    private get client() {
        return this.clientDB.client;
    }

    async putImage(filePath: string) {
        // TODO maybe verify if image already exist if yes return undefined
        // if not then return the current uuid
        const uuid = cassandra.types.Uuid.random();
        const query = `
            INSERT INTO ImageFile (id, path) VALUES (
                ${uuid},
                ?
            );
        `;
        const params = [filePath];
        await this.client.execute(query, params);
        return uuid.toString();
    }
}
