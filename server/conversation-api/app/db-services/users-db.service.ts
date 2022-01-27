import { CassandraDBClient } from '@app/db-services/cassandra-db-client.service';
import { Service } from 'typedi';

@Service()
export class UsersDBService {
    constructor(private dbClient: CassandraDBClient) {}
    private get client() {
        return this.dbClient.client;
    }

    
}