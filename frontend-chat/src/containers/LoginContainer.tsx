import {useEffect, useState} from "react";
import { wsClient } from "../api/ws";
import {LoginForm} from "../components/LoginFrom.tsx";
import type {User} from "../types";

export const LoginContainer = ({ onLogged }: { onLogged: (user: User) => void }) => {
    const [error, setError] = useState("");

    useEffect(() => {
        const handleMessage = (data: any) => {
            if (data.type === "LOGIN_SUCCESS") {
                setError("");
                onLogged(data.user);
            }

            if (data.type === "LOGIN_FAILED") {
                setError("This username does not exist");
            }
        };
        wsClient.onMessage(handleMessage);
        return () => wsClient.offMessage(handleMessage);
    }, []);

    const handleLogin = (username: string) => {
        setError("");
        wsClient.connect();
        wsClient.login(username);
    };

    return <LoginForm onLogin={handleLogin} error={error}/>;
};
