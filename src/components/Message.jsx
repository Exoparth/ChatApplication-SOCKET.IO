import { useState } from "react";

function Message({ msg, currentUser, onDelete }) {
    const isMe = msg.senderId === currentUser._id || msg.senderId?._id === currentUser._id;
    const [showMenu, setShowMenu] = useState(false);

    const getStatusText = () => {
        if (msg.isRead) return "✓✓"; // seen
        if (msg.isDelivered) return "✓✓"; // delivered
        return "✓"; // sent
    };

    const statusColor = msg.isRead ? "#1e88e5" : "#555";

    if (msg.deletedForEveryone) {
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    marginBottom: 6,
                    fontSize: 12,
                    color: "#888",
                }}
            >
                This message was deleted
            </div>
        );
    }

    return (
        <div
            style={{
                display: "flex",
                justifyContent: isMe ? "flex-end" : "flex-start",
                marginBottom: "6px",
            }}
        >
            {!isMe && (
                <div
                    style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: "#ccc",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 6,
                        fontSize: 14,
                    }}
                >
                    {(msg.senderName || msg.sender?.name || "?")
                        .charAt(0)
                        .toUpperCase()}
                </div>
            )}

            <div
                style={{
                    background: isMe ? "#4caf50" : "#e0e0e0",
                    color: isMe ? "white" : "black",
                    padding: "8px 12px",
                    borderRadius: "10px",
                    maxWidth: "60%",
                    position: "relative",
                }}
            >
                {!isMe && (
                    <div style={{ fontSize: 11, marginBottom: 2 }}>
                        {msg.senderName || msg.sender?.name || "User"}
                    </div>
                )}

                <div>{msg.message}</div>

                <div
                    style={{
                        fontSize: 10,
                        marginTop: 4,
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        gap: 4,
                    }}
                >
                    <span style={{ color: statusColor }}>{getStatusText()}</span>
                </div>

                {isMe && (
                    <div
                        style={{
                            position: "absolute",
                            top: 2,
                            right: 4,
                            cursor: "pointer",
                            fontSize: 12,
                        }}
                        onClick={() => setShowMenu((prev) => !prev)}
                    >
                        ⋮
                    </div>
                )}

                {isMe && showMenu && (
                    <div
                        style={{
                            position: "absolute",
                            top: 16,
                            right: 0,
                            background: "white",
                            color: "black",
                            border: "1px solid #ddd",
                            borderRadius: 4,
                            fontSize: 12,
                            zIndex: 10,
                        }}
                    >
                        <div
                            style={{ padding: "4px 8px", cursor: "pointer" }}
                            onClick={() => {
                                onDelete(msg._id, false);
                                setShowMenu(false);
                            }}
                        >
                            Delete for me
                        </div>
                        <div
                            style={{ padding: "4px 8px", cursor: "pointer" }}
                            onClick={() => {
                                onDelete(msg._id, true);
                                setShowMenu(false);
                            }}
                        >
                            Delete for everyone
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Message;
