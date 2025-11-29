import { useEffect, useState } from "react";
import io from "socket.io-client";
import axios from "axios";
import { API_URL } from "../api";
import UserList from "../components/UserList";
import Message from "../components/Message";
import { formatLastSeen } from "../utils/formatLastSeen";
import TypingBubble from "../components/TypingBubble";

const socket = io(API_URL);

function Chat() {
    const currentUser = JSON.parse(localStorage.getItem("user"));
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [onlineUsers, setOnlineUsers] = useState({}); // ✅ ADD THIS
    const [isTyping, setIsTyping] = useState(false);

    useEffect(() => {
        socket.on("typing", ({ senderId }) => {
            if (selectedUser && senderId === selectedUser._id) {
                setIsTyping(true);
            }
        });

        socket.on("stopTyping", ({ senderId }) => {
            if (selectedUser && senderId === selectedUser._id) {
                setIsTyping(false);
            }
        });

        return () => {
            socket.off("typing");
            socket.off("stopTyping");
        };
    }, [selectedUser]);


    // 🔹 Emit online status once when component mounts
    useEffect(() => {
        if (currentUser?._id) {
            socket.emit("userOnline", currentUser._id);
        }
    }, [currentUser?._id]);

    // 🔹 Listen for online users list
    useEffect(() => {
        const handleOnlineUsers = (users) => {
            setOnlineUsers(users);
        };

        socket.on("onlineUsers", handleOnlineUsers);

        return () => {
            socket.off("onlineUsers", handleOnlineUsers);
        };
    }, []);

    // Join personal socket room
    useEffect(() => {
        if (currentUser?._id) {
            socket.emit("joinRoom", currentUser._id);
        }
    }, [currentUser?._id]);

    // Load chat when selecting a user
    const loadChat = async (otherUser) => {
        // Fetch latest user info
        const userRes = await axios.get(`${API_URL}/api/users/${otherUser._id}`);
        const freshUser = userRes.data.user;

        setSelectedUser(freshUser);

        const res = await axios.get(
            `${API_URL}/api/messages/conversation/${currentUser._id}/${otherUser._id}`
        );

        setMessages(res.data.msgs);
    };


    // Listen for real-time private messages
    useEffect(() => {
        const handlePrivateMessage = (msg) => {
            if (
                selectedUser &&
                (
                    (msg.senderId === currentUser._id && msg.receiverId === selectedUser._id) ||
                    (msg.senderId === selectedUser._id && msg.receiverId === currentUser._id)
                )
            ) {
                setMessages((prev) => [...prev, msg]);
            }
        };

        socket.on("privateMessage", handlePrivateMessage);

        return () => {
            socket.off("privateMessage", handlePrivateMessage);
        };
    }, [selectedUser, currentUser?._id]);

    // Send message
    const sendMessage = async () => {
        if (!selectedUser || !text.trim()) return;

        const msgData = {
            senderId: currentUser._id,
            receiverId: selectedUser._id,
            message: text,
            senderName: currentUser.name,
        };

        // Emit real-time message to that user
        socket.emit("sendPrivateMessage", msgData);

        // Save to DB
        await axios.post(`${API_URL}/api/messages/private`, msgData);

        setText("");
    };

    return (
        <div style={{ display: "flex", height: "100vh" }}>
            <UserList
                currentUser={currentUser}
                onSelectUser={loadChat}
                onlineUsers={onlineUsers}        // ✅ PASS ONLINE USERS
            />

            <div style={{ width: "70%", padding: 20 }}>
                {selectedUser ? (
                    <>
                        <h2>
                            {selectedUser.name}
                            <div style={{ fontSize: 14, color: "gray" }}>
                                {isTyping
                                    ? `${selectedUser.name} is typing...`
                                    : onlineUsers[selectedUser._id]
                                        ? "Online"
                                        : formatLastSeen(selectedUser.lastSeen)
                                }

                            </div>
                        </h2>

                        <div
                            style={{
                                height: "70vh",
                                overflowY: "scroll",
                                padding: 10,
                                border: "1px solid #ddd",
                                marginBottom: 10,
                            }}
                        >
                            {messages.map((msg, i) => (
                                <Message key={i} msg={msg} currentUser={currentUser} />
                            ))}

                            {/* Typing bubble */}
                            {isTyping && <TypingBubble />}
                        </div>


                        <div>
                            <input
                                value={text}
                                onChange={(e) => {
                                    setText(e.target.value);

                                    // tell receiver that I'm typing
                                    socket.emit("typing", {
                                        senderId: currentUser._id,
                                        receiverId: selectedUser._id
                                    });

                                    // stop typing after inactivity
                                    if (window.typingTimeout) {
                                        clearTimeout(window.typingTimeout);
                                    }

                                    window.typingTimeout = setTimeout(() => {
                                        socket.emit("stopTyping", {
                                            senderId: currentUser._id,
                                            receiverId: selectedUser._id
                                        });
                                    }, 1200);
                                }}
                                placeholder="Type a message..."
                                style={{ width: "80%" }}
                            />
                            <button onClick={sendMessage}>Send</button>
                        </div>
                    </>
                ) : (
                    <h3>Select a user to start chat</h3>
                )}
            </div>
        </div>
    );
}

export default Chat;
