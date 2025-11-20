import express from "express";
import expressWs from "express-ws";
import cors from "cors";
import mongoose from "mongoose";
import { Channel } from './models/Channel';
import { Message } from './models/Message';
import User from './models/User';
import config from './config';
import users from "./data/seed-users.json";
import type { WebSocket as WS } from "ws";

const expressApp = express();
const { app: server } = expressWs(expressApp);

const port = 8000;

server.use(cors());
server.use(express.json());

interface ClientInfo {
    ws: WS;
    userId: string;
    currentChannel?: string;
}

const connectedClients: ClientInfo[] = [];

server.ws("/chat", async (ws, req) => {
    const client: ClientInfo = { ws, userId: "" };
    connectedClients.push(client);

    ws.on("message", async (msg) => {
        const data = JSON.parse(msg.toString());

        if (data.type === "LOGIN") {
            const user = await User.findOne({ username: data.payload });
            if (user) {
                client.userId = user._id.toString();
            }
        }

        // JOIN CHANNEL
        if (data.type === "JOIN_CHANNEL") {
            client.currentChannel = data.channelId;
            const channel = await Channel.findById(data.channelId).populate("participants", "username");
            if (channel) {
                channel.addParticipant(new mongoose.Types.ObjectId(client.userId));
                await channel.save();

                // Отправляем список участников канала
                const participants = channel.participants.map((p: any) => ({ id: p._id, username: p.username }));
                connectedClients.forEach(c => {
                    if (c.currentChannel === data.channelId) {
                        c.ws.send(JSON.stringify({ type: "CHANNEL_USERS", payload: participants }));
                    }
                });
            }
        }

        // SEND MESSAGE
        if (data.type === "SEND_MESSAGE") {
            if (!client.currentChannel) return;
            const newMsg = new Message({
                user: client.userId,
                channel: client.currentChannel,
                message: data.message,
            });
            await newMsg.save();
            const populatedMsg = await newMsg.populate("user", "username");

            // Отправляем сообщение только участникам канала
            connectedClients.forEach(c => {
                if (c.currentChannel === client.currentChannel) {
                    c.ws.send(JSON.stringify({ type: "NEW_MESSAGE", payload: populatedMsg }));
                }
            });
        }

        // REMOVE USER (для владельца)
        if (data.type === "REMOVE_USER") {
            const channel = await Channel.findById(data.channelId);
            if (channel && channel.owner.equals(client.userId)) {
                channel.removeParticipant(new mongoose.Types.ObjectId(data.userId));
                await channel.save();

                // обновляем список участников
                const participants = await User.find({ _id: { $in: channel.participants } }, "username");
                connectedClients.forEach(c => {
                    if (c.currentChannel === data.channelId) {
                        c.ws.send(JSON.stringify({ type: "CHANNEL_USERS", payload: participants }));
                    }
                });
            }
        }
    });

    ws.on("close", () => {
        const index = connectedClients.indexOf(client);
        if (index !== -1) connectedClients.splice(index, 1);
    });
});

const seedUsers = async () => {
    const count = await User.countDocuments();
    if (count === 0) {
        await User.insertMany(users);
        console.log("Users imported from JSON!");
    }
};

const run = async () => {
    await mongoose.connect(config.db);
    await seedUsers();
    server.listen(port, () => {
        console.log(`Listening on port http://localhost:${port}`);
    });
};

run().catch((err) => console.log(err));