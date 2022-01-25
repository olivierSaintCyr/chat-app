export class ConversationsService {
    async getUsers(conversationId: string) {
        // get user in db
        console.log('get user in db');
        return ['abcdef', 'ghijklm'];
    }

    async getPermission(userId: string, conversationId: string) {

    }
}