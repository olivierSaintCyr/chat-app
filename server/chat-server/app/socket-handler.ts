import { UserMessage, Message } from './message.interface';
import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { createNewMessage } from './create-message';
import { LastMessage, MessagesService } from '@app/messages/messages.service';

export class SocketHandler {
    io: Server;
    private userToSocketIds = new Map<string, Set<string>>(); // user id to socket ids the same user can open different window
    private socketIdToUser = new Map<string, string>(); //
    private currentRoom = new Map<string, string>(); // socket id => roomId 

    constructor(httpServer: HttpServer, private messagesService: MessagesService) {
        this.io = new Server(httpServer);
        this.messagesService.subscribe((lastConversationMessage) => {
            this.sendLastMessage(lastConversationMessage);
        });
    }

    handleSocket() {
        this.io.use((socket, next) => {
            // TODO implement auth
            next();
        }).on('connection', (socket) => {
            const token = socket.handshake.headers.auth as string;
            this.connectUser(socket, token);
            console.log(`user : ${this.mockIdentity(token)}`);
            socket.on('join', (conversationId: string) => {
                // TODO: look if user has the auth to join this convo
                socket.join(conversationId);
                this.currentRoom.set(socket.id, conversationId);
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
                const message = createNewMessage(userMessage, user, conversationId);
                this.messagesService.receive(message);
                this.sendMessage(message);
            });

            socket.on('leave', () => {
                const [roomId] = [...socket.rooms.values()];
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

    private connectUser(socket: Socket, token: string) {
        // get user id with token
        // to remove start
        const userChatId = this.mockIdentity(token);
        // to remove end
        const socketId = socket.id;
        const userIds = this.userToSocketIds.get(userChatId);
        if (!userIds) {
            this.userToSocketIds.set(userChatId, new Set<string>([socketId]));
        } else {
            userIds.add(socketId);
        }
        
        this.socketIdToUser.set(socketId, userChatId);
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

    private sendMessage(message: Message) {
        this.io.to(message.conversation).emit('messages', message);
    }

    private sendError(errorContent: string, socket: Socket) {
        socket.emit('error', errorContent);
    }

    private mockIdentity(token: string): string {
        switch(token) {
            case '1':
                return '5b6962dd-3f90-4c93-8f61-eabfa4a803e2';
            
            case '2':
                return '5b6962dd-3f90-4c93-8f61-eabfa4a803e1';
            
            default:
                return '5b6962dd-3f90-4c93-8f61-eabfa4a803e0';
        }
    }
}
