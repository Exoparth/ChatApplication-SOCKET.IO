export function formatLastSeen(timestamp) {
    if (!timestamp) return "";
    const now = new Date();
    const time = new Date(timestamp);
    const diff = Math.floor((now - time) / 1000);

    const seconds = diff;
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(seconds / 3600);
    const days = Math.floor(seconds / 86400);

    const options = { hour: "2-digit", minute: "2-digit" };
    const formattedTime = time.toLocaleTimeString([], options);

    if (seconds < 60) return "Active just now";
    if (minutes < 60) return `Active ${minutes} min${minutes > 1 ? "s" : ""} ago`;
    if (hours < 24) return `Active ${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (days === 1) return `Active yesterday at ${formattedTime}`;

    if (now.getFullYear() === time.getFullYear()) {
        return `Active on ${time.getDate()} ${time.toLocaleString("en-US", {
            month: "short",
        })} at ${formattedTime}`;
    }

    return `Active on ${time.getDate()} ${time.toLocaleString("en-US", {
        month: "short",
        year: "numeric",
    })} at ${formattedTime}`;
}
