import { NewUser } from '@app/user/user.interface';
import { Service } from 'typedi';

@Service()
export class NewUserFactory {
    createNewUser(userId: string, name: string): NewUser {
        return {
            id: userId,
            name,
            imageUrl: 'profile-pictures/default',
        }
    }
}
