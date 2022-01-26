import { Message, UserMessage } from './message.interface'

export const createNewMessage = (userMessage: UserMessage, from: string, roomId: string): Message => {
    console.log(roomId)
    const message = {...userMessage} as Message;
    message.date = new Date();
    message.author = from;
    message.conversation = roomId;
    return message;
}
