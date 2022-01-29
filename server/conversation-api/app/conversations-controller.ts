import { ConversationsService } from '@app/conversations.service';
import { UsersPermissionsService } from '@app/users-permissions.service';
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
        this.router.get('/', async (req, res) => {
            const { userId } = req.body;
            console.log(userId)
            try {
                const conversations = await this.conversationService.getConversations(userId);
                res.send(conversations);
            } catch (e) {
                console.error(e);
                res.sendStatus(400)
            }
        });

        this.router.put('/', async (req, res) => {
            // TODO validate body
            // TODO get user id with auth and remove it from the users in params
            // a user can only add its friends
            const { users, title } = req.body;
            if (users === undefined || title === undefined) {
                res.sendStatus(400);
                return;
            }
            // TODO cannot add inexisting user in conversation
            try {
                await this.conversationService.create(users, title);
                res.sendStatus(200);
            } catch (e) {
                res.sendStatus(400);
            }
        });

        this.router.delete('/', async (req, res) => {
            // TODO enforce security verify right not every one can do this
            const { conversationId } = req.body;
            if (conversationId === undefined) {
                res.sendStatus(400);
                return;
            }
            // TODO remove this scope for common user
            try {
                await this.conversationService.delete(conversationId);
                res.sendStatus(200);
            } catch (e) {
                res.sendStatus(400);
            }
        });
        
        this.router.post('/users', async (req, res) => {
            // TODO remove addedBy use the auth id instead
            const { conversationId, userId, addedBy } = req.body;
            if (conversationId === undefined
                || userId === undefined
                || addedBy === undefined
            ) {
                res.sendStatus(400);
                return;
            }

            // TODO verify if user adding the new user is in convo
            const hasRights = await this.usersPermissions.hasPermissionToView(addedBy, conversationId);
            if (!hasRights) {
                res.sendStatus(401);
                return;
            }

            // TODO verify if friends
            try {
                await this.conversationService.addUser(userId, conversationId);
                res.sendStatus(200);
            } catch (e) {
                res.sendStatus(400);
            }
        });

        this.router.delete('/users', async (req, res) => {
            // TODO remove removedBy use the auth id instead
            const { conversationId, userId, removedBy } = req.body;
            // TODO check if conversationId is Uuid
            if (conversationId === undefined
                || userId === undefined
                || removedBy === undefined
            ) {
                res.sendStatus(400);
                return;
            }

            // TODO verify if user adding the new user is in convo
            const hasRights = await this.usersPermissions.hasPermissionToView(removedBy, conversationId);
            if (!hasRights) {
                res.sendStatus(401);
                return;
            }

            // TODO verify if friends
            try {
                await this.conversationService.removeUser(userId, conversationId);
                res.sendStatus(200);
            } catch (e) {
                res.sendStatus(400);
            }
        });
    }
}
