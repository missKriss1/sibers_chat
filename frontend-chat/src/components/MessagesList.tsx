import type {Messages} from "../types";

interface Props {
    messages: Messages[];
    currentUser: { username: string };
}

export const MessageList = ({ messages, currentUser }: Props) => {
    return (
        <div className="flex flex-col gap-3 p-4">
            {messages.map((m) => {
                const isMe = m.user.username === currentUser.username;

                const time = m.createdAt
                    ? new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    : "--:--";

                return (
                    <div
                        key={m._id}
                        className={`relative max-w-[70%] px-4 py-2 rounded-lg 
                            ${isMe ? "ml-auto bg-violet-600 text-white" : "mr-auto bg-gray-700 text-gray-200"}
                        `}
                        style={{
                            borderRadius: "12px",
                        }}
                    >
                        <div
                            className={`absolute w-0 h-0 border-t-[10px] border-t-transparent 
                            border-b-[10px] border-b-transparent 
                            ${isMe
                                ? "border-l-[10px] border-l-violet-600 right-[-9px] top-8"
                                : "border-r-[10px] border-r-gray-700 left-[-9px] top-11"
                            }`}
                        />

                        {!isMe && (
                            <p className="text-xs text-gray-400 mb-1">{m.user.username}</p>
                        )}

                        <p>{m.message}</p>

                        <p
                            className={`mt-1 text-[10px] text-gray-300 
        ${isMe ? "text-right text-violet-200" : "text-left text-gray-300"}
    `}
                        >
                            {time}
                        </p>
                    </div>
                );
            })}
        </div>
    );
};
