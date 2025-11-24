import { useState } from "react";
import { LoginContainer } from "./containers/LoginContainer";
import {ChatContainer, type User} from "./containers/ChatContainer";

export const App = () => {
    const [logged, setLogged] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    return (
        <div className="relative min-h-screen">
            {logged && currentUser ? (
                <ChatContainer currentUser={currentUser} />
            ) : (
                <LoginContainer
                    onLogged={(user) => {
                        setCurrentUser(user);
                        setLogged(true);
                    }}
                />
            )}
        </div>
    );
};
