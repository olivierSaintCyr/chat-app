import { UsersDBService } from '@app/db-services/users-db.service';
import { Service } from 'typedi';

@Service()
export class UsersService {
    constructor(private usersDB: UsersDBService) {}

    async allUsersExists(userIds: string[]) {
        const userExistence: boolean[] = [];
        await Promise.all(
            userIds.map((userId) => 
                this.usersDB.isUserExist(userId).then(
                    (exists) => userExistence.push(exists)
                )
            )
        );
        const allUsersExists = userExistence.findIndex((value) => !value) === -1;
        return allUsersExists;
    }
}
