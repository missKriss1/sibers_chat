import { useEffect } from "react";
import { wsClient } from "../api/ws";

import type { User } from "./ChatContainer";
import {LoginForm} from "../components/LoginFrom.tsx";

export const LoginContainer = ({ onLogged }: { onLogged: (user: User) => void }) => {

    useEffect(() => {
        const handleMessage = (data: any) => {
            if (data.type === "LOGIN_SUCCESS") {
                onLogged(data.user);
            }
        };
        wsClient.onMessage(handleMessage);
        return () => wsClient.offMessage(handleMessage);
    }, []);

    const handleLogin = (username: string) => {
        wsClient.connect();
        wsClient.login(username);
    };

    return <LoginForm onLogin={handleLogin} />;
};
