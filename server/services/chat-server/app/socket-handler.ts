import { UserMessage, Message } from './message.interface';
import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { createNewMessage } from './create-message';
import { LastMessage, MessagesService } from '@app/messages/messages.service';
import { ConversationsService } from '@app/conversations/conversations.service';
import { isUuid } from '@app/utils';
import { AuthService } from '@app/auth/auth.service';
import { UserAccessService } from '@app/user-access.service';

export class SocketHandler {
    io: Server;
    private userToSocketIds = new Map<string, Set<string>>(); // user id to socket ids the same user can open different window
    private socketIdToUser = new Map<string, string>(); //
    private currentRoom = new Map<string, string>(); // socket id => roomId 

    constructor(
        httpServer: HttpServer,
        private messagesService: MessagesService,
        private conversationService: ConversationsService,
        private authService: AuthService,
        private userAccess: UserAccessService
    ) {
        this.io = new Server(httpServer);
        this.messagesService.subscribe((lastConversationMessage) => {
            this.sendLastMessage(lastConversationMessage);
        });
    }

    handleSocket() {
        this.io.use(
            this.authService.socketMiddleware
        ).use(
            this.userAccess.socketMiddleware
        ).on('connection', (socket) => {
            const { userId } = socket.data;
            this.connectUser(socket);

            socket.on('join', async (conversationId: string) => {
                if (!isUuid(conversationId)) {
                    this.sendError('Bad request', socket);
                    return;
                }
                const canEnter = await this.conversationService.getPermission(userId, conversationId);
                if (!canEnter) {
                    this.sendError('You are not authorized to join this conversation', socket);
                    return;
                }
                // TODO look if conversation exists
                // TODO: look if user has the auth to join this convo
                socket.join(conversationId);
                this.currentRoom.set(socket.id, conversationId);

                this.emitLastMessagesInConversation(conversationId, socket);
            });

            socket.on('messages', (userMessage: UserMessage) => {
                // TODO need to verify message validity
                // call message service with userId sent message to conversation (roomId)
                const socketId = socket.id;
                const conversationId = this.currentRoom.get(socketId);
                if (!conversationId) {
                    this.sendError('You have not joined a room yet', socket);
                    return;
                }
                const user  = this.socketIdToUser.get(socketId);
                if (!user) {
                    this.sendError('An error occur please rejoin', socket);
                    return;
                }
                const message = createNewMessage(userMessage, user, conversationId);
                this.messagesService.receive(message);
                this.sendMessage(message);
            });

            // TODO implement la

            socket.on('leave', () => {
                const [ roomId ] = [...socket.rooms.values()];
                socket.leave(roomId);
            });

            socket.on('disconnect', () => {
                this.disconnectUser(socket);
            });
        });
    }

    private sendLastMessage(lastMessage: LastMessage) {
        const { to: users,  message } = lastMessage;
        for (const userId of users) {
            const socketIds = this.userToSocketIds.get(userId);
            if (!socketIds) {
                continue;
            }
            socketIds.forEach((socketId) => {
                this.io.to(socketId).emit('lastMessages', message);
            });
        }
    }

    private connectUser(socket: Socket) {
        const { userId } = socket.data;
        const socketId = socket.id;
        const userIds = this.userToSocketIds.get(userId);
        if (!userIds) {
            this.userToSocketIds.set(userId, new Set<string>([socketId]));
        } else {
            userIds.add(socketId);
        }
        
        this.socketIdToUser.set(socketId, userId);
    }

    private disconnectUser(socket: Socket) {
        const socketId = socket.id;
        const userChatId = this.socketIdToUser.get(socketId);
        if (!userChatId) {
            return;
        }
        const userSocketIds = this.userToSocketIds.get(userChatId);
        if (!userSocketIds) {
            return;
        }

        userSocketIds.delete(socketId);
        if (userSocketIds.size === 0) {
            this.userToSocketIds.delete(userChatId);
        }

        this.socketIdToUser.delete(socketId);
    }

    private async emitLastMessagesInConversation(conversationId: string, socket: Socket) {
        const messages = await this.messagesService.getLastMessages(conversationId);
        const socketId = socket.id;
        this.io.to(socketId).emit('messages', messages);
    }

    private sendMessage(message: Message) {
        this.io.to(message.conversation).emit('messages', [message]);
    }

    private sendError(errorContent: string, socket: Socket) {
        socket.emit('error', errorContent);
    }
}
