import { useEffect, useState } from "react";
import { wsClient } from "../api/ws";
import { MessageList } from "../components/MessagesList";
import { MessageInput } from "../components/MessagesInput";

interface Message {
    user: { username: string };
    message: string;
}

export const ChatContainer = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [currentChannel, setCurrentChannel] = useState<string | null>(null);

    useEffect(() => {
        wsClient.connect();

        // 🔥 Сохраняем ссылку на функцию-обработчик
        const handler = (data: any) => {
            if (data.type === "LOGIN_SUCCESS") {
                setCurrentChannel(data.channelId);
                wsClient.joinChannel(data.channelId);
            }
            if (data.type === "NEW_MESSAGE") {
                setMessages(prev => [...prev, data.payload]);
            }
            if (data.type === "CHANNEL_HISTORY") {
                setMessages(data.payload);
            }
        };

        wsClient.onMessage(handler); // Подписываемся

        return () => {
            // 🔥 Функция очистки: отписываемся при размонтировании компонента
            wsClient.offMessage(handler);
        };
    }, []);

    const sendMessage = (text: string) => {
        if (!currentChannel) return;
        wsClient.sendMessage(text, currentChannel);
    };

    return (
        <div>
            <MessageList messages={messages} />
            <MessageInput onSend={sendMessage} />
        </div>
    );
};
