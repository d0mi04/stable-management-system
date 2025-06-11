export const apiFetch = async (url, options = {}) => {
    const token = localStorage.getItem('token');

    return fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...apiFetch(options.headers || {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });
};