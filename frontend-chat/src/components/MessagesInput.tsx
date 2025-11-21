import { useState } from "react";

interface Props {
    onSend: (text: string) => void;
}

export const MessageInput = ({ onSend }: Props) => {
    const [text, setText] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) return;
        onSend(text.trim());
        setText("");
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                placeholder="Type a message..."
                value={text}
                onChange={e => setText(e.target.value)}
            />
            <button type="submit">Send</button>
        </form>
    );
};
