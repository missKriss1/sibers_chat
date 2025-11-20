import mongoose, { type HydratedDocument, Model, Types } from "mongoose";

export interface MessageFields {
    user: Types.ObjectId;
    channel: Types.ObjectId;
    message: string;
    date: Date;
}

interface MessageMethods {}

type MessageModel = Model<MessageFields, {}, MessageMethods>;

const MessageSchema = new mongoose.Schema<HydratedDocument<MessageFields>, MessageModel>({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "UserFiled", required: true },
    channel: { type: mongoose.Schema.Types.ObjectId, ref: "Channel", required: true },
    message: { type: String, required: true },
    date: { type: Date, required: true, default: Date.now },
});

MessageSchema.set("toJSON", {
    transform: (doc, ret: Record<string, any>) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    },
});

export const Message = mongoose.model<HydratedDocument<MessageFields>, MessageModel>("Message", MessageSchema);
