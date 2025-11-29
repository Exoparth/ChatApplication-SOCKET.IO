import { useEffect, useState } from "react";
import io from "socket.io-client";
import axios from "axios";
import { API_URL } from "../api";
import UserList from "../components/UserList";
import Message from "../components/Message";
import TypingBubble from "../components/TypingBubble";
import { formatLastSeen } from "../utils/formatLastSeen";

const socket = io(API_URL);

function Chat() {
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [onlineUsers, setOnlineUsers] = useState({});
  const [isTyping, setIsTyping] = useState(false);
  const [pinnedUsers, setPinnedUsers] = useState(currentUser.pinnedUsers || []);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [searchChat, setSearchChat] = useState("");
  const [dark, setDark] = useState(false);

  // Emit online status once
  useEffect(() => {
    if (currentUser?._id) {
      socket.emit("userOnline", currentUser._id);
      socket.emit("joinRoom", currentUser._id);
    }
  }, [currentUser?._id]);

  // Listen for online users
  useEffect(() => {
    const handleOnlineUsers = (users) => {
      setOnlineUsers(users);
    };

    socket.on("onlineUsers", handleOnlineUsers);

    return () => {
      socket.off("onlineUsers", handleOnlineUsers);
    };
  }, []);

  // Typing events
  useEffect(() => {
    const handleTyping = ({ senderId }) => {
      if (selectedUser && senderId === selectedUser._id) {
        setIsTyping(true);
      }
    };
    const handleStopTyping = ({ senderId }) => {
      if (selectedUser && senderId === selectedUser._id) {
        setIsTyping(false);
      }
    };

    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);

    return () => {
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
    };
  }, [selectedUser]);

  // Private messages
  useEffect(() => {
    const handlePrivateMessage = (msg) => {
      if (
        selectedUser &&
        ((msg.senderId === currentUser._id &&
          msg.receiverId === selectedUser._id) ||
          (msg.senderId === selectedUser._id &&
            msg.receiverId === currentUser._id))
      ) {
        setMessages((prev) => [...prev, msg]);
      }

      // update unread counts for chats not currently open
      if (msg.receiverId === currentUser._id && (!selectedUser || msg.senderId !== selectedUser._id)) {
        setUnreadCounts((prev) => ({
          ...prev,
          [msg.senderId]: (prev[msg.senderId] || 0) + 1,
        }));
      }
    };

    socket.on("privateMessage", handlePrivateMessage);

    return () => {
      socket.off("privateMessage", handlePrivateMessage);
    };
  }, [selectedUser, currentUser._id]);

  // Load unread counts initially
  useEffect(() => {
    const fetchUnreadCounts = async () => {
      const res = await axios.get(
        `${API_URL}/api/messages/unread-count/${currentUser._id}`
      );
      setUnreadCounts(res.data.counts || {});
    };
    fetchUnreadCounts();
  }, [currentUser._id]);

  // Load chat when selecting a user
  const loadChat = async (otherUser) => {
    // get latest user info for lastSeen
    const userRes = await axios.get(`${API_URL}/api/users/${otherUser._id}`);
    const freshUser = userRes.data.user;

    setSelectedUser(freshUser);

    const res = await axios.get(
      `${API_URL}/api/messages/conversation/${currentUser._id}/${otherUser._id}`
    );
    setMessages(res.data.msgs || []);

    // Mark messages from them as read
    await axios.post(`${API_URL}/api/messages/mark-read`, {
      senderId: otherUser._id,
      receiverId: currentUser._id,
    });

    // Reset unread count for that user
    setUnreadCounts((prev) => {
      const copy = { ...prev };
      delete copy[otherUser._id];
      return copy;
    });

    // Also set local isRead = true
    setMessages((prev) =>
      prev.map((m) =>
        m.senderId === otherUser._id ? { ...m, isRead: true } : m
      )
    );
  };

  // Send message
  const sendMessage = async () => {
    if (!selectedUser || !text.trim()) return;

    const payload = {
      senderId: currentUser._id,
      receiverId: selectedUser._id,
      message: text.trim(),
      senderName: currentUser.name,
    };

    // Save to DB first (so we get id & flags)
    const res = await axios.post(`${API_URL}/api/messages/private`, payload);
    const savedMsg = res.data.msg;

    // Emit real-time message with full doc
    socket.emit("sendPrivateMessage", savedMsg);

    setMessages((prev) => [...prev, savedMsg]);
    setText("");
  };

  // Typing emit on input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setText(value);

    if (!selectedUser) return;

    socket.emit("typing", {
      senderId: currentUser._id,
      receiverId: selectedUser._id,
    });

    if (window.typingTimeout) clearTimeout(window.typingTimeout);

    window.typingTimeout = setTimeout(() => {
      socket.emit("stopTyping", {
        senderId: currentUser._id,
        receiverId: selectedUser._id,
      });
    }, 1200);
  };

  // Delete message handler
  const handleDeleteMessage = async (messageId, forEveryone) => {
    await axios.post(`${API_URL}/api/messages/delete`, {
      messageId,
      userId: currentUser._id,
      forEveryone,
    });

    // Update local state
    setMessages((prev) =>
      prev.map((m) => {
        if (m._id !== messageId) return m;
        if (forEveryone) return { ...m, deletedForEveryone: true, message: "" };
        return {
          ...m,
          deletedFor: [...(m.deletedFor || []), currentUser._id],
        };
      }).filter(
        (m) =>
          !m.deletedFor ||
          !m.deletedFor.includes(currentUser._id) ||
          m.deletedForEveryone
      )
    );
  };

  // Filtered messages (search within chat)
  const filteredMessages = messages.filter((m) =>
    m.message?.toLowerCase().includes(searchChat.toLowerCase())
  );

  const containerStyle = {
    display: "flex",
    height: "100vh",
    background: dark ? "#121212" : "#f5f5f5",
    color: dark ? "#eee" : "#000",
  };

  return (
    <div style={containerStyle}>
      <UserList
        currentUser={currentUser}
        onSelectUser={loadChat}
        onlineUsers={onlineUsers}
        pinnedUsers={pinnedUsers}
        setPinnedUsers={setPinnedUsers}
        unreadCounts={unreadCounts}
      />

      <div style={{ width: "70%", padding: 20, display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          {selectedUser ? (
            <div>
              <div style={{ fontSize: 18 }}>{selectedUser.name}</div>
              <div style={{ fontSize: 14, color: "#999" }}>
                {onlineUsers[selectedUser._id]
                  ? "Online"
                  : formatLastSeen(selectedUser.lastSeen)}
              </div>
            </div>
          ) : (
            <div>Select a user to start chat</div>
          )}

          <button
            onClick={() => setDark((d) => !d)}
            style={{
              padding: "4px 10px",
              borderRadius: 4,
              border: "1px solid #999",
              background: dark ? "#333" : "#fff",
              color: dark ? "#fff" : "#000",
              cursor: "pointer",
            }}
          >
            {dark ? "Light mode" : "Dark mode"}
          </button>
        </div>

        {selectedUser && (
          <input
            placeholder="Search in chat..."
            value={searchChat}
            onChange={(e) => setSearchChat(e.target.value)}
            style={{
              marginBottom: 8,
              padding: 6,
              borderRadius: 4,
              border: "1px solid #ccc",
            }}
          />
        )}

        <div
          style={{
            flex: 1,
            overflowY: "scroll",
            padding: 10,
            border: "1px solid #ddd",
            marginBottom: 10,
            background: dark ? "#1e1e1e" : "#fff",
            borderRadius: 8,
          }}
        >
          {selectedUser ? (
            <>
              {filteredMessages.map((msg, i) => (
                <Message
                  key={i}
                  msg={msg}
                  currentUser={currentUser}
                  onDelete={handleDeleteMessage}
                />
              ))}
              {isTyping && <TypingBubble />}
            </>
          ) : (
            <h3>Select a user to start chat</h3>
          )}
        </div>

        {selectedUser && (
          <div>
            <input
              value={text}
              onChange={handleInputChange}
              placeholder="Type a message..."
              style={{ width: "80%", padding: 6, borderRadius: 4, border: "1px solid #ccc" }}
            />
            <button onClick={sendMessage} style={{ marginLeft: 8 }}>
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Chat;
