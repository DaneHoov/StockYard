export const getCSRFToken = async () => {
    const response = await fetch("/api/csrf/restore");
    const cookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith("csrf_token="));
    return cookie?.split("=")[1];
};
