import { wsClient } from "../api/ws";
import {LoginForm} from "../components/LoginFrom.tsx";


interface Props {
    onLogged: () => void;
}

export const LoginContainer = ({ onLogged }: Props) => {
    const handleLogin = (username: string) => {
        wsClient.login(username);
        onLogged();
    };

    return <LoginForm onLogin={handleLogin} />;
};
