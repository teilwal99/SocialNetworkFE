import { getItem } from "../app/utils/Storage";
// Helper: GET with auth token
export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const token = await getItem("access_token");
    console.log("Using token:", token);
    if (!token) {
        throw new Error("No access token found");
    }

    const res = await fetch(`${url}`, {
        ...options,
        headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        },
    });

    if (res.status === 403) {
        console.error("Access denied: 403");
    }

    if (!res.ok) {
        const errorBody = await res.text();
        throw new Error(`API error ${res.status}: ${errorBody}`);
    }

    return res.json();
};

export const getAuthHeaders = async () => {
    const token = await getItem('access_token');
    if (!token) throw new Error('No access token found');
    return {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    };
};
