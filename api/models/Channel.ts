import mongoose, { type HydratedDocument, Model, Types } from "mongoose";

export interface ChannelFields {
    name: string;
    owner: Types.ObjectId;
    participants: Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

interface ChannelMethods {
    addParticipant(userId: Types.ObjectId): void;
    removeParticipant(userId: Types.ObjectId): void;
}

type ChannelModel = Model<ChannelFields, {}, ChannelMethods>;

const ChannelSchema = new mongoose.Schema<HydratedDocument<ChannelFields>, ChannelModel>({
    name: { type: String, required: true, unique: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "UserFiled", required: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "UserFiled" }],
}, { timestamps: true });

ChannelSchema.methods.addParticipant = function (userId: Types.ObjectId) {
    if (!this.participants.includes(userId)) this.participants.push(userId);
};

ChannelSchema.methods.removeParticipant = function (userId: Types.ObjectId) {
    this.participants = this.participants.filter((id: Types.ObjectId) => !id.equals(userId));
};

ChannelSchema.set("toJSON", {
    transform: (doc, ret: Record<string, any>) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    },
});

export const Channel = mongoose.model<HydratedDocument<ChannelFields>, ChannelModel>("Channel", ChannelSchema);