export interface PrivateUser extends PublicUser {
    conversations: string[];
}

export interface PublicUser extends BaseUser {
    friends: string[];
}

export interface BaseUser {
    id: string
    name: string;
    imageUrl: string;
}