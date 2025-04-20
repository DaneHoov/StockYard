export const getCSRFToken = async () => {
    const response = await fetch("/api/csrf/restore");
    const data = await response.json();
    document.cookie = `csrf_token=${data.csrf_token}`;
    console.log("CSRF token fetched:", data.csrf_token); // Use the response for debugging
};
