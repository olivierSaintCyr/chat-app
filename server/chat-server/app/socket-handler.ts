import { UserMessage } from './message.interface';
import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { createNewMessage } from './create-message';

export class SocketHandler {
    io: Server;
    private userToSocketIds = new Map<string, Set<string>>(); // user id to socket ids the same user can open different window
    private socketIdToUser = new Map<string, string>(); //
    private currentRoom = new Map<string, string>(); // socket id => roomId 

    constructor(httpServer: HttpServer) {
        this.io = new Server(httpServer);
    }

    handleSocket() {
        this.io.use((socket, next) => {
            // implement auth
            console.log(socket.handshake.headers.auth);
            console.log('middle ware receive new connection');
            next();
        }).on('connection', (socket) => {
            const token = socket.handshake.headers.auth as string;
            this.connectUser(socket, token);
            console.log(`new connection from user with token: ${token}`);
            socket.on('join', (conversationId: string) => {
                // TODO: look if user has the auth to join this convo
                // console.log(`socket id: ${socket.id} ${[...socket.rooms.values()]}`);
                socket.join(conversationId);
                this.currentRoom.set(socket.id, conversationId);
            });

            socket.on('messages', (userMessage: UserMessage) => {
                // TODO need to verify message validity
                // call message service with userId sent message to conversation (roomId)
                const socketId = socket.id;
                const roomId = this.currentRoom.get(socketId);
                if (!roomId) {
                    this.sendError('You have not joined a room yet', socket);
                    return;
                }
                this.sendMessage(userMessage, roomId, socketId);
                console.log(`message received : ${userMessage}`);
            });

            socket.on('leave', () => {
                const [roomId] = [...socket.rooms.values()];
                socket.leave(roomId);
            });

            socket.on('disconnect', () => {
                console.log(`user ${socket.id} disconnected`);
                this.disconnectUser(socket);
            });
        });
    }

    private connectUser(socket: Socket, token: string) {
        // get user id with token
        // to remove start
        const userChatId = token === '1' ? 'abcdef' : 'ghijklm';
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
            console.log('removing user socket ids set');
            this.userToSocketIds.delete(userChatId);
        }

        this.socketIdToUser.delete(socketId);
    }

    private sendMessage(userMessage: UserMessage, roomId: string, socketId: string) {
        const user  = this.socketIdToUser.get(socketId);
        const message = createNewMessage(userMessage, roomId, user);
        this.io.to(roomId).emit('messages', message);
    }

    private sendError(errorContent: string, socket: Socket) {
        socket.emit('error', errorContent);
    }
}
