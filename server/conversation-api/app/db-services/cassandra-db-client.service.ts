import { Service } from 'typedi';
import * as cassandra from 'cassandra-driver';

@Service()
export class CassandraDBClient {
    readonly client = new cassandra.Client({
        contactPoints: [process.env.DB_HOST],
        localDataCenter: 'datacenter1',
        keyspace: 'chat_data'
    });

    constructor() {
        this.initClient();
    }

    private initClient() {
        this.client.connect((err) => {
            if (err === null) {
                console.log('Connection to Cassandra successfull');
                return;
            }
            console.error(err);
        });
    }
}