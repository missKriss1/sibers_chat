export interface Location {
    lat: string;
    lng: string;
}

export interface Address {
    streetA: string;
    streetB: string;
    streetC: string;
    streetD: string;
    city: string;
    state: string;
    country: string;
    zipcode: string;
    geo: Location;
}

export interface Company {
    name: string;
    catchPhrase: string;
    bs: string;
}

export interface Post {
    words: string[];
    sentence: string;
    sentences: string;
    paragraph: string;
}

export type AccountType = "deposit" | "invoice" | "payment";

export interface AccountHistoryItem {
    amount: string;
    date: string;
    business: string;
    name: string;
    type: AccountType;
    account: string;
}

export interface UserFiled {
    id: number;
    name: string;
    username: string;
    email: string;
    address: Address;
    phone: string;
    website: string;
    company: Company;
    posts: Post[];
    accountHistory: AccountHistoryItem[];
    favorite: boolean;
    avatar: string;
}
