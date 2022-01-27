import { ConversationCreationParams } from '@app/conversation.interface';
import { ConversationsService } from '@app/conversations.service';
import { Router } from 'express';

export class ConversationsController {
    readonly router = Router();
    constructor(private conversationService: ConversationsService) {
        this.setRoutes();
    }

    private setRoutes() {
        this.router.get('/', (req, res) => {
            res.sendStatus(201);
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
            const { conversationId } = req.body;
            if (conversationId === undefined) {
                res.sendStatus(400);
                return;
            }

            try {
                await this.conversationService.delete(conversationId);
                res.sendStatus(200);
            } catch (e) {
                res.sendStatus(400);
            }
        });
        
        this.router.post('/addUser', async (req, res) => {
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
            const users = await this.conversationService.getUsers(conversationId);
            const userInConvo = !users.find((user) => user === addedBy);
            if (!userInConvo) {
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
    }
}