function Message({ msg, currentUser }) {
    const isMe = msg.senderId === currentUser._id;

    return (
        <div
            style={{
                display: "flex",
                justifyContent: isMe ? "flex-end" : "flex-start",
                marginBottom: 6,
            }}
        >
            <div
                style={{
                    background: isMe ? "#4caf50" : "#e0e0e0",
                    color: isMe ? "white" : "black",
                    padding: "8px 12px",
                    borderRadius: "10px",
                    maxWidth: "60%",
                }}
            >
                {!isMe && (
                    <strong style={{ fontSize: 12 }}>
                        {msg.name || msg.senderName}
                    </strong>
                )}
                <div>{msg.message}</div>
            </div>
        </div>
    );
}

export default Message;
