import { UsersDBService } from '@app/db-services/users-db.service';
import { Service } from 'typedi';

@Service()
export class UsersService {
    constructor(private usersDB: UsersDBService) {}

    async allUsersExists(userIds: string[]) {
        const userExistance: boolean[] = [];
        await Promise.all(
            userIds.map((userId) => 
                this.usersDB.isUserExist(userId).then(
                    (exists) => userExistance.push(exists)
                )
            )
        );
        const allUsersExists = userExistance.findIndex((value) => !value) === -1;
        return allUsersExists;
    }
}
