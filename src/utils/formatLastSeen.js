export function formatLastSeen(timestamp) {
    if (!timestamp) return "";

    const now = new Date();
    const time = new Date(timestamp);
    const diff = Math.floor((now - time) / 1000);

    // Convert to hours & days
    const seconds = diff;
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(seconds / 3600);
    const days = Math.floor(seconds / 86400);

    // Format time for display
    const options = { hour: "2-digit", minute: "2-digit" };
    const formattedTime = time.toLocaleTimeString([], options);

    // ====== LOGIC =======

    if (seconds < 60) return "Active just now";

    if (minutes < 60) return `Active ${minutes} min${minutes > 1 ? "s" : ""} ago`;

    if (hours < 24) return `Active ${hours} hour${hours > 1 ? "s" : ""} ago`;

    if (days === 1) return `Active yesterday at ${formattedTime}`;

    // If same year: "Active on 12 Jan at 9:15 AM"
    if (now.getFullYear() === time.getFullYear()) {
        return `Active on ${time.getDate()} `
            + time.toLocaleString("en-US", { month: "short" })
            + ` at ${formattedTime}`;
    }

    // Different year:  
    // "Active on 12 Jan 2023 at 5:20 PM"
    return `Active on ${time.getDate()} `
        + time.toLocaleString("en-US", { month: "short", year: "numeric" })
        + ` at ${formattedTime}`;
}
