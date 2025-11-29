import { useState } from "react";
import axios from "axios";
import { API_URL } from "../api";

function Register({ setShowLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const registerUser = async () => {
    if (!name || !email || !password) {
      alert("All fields required");
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/api/auth/register`, {
        name,
        email,
        password,
      });

      if (res.data.success) {
        alert("Account created! Now login.");
        setShowLogin(true);
      } else {
        alert(res.data.error);
      }
    } catch (err) {
      alert("Error creating account");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Create Account</h2>

      <input
        placeholder="Name"
        onChange={(e) => setName(e.target.value)}
        style={{ display: "block", marginBottom: 10 }}
      />

      <input
        placeholder="Email"
        type="email"
        onChange={(e) => setEmail(e.target.value)}
        style={{ display: "block", marginBottom: 10 }}
      />

      <input
        placeholder="Password"
        type="password"
        onChange={(e) => setPassword(e.target.value)}
        style={{ display: "block", marginBottom: 10 }}
      />

      <button onClick={registerUser}>Register</button>

      <p style={{ marginTop: 10 }}>
        Already have an account?{" "}
        <span
          style={{ color: "blue", cursor: "pointer" }}
          onClick={() => setShowLogin(true)}
        >
          Login
        </span>
      </p>
    </div>
  );
}

export default Register;
