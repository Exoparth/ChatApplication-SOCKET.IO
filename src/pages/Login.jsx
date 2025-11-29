import { useState } from "react";
import axios from "axios";
import { API_URL } from "../api";

function Login({ setUser, setShowLogin }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const loginUser = async () => {
        try {
            const res = await axios.post(`${API_URL}/api/auth/login`, {
                email,
                password,
            });

            if (res.data.success) {
                localStorage.setItem("token", res.data.token);
                localStorage.setItem("user", JSON.stringify(res.data.user));
                setUser(res.data.user);
            } else {
                alert(res.data.error);
            }
        } catch {
            alert("Login failed");
        }
    };

    return (
        <div>
            <h2>Login</h2>

            <input
                type="email"
                placeholder="Email"
                onChange={(e) => setEmail(e.target.value)}
            />

            <input
                type="password"
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
            />

            <button onClick={loginUser}>Login</button>
            <p style={{ marginTop: 10 }}>
                Don’t have an account?{" "}
                <span
                    style={{ color: "blue", cursor: "pointer" }}
                    onClick={() => setShowLogin(false)}
                >
                    Register
                </span>
            </p>

        </div>

    );
}

export default Login;
