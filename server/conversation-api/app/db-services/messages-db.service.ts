import { CassandraDBClient } from '@app/db-services/cassandra-db-client.service';
import { Service } from 'typedi';
import * as cassandra from 'cassandra-driver';
import { Message } from '@app/message.interface';

export interface MessageQueryParams {
    id: string;
    sentDate: Date;
    conversationId: string;
}

@Service()
export class MessageDBService {
    constructor(private clientDB: CassandraDBClient) {}
    private get client() {
        return this.clientDB.client;
    }

    async getMessage(params: MessageQueryParams) {
        const query = `SELECT * FROM message 
            WHERE conversation = ${params.conversationId}
            AND sent_date = ${params.sentDate.getTime()}
            AND id = ${params.id};
        `;
        console.log(query);
        const result = await this.client.execute(query);
        if (result.rows.length === 0) {
            throw Error(`No message has id : ${params.id}`);
        }
        const row = result.rows[0];
        return this.rowToMessage(row);
    }

    private rowToMessage(row: cassandra.types.Row): Message {
        return {
            type: row.type,
            content: row.content,
            date: row.date,
            conversation: row.conversation,
            author: row.author,
        }
    }
}