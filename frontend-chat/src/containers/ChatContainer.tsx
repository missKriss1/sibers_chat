import {useCallback, useEffect, useRef, useState} from "react";
import { wsClient } from "../api/ws";
import { MessageList } from "../components/MessagesList.tsx";
import { MessageInput } from "../components/MessagesInput.tsx";
import type {Channel, ChannelPayload, ChatProps, Message, MessagePayload, User} from "../types";

const normalizeChannel = (channel: ChannelPayload): Channel => ({
    ...channel,
    _id: channel._id ?? channel.id ?? "",
});

const normalizeMessage = (message: MessagePayload): Message => ({
    ...message,
    _id: message._id ?? message.id,
});

export const ChatContainer = ({ currentUser }: ChatProps) => {
    const [channels, setChannels] = useState<Channel[]>([]);
    const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [participants, setParticipants] = useState<User[]>([]);
    const [participantFilter, setParticipantFilter] = useState("");
    const [userSearch, setUserSearch] = useState("");
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [isUserSearchLoading, setIsUserSearchLoading] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newChannelName, setNewChannelName] = useState("");
    const [pendingChannelId, setPendingChannelId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const isOwner = currentChannel?.owner === currentUser._id;
    const participantList =
        isOwner && currentChannel && !participants.some(p => p._id === currentUser._id)
            ? [...participants, currentUser]
            : participants;
    const isParticipant = currentChannel ? isOwner || participantList.some(p => p._id === currentUser._id) : false;

    const joinChannel = useCallback((channel: Channel) => {
        const normalized = normalizeChannel(channel);
        if (!normalized._id) return;
        setCurrentChannel(normalized);
        setMessages([]);
        setParticipants([]);
        wsClient.viewChannel(normalized._id);
    }, []);

    const subscribeToChannel = () => {
        if (!currentChannel) return;
        wsClient.subscribeToChannel(currentChannel._id);
    };

    const kickUser = (userId: string) => {
        if (!currentChannel) return;
        wsClient.removeUser(userId, currentChannel._id);
    };

    const createChannel = () => {
        if (!newChannelName.trim()) return;
        wsClient.createChannel(newChannelName.trim());
    };

    const sendMessage = (text: string) => {
        if (!currentChannel) return;
        wsClient.sendMessage(text);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        wsClient.connect();

        const handleMessage = (data: any) => {
            switch (data.type) {
                case "LOGIN_SUCCESS":
                    setPendingChannelId(data.channelId ?? null);
                    wsClient.send({ type: "GET_CHANNELS" });
                    break;
                case "CHANNELS_LIST":
                    setChannels(data.payload.map(normalizeChannel));
                    break;
                case "CHANNEL_CREATED":
                    setChannels(prev => [...prev, normalizeChannel(data.payload)]);
                    setIsCreateModalOpen(false);
                    setNewChannelName("");
                    if (data.payload.owner === currentUser._id) {
                        const id = data.payload._id ?? data.payload.id;
                        if (id) setPendingChannelId(id);
                    }
                    break;
                case "CHANNEL_USERS":
                    setParticipants(data.payload);
                    break;
                case "CHANNEL_HISTORY":
                    setMessages(data.payload.map(normalizeMessage));
                    break;
                case "NEW_MESSAGE":
                    setMessages(prev => {
                        const incoming = normalizeMessage(data.payload);
                        if (incoming._id && prev.some(m => m._id === incoming._id)) return prev;
                        return [...prev, incoming];
                    });
                    break;
                case "USER_JOINED":
                    setParticipants(prev => {
                        if (prev.some(u => u._id === data.payload.userId)) return prev;
                        return [...prev, { _id: data.payload.userId, username: data.payload.username }];
                    });
                    break;
                case "USER_LEFT":
                    if (data.payload.userId === currentUser._id) {
                        setCurrentChannel(null);
                        setMessages([]);
                        setParticipants([]);
                        alert("You have been removed from the channel");
                    } else {
                        setParticipants(prev => prev.filter(p => p._id !== data.payload.userId));
                    }
                    break;
                case "SEARCH_RESULTS":
                    setSearchResults(data.payload);
                    setIsUserSearchLoading(false);
                    break;
            }
        };

        wsClient.onMessage(handleMessage);
        return () => wsClient.offMessage(handleMessage);
    }, [currentUser._id]);

    useEffect(() => {
        if (!pendingChannelId) return;
        const nextChannel = channels.find(channel => channel._id === pendingChannelId);
        if (nextChannel) {
            joinChannel(nextChannel);
            setPendingChannelId(null);
        }
    }, [channels, pendingChannelId, joinChannel]);

    useEffect(() => {
        const trimmedQuery = userSearch.trim();
        if (trimmedQuery.length < 2) {
            setSearchResults([]);
            setIsUserSearchLoading(false);
            return;
        }

        setIsUserSearchLoading(true);
        const timeoutId = window.setTimeout(() => {
            wsClient.searchUsers(trimmedQuery);
        }, 350);

        return () => window.clearTimeout(timeoutId);
    }, [userSearch]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <div className="flex h-screen bg-gray-900 text-white">
            <div className="w-64 border-r border-gray-700 p-4 flex flex-col">
                <h2 className="text-xl font-bold mb-4">Channels</h2>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 text-sm bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded mb-4"
                >
                    + Add channel
                </button>
                <div className="space-y-2">
                    {channels.map(channel => (
                        <button
                            key={channel._id}
                            onClick={() => joinChannel(channel)}
                            className={`w-full text-left px-3 py-2 rounded transition ${
                                currentChannel?._id === channel._id ? "bg-violet-600" : "hover:bg-gray-800"
                            }`}
                        >
                            # {channel.name} {channel.owner === currentUser._id && "(owner)"}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 flex flex-col">
                {currentChannel && (
                    <>
                        <div className="bg-violet-800 p-4 border-b border-violet-700">
                            <h2 className="text-2xl font-bold"># {currentChannel.name}</h2>
                            <p className="text-sm text-gray-300">
                                Participants: {participants.length} {isOwner && "— owner"}
                            </p>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4">
                            <MessageList messages={messages} currentUser={currentUser} />
                            <div ref={messagesEndRef} />
                        </div>
                        <div className="p-4 border-t border-gray-700">
                            {isParticipant ? (
                                <MessageInput onSend={sendMessage} />
                            ) : (
                                <button
                                    onClick={subscribeToChannel}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded transition"
                                >
                                    Subscribe to the channel
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>

            <div className="w-64 border-l border-gray-700 p-4">
                <h2 className="text-xl font-bold mb-4">Participants</h2>
                <input
                    type="text"
                    placeholder="Search users..."
                    value={participantFilter}
                    onChange={(e) => setParticipantFilter(e.target.value)}
                    className="w-full mb-4 px-3 py-2 rounded bg-gray-800 text-white"
                />
                <div className="space-y-2">
                    {participantList
                        .filter(u => u.username.toLowerCase().includes(participantFilter.toLowerCase()))
                        .map(user => (
                            <div key={user._id} className="flex items-center justify-between">
                                <span className={user._id === currentUser._id ? "text-yellow-400" : ""}>
                                    {user.username}
                                    {user._id === currentUser._id && " (you)"}
                                    {currentChannel?.owner === user._id && " (owner)"}
                                </span>
                                {isOwner && user._id !== currentUser._id && (
                                    <button
                                        onClick={() => kickUser(user._id)}
                                        className="text-red-500 hover:text-red-400 text-xs"
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                        ))}
                </div>

                <div className="mt-6">
                    <p className="text-sm text-gray-400 mb-2">Global user search</p>
                    <input
                        type="text"
                        placeholder="Start typing username..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className="w-full px-3 py-2 rounded bg-gray-800 text-white mb-3"
                    />
                    {userSearch.trim().length >= 2 && (
                        <div className="bg-gray-800 rounded-lg p-3 space-y-2 max-h-64 overflow-y-auto border border-gray-700">
                            {isUserSearchLoading ? (
                                <p className="text-sm text-gray-400">Searching…</p>
                            ) : searchResults.length === 0 ? (
                                <p className="text-sm text-gray-400">No users found</p>
                            ) : (
                                searchResults.map(user => {
                                    const alreadyInChannel = participantList.some(p => p._id === user._id);
                                    return (
                                        <div key={user._id} className="flex flex-col border-b border-gray-700 pb-2 last:border-b-0 last:pb-0">
                                            <span className="font-semibold">{user.username}</span>
                                            <span className="text-xs text-gray-400">
                                                {alreadyInChannel ? "Already in this channel" : currentChannel ? "Not in this channel yet" : "Select channel to manage participants"}
                                            </span>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>
            </div>

            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="bg-gray-800 p-8 rounded-lg w-96">
                        <h3 className="text-2xl font-bold mb-6">Add channel</h3>
                        <input
                            autoFocus
                            placeholder="Name channel"
                            value={newChannelName}
                            onChange={(e) => setNewChannelName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && createChannel()}
                            className="w-full px-4 py-3 bg-gray-700 rounded text-white mb-4"
                        />
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => {
                                    setIsCreateModalOpen(false);
                                    setNewChannelName("");
                                }}
                                className="px-5 py-2 bg-gray-600 hover:bg-gray-700 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={createChannel}
                                disabled={!newChannelName.trim()}
                                className="px-6 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 rounded font-bold"
                            >
                                Add
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
