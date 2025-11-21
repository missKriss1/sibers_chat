// src/server.ts
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

// Тип клиента
interface ClientInfo {
    ws: WS;
    userId: string;
    currentChannel?: string;
}

const connectedClients: ClientInfo[] = [];

// Создание или получение главного канала General
const getOrCreateGeneral = async (ownerId: string) => {
    let general = await Channel.findOne({ name: "General" });
    if (!general) {
        general = new Channel({
            name: "General",
            owner: ownerId,
            participants: [],
        });
        await general.save();
    }
    return general;
};

server.ws("/chat", async (ws, req) => {
    const client: ClientInfo = { ws, userId: "" };
    connectedClients.push(client);

    ws.on("message", async (raw) => {
        const data = JSON.parse(raw.toString());

        if (!data.type) return;

        // 🔹 LOGIN
        if (data.type === "LOGIN") {
            const user = await User.findOne({ username: data.payload });

            if (!user) {
                return ws.send(JSON.stringify({ type: "LOGIN_FAILED" }));
            }

            client.userId = user._id.toString();

            // Подключаем пользователя к General
            const general = await getOrCreateGeneral(user._id.toString());

            if (!general.participants.some(p => p.toString() === client.userId)){
                general.participants.push(new mongoose.Types.ObjectId(client.userId));
                await general.save();
            }

            client.currentChannel = general._id.toString();

            ws.send(JSON.stringify({
                type: "LOGIN_SUCCESS",
                user,
                channelId: general._id.toString(),
            }));

            const history = await Message.find({ channel: general._id.toString() })
                .populate("user", "username avatar")
                .sort({ createdAt: 1 });

            ws.send(JSON.stringify({ type: "CHANNEL_HISTORY", payload: history }));

            // Отправляем список участников канала
            const participants = await User.find(
                { _id: { $in: general.participants } },
                "username avatar"
            );

            connectedClients.forEach(c => {
                if (c.currentChannel === general._id.toString()) {
                    c.ws.send(JSON.stringify({
                        type: "CHANNEL_USERS",
                        payload: participants,
                    }));
                }
            });
        }

        // 🔹 JOIN_CHANNEL
        if (data.type === "JOIN_CHANNEL") {
            client.currentChannel = data.channelId;
            const channel = await Channel.findById(data.channelId).populate("participants", "username avatar");

            if (!channel) return;

            if (!channel.participants.some((p: any) => p._id.toString() === client.userId)) {
                channel.participants.push(new mongoose.Types.ObjectId(client.userId));
                await channel.save();
            }

            // Список участников
            const participants = channel.participants.map((p: any) => ({
                id: p._id.toString(),
                username: p.username,
                avatar: p.avatar,
            }));

            connectedClients.forEach(c => {
                if (c.currentChannel === data.channelId) {
                    c.ws.send(JSON.stringify({ type: "CHANNEL_USERS", payload: participants }));
                }
            });

            // История сообщений
            const history = await Message.find({ channel: data.channelId })
                .populate("user", "username avatar")
                .sort({ createdAt: 1 });

            ws.send(JSON.stringify({ type: "CHANNEL_HISTORY", payload: history }));

            // Уведомляем остальных о входе
            connectedClients.forEach(c => {
                if (c.currentChannel === data.channelId && c.userId !== client.userId) {
                    c.ws.send(JSON.stringify({
                        type: "USER_JOINED",
                        payload: {
                            userId: client.userId,
                            username: (channel.participants as any).find((p:any)=>p._id.toString()===client.userId)?.username
                        }
                    }));
                }
            });
        }

        // 🔹 SEND_MESSAGE
        if (data.type === "SEND_MESSAGE") {
            if (!client.currentChannel) return;

            const newMsg = new Message({
                user: client.userId,
                channel: client.currentChannel,
                message: data.message,
            });

            await newMsg.save();
            const populatedMsg = await newMsg.populate("user", "username avatar");

            connectedClients.forEach(c => {
                if (c.currentChannel === client.currentChannel) {
                    c.ws.send(JSON.stringify({ type: "NEW_MESSAGE", payload: populatedMsg }));
                }
            });
        }

        // 🔹 CREATE_CHANNEL
        if (data.type === "CREATE_CHANNEL") {
            const channel = new Channel({
                name: data.name,
                owner: client.userId,
                participants: [new mongoose.Types.ObjectId(client.userId)],
            });
            await channel.save();

            ws.send(JSON.stringify({ type: "CHANNEL_CREATED", payload: channel }));
        }

        // 🔹 REMOVE_USER (только владелец)
        if (data.type === "REMOVE_USER") {
            const channel = await Channel.findById(data.channelId);
            if (!channel) return;

            if (channel.owner?.toString() !== client.userId) return;

            channel.participants = channel.participants.filter(
                id => id.toString() !== data.userId
            );
            await channel.save();

            const participants = await User.find({ _id: { $in: channel.participants } }, "username avatar");
            connectedClients.forEach(c => {
                if (c.currentChannel === data.channelId) {
                    c.ws.send(JSON.stringify({ type: "CHANNEL_USERS", payload: participants }));
                }
            });
        }

        // 🔹 SEARCH_USERS
        if (data.type === "SEARCH_USERS") {
            const found = await User.find(
                { username: new RegExp(data.query, "i") },
                "username avatar"
            );

            ws.send(JSON.stringify({ type: "SEARCH_RESULTS", payload: found }));
        }
    });

    ws.on("close", async () => {
        const index = connectedClients.indexOf(client);
        if (index !== -1) connectedClients.splice(index, 1);

        if (client.currentChannel) {
            const channel = await Channel.findById(client.currentChannel);
            if (!channel) return;

            channel.participants = channel.participants.filter(id => id.toString() !== client.userId);
            await channel.save();

            const participants = await User.find({ _id: { $in: channel.participants } }, "username avatar");
            connectedClients.forEach(c => {
                if (c.currentChannel === client.currentChannel) {
                    c.ws.send(JSON.stringify({ type: "CHANNEL_USERS", payload: participants }));
                    c.ws.send(JSON.stringify({ type: "USER_LEFT", payload: { userId: client.userId } }));
                }
            });
        }
    });
});

// Seed users если база пуста
const seedUsers = async () => {
    const count = await User.countDocuments();
    if (count === 0) {
        await User.insertMany(users);
        console.log("Users imported!");
    }
};

const run = async () => {
    await mongoose.connect(config.db);
    await seedUsers();
    server.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
};

run().catch(console.error);
