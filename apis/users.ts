import { getItem } from "../app/utils/Storage";
import {API_BASE} from "../constants/api_base";
import { fetchWithAuth } from "./headerAuth";
import {getAccessToken } from "./posts";

// Helper: GET with Bearer token

// Get current user
export const getCurrentUser = async () => {
  const token = await getAccessToken();
  return fetchWithAuth(`${API_BASE}/users/me`);
};
// fetch user with auth by ID
export const getUserById = async (userId: string | string[]) => {
  const token = await getAccessToken();
  return fetchWithAuth(`${API_BASE}/users/${userId}`);
};
// Register a new user
export const createUser = async (userData: {
  name: string;
  email: string;
  providerId: string;
  avatarUrl?: string;
}) => {
  const res = await fetch(`${API_BASE}/user`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  if (!res.ok) throw new Error('Failed to create user');
  return res.json();
};

// Update user profile
export const updateUser = async (id: number,
  data: {
    fullname?: string;
    bio?: string;
  }
) => {
  const token = await getAccessToken();
  const res = await fetch(`${API_BASE}/users/${id}/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update user');
  return res.json();
};

// Update user avatar
export const updateAvatar = async (avatarUrl: string,userId: number) => {
  const token = await getAccessToken();
  const res = await fetch(`${API_BASE}/users/${userId}/avatar`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({image: avatarUrl }),
  });
  if (!res.ok) throw new Error('Failed to update avatar');
  return;
};

// Toggle follow
export const toggleFollow = async (requesterId: number|undefined, targetId: number) => {
  const token = await getAccessToken();

  const res = await fetch(`${API_BASE}/follows`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ requesterId, targetId }), // match the DTO
  });

  if (!res.ok) throw new Error('Failed to toggle follow');

  const data = await res.json();
  return data.isFollowing;
};

// Get follow status
export const checkFollowStatus = async (targetId: number) => {
  const token = await getAccessToken();
  const res = await fetch(`${API_BASE}/follows/status/${targetId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Failed to check status');
  const data = await res.json();
  return data.isFollowing;
};

// Get followers of a user
export const getFollowersMessagers = async (userId: number) => {
  const token = await getAccessToken();
  return await fetchWithAuth(`${API_BASE}/messages/followers/${userId}`);
};

// Get following users
export const getFollowing = async (userId: string) => {
  const res = await fetch(`${API_BASE}/follows/following/${userId}`);
  if (!res.ok) throw new Error('Failed to get following');
  return res.json();
};
