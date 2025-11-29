import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../api";
import { formatLastSeen } from "../utils/formatLastSeen";

function UserList({
    onSelectUser,
    currentUser,
    onlineUsers,
    pinnedUsers,
    setPinnedUsers,
    unreadCounts,
}) {
    const [users, setUsers] = useState([]);
    const [lastMessages, setLastMessages] = useState({});
    const [search, setSearch] = useState("");

    useEffect(() => {
        axios.get(`${API_URL}/api/users/all`).then((res) => {
            const all = res.data.users.filter((u) => u._id !== currentUser._id);
            setUsers(all);
            fetchLastMessages(all);
        });
    }, [currentUser._id]);

    const fetchLastMessages = async (userList) => {
        const map = {};
        for (const u of userList) {
            const res = await axios.get(
                `${API_URL}/api/messages/conversation/${currentUser._id}/${u._id}`
            );
            const msgs = res.data.msgs || [];
            if (msgs.length > 0) {
                map[u._id] = msgs[msgs.length - 1]; // last message
            }
        }
        setLastMessages(map);
    };

    const togglePin = async (userId) => {
        const res = await axios.post(`${API_URL}/api/users/pin`, {
            userId: currentUser._id,
            targetId: userId,
        });

        setPinnedUsers(res.data.pinnedUsers || []);
    };

    const filteredUsers = users
        .filter((u) =>
            u.name.toLowerCase().includes(search.trim().toLowerCase())
        )
        .sort((a, b) => {
            const aPinned = pinnedUsers.includes(a._id);
            const bPinned = pinnedUsers.includes(b._id);
            if (aPinned && !bPinned) return -1;
            if (!aPinned && bPinned) return 1;
            return 0;
        });

    return (
        <div
            style={{
                width: "30%",
                borderRight: "1px solid #ccc",
                padding: 10,
                display: "flex",
                flexDirection: "column",
            }}
        >
            <h3>Chats</h3>

            <input
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ marginBottom: 10, padding: 6, borderRadius: 4, border: "1px solid #ccc" }}
            />

            <div style={{ overflowY: "auto" }}>
                {filteredUsers.map((u) => {
                    const last = lastMessages[u._id];
                    const unread = unreadCounts[u._id] || 0;
                    const isOnline = onlineUsers && onlineUsers[u._id];

                    return (
                        <div
                            key={u._id}
                            style={{
                                padding: "8px",
                                marginBottom: "5px",
                                background: "#f2f2f2",
                                cursor: "pointer",
                                borderRadius: 6,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                            }}
                            onClick={() => onSelectUser(u)}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <div
                                    style={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: "50%",
                                        background: "#ccc",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: 14,
                                    }}
                                >
                                    {u.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div>
                                        {u.name}
                                        {isOnline && (
                                            <span style={{ color: "green", fontSize: 12 }}> ●</span>
                                        )}
                                    </div>
                                    <div style={{ fontSize: 11, color: "#555" }}>
                                        {isOnline
                                            ? "Online"
                                            : u.lastSeen
                                                ? formatLastSeen(u.lastSeen)
                                                : ""}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 11,
                                            color: "#777",
                                            maxWidth: 160,
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                        }}
                                    >
                                        {last ? last.message : "No messages yet"}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                                <div
                                    style={{ cursor: "pointer", fontSize: 18 }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        togglePin(u._id);
                                    }}
                                >
                                    {pinnedUsers.includes(u._id) ? "📌" : "📍"}
                                </div>
                                {unread > 0 && (
                                    <div
                                        style={{
                                            marginTop: 4,
                                            background: "#e53935",
                                            color: "white",
                                            borderRadius: "999px",
                                            padding: "2px 6px",
                                            fontSize: 11,
                                        }}
                                    >
                                        {unread}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default UserList;
