import mongoose, { type HydratedDocument, type Model } from "mongoose";
import type { Address, Location, Company, UserFiled, AccountHistoryItem, Post } from "../types";

const GeoSchema = new mongoose.Schema<Location>({
    lat: { type: String, required: true },
    lng: { type: String, required: true },
});

const AddressSchema = new mongoose.Schema<Address>({
    streetA: { type: String, required: true },
    streetB: { type: String, required: true },
    streetC: { type: String, required: true },
    streetD: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    zipcode: { type: String, required: true },
    geo: { type: GeoSchema, required: true },
});

const CompanySchema = new mongoose.Schema<Company>({
    name: { type: String, required: true },
    catchPhrase: { type: String, required: true },
    bs: { type: String, required: true },
});

const PostSchema = new mongoose.Schema<Post>({
    words: { type: [String], required: true },
    sentence: { type: String, required: true },
    sentences: { type: String, required: true },
    paragraph: { type: String, required: true },
});

const AccountHistorySchema = new mongoose.Schema<AccountHistoryItem>({
    amount: { type: String, required: true },
    date: { type: String, required: true },
    business: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, enum: ["deposit", "invoice", "payment", "withdrawal"],  required: true },
    account: { type: String, required: true },
});

const UserSchema = new mongoose.Schema<HydratedDocument<UserFiled>, Model<UserFiled>>({
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    address: { type: AddressSchema, required: true },
    phone: { type: String, required: true },
    website: { type: String, required: true },
    company: { type: CompanySchema, required: true },
    posts: { type: [PostSchema], default: [] },
    accountHistory: { type: [AccountHistorySchema], default: [] },
    favorite: { type: Boolean, default: false },
    avatar: { type: String, default: "" },
});

const User = mongoose.model<HydratedDocument<UserFiled>, Model<UserFiled>>("UserFiled", UserSchema);

export default User;
