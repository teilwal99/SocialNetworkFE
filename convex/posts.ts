import { API_BASE } from "../constants/api_base";
import { getItem } from "../app/utils/Storage";

export const getAccessToken = async () => {
  const token = await getItem("access_token");
  if (!token) {
    throw new Error("No access token found");
  }
  return token;
};
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

// Get user from token
export const getCurrentUserPost = async () => {
  return fetchWithAuth(`${API_BASE}/users/me`);
};

// Generate upload URL
export const generateUploadUrl = async () => {
  const token = await getAccessToken();
  const res = await fetch(`${API_BASE}/upload-url`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to get upload URL");
  return res.json(); // { url: string }
};

// Create post
export const createPost = async (
  payload: { media?: string; content?: string; author: string|null } 
) => {
  const token = await getAccessToken();
  const res = await fetch(`${API_BASE}/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create post");
  return res.json();
};

// Get feed posts
export const getFeedPost = async () => {
  return fetchWithAuth(`${API_BASE}/posts`);
};

// Like or unlike a post
export const likePost = async (postId: number, userId: number, reactionType: string = "like") => {
  const token = await getAccessToken();

  const res = await fetch(`${API_BASE}/reactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      userId,
      postId,
      reactionType,
    }),
  });

  if (!res.ok) return null;
  
  return res.json(); // returns the saved or updated Reaction object
};


// Delete post
export const deletePost = async ( postId: number) => {
  const token = await getAccessToken();
  const res = await fetch(`${API_BASE}/posts/${postId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to delete post");
  return res.json();
};

// Get posts by user (optional userId, otherwise gets current user)
export const getPostsByUser = async ( username?: string) => {
  const url = username
    ? `${API_BASE}/posts/user/${username}`
    : `${API_BASE}/posts/me`;
  return fetchWithAuth(url);
};

type UploadMediaType = "post" | "avatar" | "comment";

export const uploadMedia = async (
  fileUri: string,
  type: UploadMediaType,
  filename?: string
): Promise<string> => {
  const token = await getAccessToken();

  // Fetch the file as a blob
  const response = await fetch(fileUri);
  const blob = await response.blob();

  // Use provided filename or fallback to timestamp-based one
  const fileExtension = blob.type.split("/")[1] || "jpg";
  const finalFilename = filename || `upload_${type}_${Date.now()}.${fileExtension}`;

  const formData = new FormData();
  formData.append("file", new File([blob], finalFilename, { type: blob.type }));

  // Use dynamic upload type in the URL
  const res = await fetch(`${API_BASE}/media/upload/${type}`, {
    method: "POST",
    body: formData,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Media upload failed: ${errorText}`);
  }

  return await res.text(); // Or `res.json().url` depending on your backend
};


export const getReaction = async (postId: number) => {
  return fetchWithAuth(`${API_BASE}/reactions/post/${postId}`);
}