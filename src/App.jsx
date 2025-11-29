import { useState } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Chat from "./pages/Chat";

function App() {
  const savedUser = JSON.parse(localStorage.getItem("user"));
  const [user, setUser] = useState(savedUser || null);
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div>
      {user ? (
        <Chat />
      ) : showLogin ? (
        <Login setUser={setUser} setShowLogin={setShowLogin} />
      ) : (
        <Register setShowLogin={setShowLogin} />
      )}
    </div>
  );
}

export default App;
