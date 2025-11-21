type WSMessage =
    | { type: "LOGIN"; payload: string }
    | { type: "JOIN_CHANNEL"; channelId: string }
    | { type: "SEND_MESSAGE"; message: string; channelId?: string }
    | { type: "CREATE_CHANNEL"; name: string }
    | { type: "REMOVE_USER"; userId: string; channelId: string }
    | { type: "SEARCH_USERS"; query: string };

class WSClient {
    private ws: WebSocket | null = null;
    private messageHandlers: ((data: any) => void)[] = [];
    private openHandlers: (() => void)[] = [];
    private messageQueue: WSMessage[] = [];

    connect() {
        if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) return;

        this.ws = new WebSocket("ws://localhost:8000/chat");

        this.ws.onopen = () => {
            console.log("WebSocket connected!");
            this.openHandlers.forEach(h => h());

            // Отправляем очередь сообщений
            while (this.messageQueue.length > 0) {
                const msg = this.messageQueue.shift();
                if (msg) this.send(msg);
            }
        };

        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.messageHandlers.forEach(handler => handler(data));
        };

        this.ws.onclose = () => {
            console.log("WebSocket closed, reconnecting in 1s...");
            setTimeout(() => this.connect(), 1000);
        };

        this.ws.onerror = (err) => {
            console.error("WebSocket error:", err);
            this.ws?.close();
        };
    }

    send(msg: WSMessage) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(msg));
        } else {
            this.messageQueue.push(msg);
            this.onOpen(() => this.send(msg)); // очередь, отправим при открытии
        }
    }

    onMessage(handler: (data: any) => void) {
        this.messageHandlers.push(handler);
    }

    offMessage(handler: (data: any) => void) {
        this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
    }

    onOpen(handler: () => void) {
        this.openHandlers.push(handler);
    }

    // Удобные методы
    login(username: string) {
        this.send({ type: "LOGIN", payload: username });
    }

    joinChannel(channelId: string) {
        this.send({ type: "JOIN_CHANNEL", channelId });
    }

    sendMessage(message: string, channelId?: string) {
        this.send({ type: "SEND_MESSAGE", message, channelId });
    }

    createChannel(name: string) {
        this.send({ type: "CREATE_CHANNEL", name });
    }

    removeUser(userId: string, channelId: string) {
        this.send({ type: "REMOVE_USER", userId, channelId });
    }

    searchUsers(query: string) {
        this.send({ type: "SEARCH_USERS", query });
    }
}

export const wsClient = new WSClient();
