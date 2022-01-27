export interface Conversation extends ConversationCreationParams {
    id: string;
}

export interface ConversationCreationParams {
    title: string;
    users: string[]; // user_id[]
    icon: string; // image url
}