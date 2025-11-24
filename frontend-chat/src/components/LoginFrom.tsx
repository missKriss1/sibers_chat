import { useState } from "react";

interface Props {
    onLogin: (username: string) => void;
    error?: string;
}

export const LoginForm = ({error, onLogin }: Props) => {
    const [username, setUsername] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (username.trim()) {
            onLogin(username.trim());
        }
    };

    return (
        <div className="flex items-center justify-center h-screen">
            <form
                className="flex flex-col gap-4 p-8 w-80 border-2 border-violet-400 rounded"
                onSubmit={handleSubmit}
            >
                <h2 className="text-white text-2xl font-bold text-center">
                    Login
                </h2>

                <input
                    placeholder="Username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="border border-violet-400 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                />

                <div className="h-5 flex items-center justify-center">
                    {error && (
                        <p className="text-red-400 text-sm text-center">
                            {error}
                        </p>
                    )}
                </div>

                <button
                    type="submit"
                    className="bg-violet-500 hover:bg-violet-600 text-white rounded px-3 py-2 transition-colors"
                >
                    Login
                </button>
            </form>
        </div>
    );

};
