import { FriendRequestsDB } from '@app/db-services/friend-requests-db.service';
import { Service } from 'typedi';

@Service()
export class FriendRequestsService {
    constructor(private friendReqDB: FriendRequestsDB) {}

    async send(from: string, to: string) {
        this.friendReqDB.send(from, to);
    }

    async isAlreadySent(from: string, to: string) {
        this.friendReqDB.isAlreadySent(from, to);
    }
}
