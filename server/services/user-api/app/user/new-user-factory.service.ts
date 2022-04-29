import { DEFAULT_PROFILE_PIC_PATH } from '@app/new-user-default-values';
import { NewUser } from '@app/user/user.interface';
import { Service } from 'typedi';

@Service()
export class NewUserFactory {
    createNewUser(userId: string, name: string): NewUser {
        return {
            id: userId,
            name,
            imageUrl: DEFAULT_PROFILE_PIC_PATH,
        }
    }
}
