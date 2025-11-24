import { useState } from "react";
import {EmojiPicker} from "../UI/EmojiPicker.tsx";

interface Props {
    onSend: (text: string) => void;
}

export const MessageInput = ({ onSend }: Props) => {
    const [text, setText] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const handleEmojiSelect = (emoji: any) => {
        setText(text + emoji.native);
        setShowEmojiPicker(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) return;
        onSend(text.trim());
        setText("");
    };

    return (
        <div className="relative w-full">
            {showEmojiPicker && (
                <div className="absolute bottom-12 right-0 z-10">
                    <EmojiPicker onEmojiSelect={handleEmojiSelect} />
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex w-full">
                <input
                    type="text"
                    placeholder="Type a message..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="flex-1 px-4 py-2 bg-gray-800 text-white focus:outline-none rounded-lg"
                />

                <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="px-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" />
                    </svg>
            </button>

                <button
                    type="submit"
                    className="ml-2 px-4 py-2 bg-violet-600 text-white rounded-lg"
                >
                    Send
                </button>
            </form>
        </div>
    );
};
