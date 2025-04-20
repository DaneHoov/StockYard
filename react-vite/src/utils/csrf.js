export const getCSRFToken = async () => {
    const response = await fetch("/api/csrf/restore");
    if (!response.ok) {
        console.error("Failed to fetch CSRF token");
        return null;
    }
    const cookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith("csrf_token="));
    return cookie?.split("=")[1];
};
