import { ConversationsService } from '@app/conversations.service';
import { UsersPermissionsService } from '@app/users-permissions.service';
import { isUuid } from '@app/utils';
import { Router } from 'express';

export class ConversationsController {
    readonly router = Router();
    constructor(
        private conversationService: ConversationsService,
        private usersPermissions: UsersPermissionsService
    ) {
        this.setRoutes();
    }

    private setRoutes() {
        // TODO REFACTOR use hasRight middle ware
        this.router.get('/', async (req, res) => {
            const { userId } = res.locals;
            try {
                const conversations = await this.conversationService.getConversations(userId);
                return res.send(conversations);
            } catch (e) {
                console.error(e);
                return res.sendStatus(400)
            }
        });
        // TODO find better name and refactor for better perf
        this.router.get('/lastActive', async (req, res) => {
            const { userId } = res.locals;
            try {
                const activeConversations = await this.conversationService.getLastActiveConversations(userId);
                return res.send(activeConversations);
            } catch (e) {
                console.log('error accessing active conversation', (e as Error).message);
                return res.sendStatus(400);
            }
        });

        this.router.put('/', async (req, res) => {
            // TODO validate body
            // TODO get user id with auth and remove it from the users in params
            // a user can only add its friends
            const { users } = res.locals;
            const { title } = req.body;
            if (title === undefined) {
                return res.sendStatus(400);
            }
            // TODO cannot add inexisting user in conversation
            try {
                await this.conversationService.create(users, title);
                return res.sendStatus(200);
            } catch (e) {
                return res.sendStatus(400);
            }
        });

        this.router.post('/', async (req, res) => {
            const { userId } = res.locals;
            const { conversationId, newTitle } = req.body;
            if (conversationId === undefined || newTitle === undefined) {
                return res.sendStatus(400);
            }

            if (!isUuid(conversationId)) {
                return res.sendStatus(400);
                return;
            }

            const hasRight = await this.usersPermissions.hasPermissionToEdit(userId, conversationId);
            if (!hasRight) {
                return res.sendStatus(401);
            }

            try {
                await this.conversationService.changeTitle(newTitle, conversationId);
                return res.sendStatus(200);
            } catch (e) {
                return res.sendStatus(400);
            }
        });

        this.router.delete('/', async (req, res) => {
            const { conversationId } = req.body;
            if (conversationId === undefined) {
                return res.sendStatus(400);
            }
            // TODO to implement make rights
            if (conversationId !== undefined) {
                return res.sendStatus(401);
            }

            try {
                await this.conversationService.delete(conversationId);
                return res.sendStatus(200);
            } catch (e) {
                return res.sendStatus(400);
            }
        });
        
        this.router.post('/users', async (req, res) => {
            // TODO remove addedBy use the auth id instead
            const { userId } = res.locals;
            const { conversationId, addedBy } = req.body;
            if (conversationId === undefined
                || addedBy === undefined
            ) {
                return res.sendStatus(400);
            }

            // TODO verify if user adding the new user is in convo
            const hasRights = await this.usersPermissions.hasPermissionToView(addedBy, conversationId);
            if (!hasRights) {
                return res.sendStatus(401);
            }

            // TODO verify if friends
            try {
                await this.conversationService.addUser(userId, conversationId);
                return res.sendStatus(200);
            } catch (e) {
                return res.sendStatus(400);
            }
        });

        this.router.delete('/users', async (req, res) => {
            // TODO remove removedBy use the auth id instead
            const { userId } = res.locals;
            const { conversationId, removedBy } = req.body;
            // TODO check if conversationId is Uuid
            if (conversationId === undefined
                || removedBy === undefined
            ) {
                return res.sendStatus(400);
            }

            // TODO verify if user adding the new user is in convo
            const hasRights = await this.usersPermissions.hasPermissionToView(removedBy, conversationId);
            if (!hasRights) {
                return res.sendStatus(401);
            }

            // TODO verify if friends
            try {
                await this.conversationService.removeUser(userId, conversationId);
                return res.sendStatus(200);
            } catch (e) {
                return res.sendStatus(400);
            }
        });

        this.router.post('/quit', async (req, res) => {
            // TODO replace userId by userId after auth
            const { userId } = res.locals;
            const { conversationId } = req.body;
            if (conversationId === undefined) {
                return res.sendStatus(400);
            }

            if (!isUuid(conversationId)) {
                return res.sendStatus(400);
            }

            try {
                await this.conversationService.removeUser(userId, conversationId);
                return res.sendStatus(200);
            } catch (e) {
                return res.sendStatus(400);
            }
        });
    }
}
