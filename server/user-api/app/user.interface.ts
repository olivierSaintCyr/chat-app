export interface PrivateUser extends PublicUser {
    conversations: string[];
}

export interface PublicUser {
    id: string;
    friends: string[];
    imageUrl: string;
    name: string;
}
