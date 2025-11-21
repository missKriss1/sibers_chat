interface Message {
    id: string;
    user: { username: string };
    message: string;
}

interface Props {
    messages: Message[];
}

export const MessageList = ({ messages }: Props) => {
    return (
        <div style={{ maxHeight: "400px", overflowY: "auto" }}>
            {messages.map((m) => (
                <div key={m.id}>
                    <b>{m.user.username}:</b> {m.message}
                </div>
            ))}
        </div>
    );
};
