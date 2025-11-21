import { useState } from "react";
import { LoginContainer } from "./containers/LoginContainer";
import { ChatContainer } from "./containers/ChatContainer";

export const App = () => {
  const [logged, setLogged] = useState(false);

  return (
      <div className="relative min-h-screen">
        {logged ? (
            <ChatContainer />
        ) : (
            <LoginContainer onLogged={() => setLogged(true)} />
        )}
      </div>
  );
};
