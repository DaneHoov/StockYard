export const fetchAPI = async (url, options = {}) => {
    const response = await fetch(url, options);
    if (!response.ok) {
        throw new Error("API request failed");
    }
    return response.json();
};
