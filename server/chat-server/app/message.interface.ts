export interface UserMessage {
    type: MessageType; // Image or text
    content: string; // content link for img txt for text
}

export enum MessageType {
    Image = 'Image',
    Text = 'Text',
}

export interface Message extends UserMessage {
    date: Date;
    conversation: string;
    author: string;
}
