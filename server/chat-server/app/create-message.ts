import { Message, UserMessage } from './message.interface'

export const createNewMessage = (userMessage: UserMessage, from: string, roomId: string, ): Message => {
    const message = {...userMessage} as Message;
    message.date = new Date();
    message.from = from;
    message.conversation = roomId;
    return message;
}
