import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../api";

function UserList({ onSelectUser, currentUser, onlineUsers }) {  // ✅ ADD onlineUsers
    const [users, setUsers] = useState([]);

    useEffect(() => {
        axios.get(`${API_URL}/api/users/all`).then((res) => {
            setUsers(res.data.users.filter((u) => u._id !== currentUser._id));
        });
    }, [currentUser._id]);

    return (
        <div style={{ width: "30%", borderRight: "1px solid #ccc", padding: 10 }}>
            <h3>Users</h3>
            {users.map((u) => (
                <div
                    key={u._id}
                    style={{
                        padding: "10px",
                        marginBottom: "5px",
                        background: "#f2f2f2",
                        cursor: "pointer",
                    }}
                    onClick={() => onSelectUser(u)}
                >
                    <div>
                        {u.name}
                        {onlineUsers && onlineUsers[u._id] && (
                            <span style={{ color: "green", fontSize: 12 }}> ●</span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default UserList;
