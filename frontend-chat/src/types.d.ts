export interface Messages {
    _id?: string;
    user: { username: string };
    message: string;
    createdAt?: string;
}

export interface ChannelPayload {
    _id?: string;
    id?: string;
    name: string;
    owner: string;
}

type Channel = ChannelPayload & { _id: string };

export interface User {
    _id: string;
    username: string;
}

export interface MessagePayload {
    _id?: string;
    id?: string;
    user: { _id?: string; username: string };
    message: string;
    createdAt?: string;
}

type Message = MessagePayload & { _id?: string };

export interface ChatProps {
    currentUser: User;
}
export interface EmojiData {
    emoji: string;
    name: string;
    category: string;
}