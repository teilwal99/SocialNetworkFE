import { fetchWithAuth } from "./headerAuth";

const API_BASE = "http://localhost:8081"; // Replace with your actual API base URL

// Utility to get the access token and attach it

// Create a comment
export const createComment = async ({
  postId,
  author,
  content,
}: {
  postId: number;
  author: string;
  content: string;
}) => {
  const res = await fetchWithAuth(`${API_BASE}/comments`, {
    method: "POST",
    body: JSON.stringify({ postId,author, content }),
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Failed to create comment: ${msg}`);
  }

  return res.json();
};

// Get all comments for a post, with user info
export const getComments = async (postId: number) => {
  const res = await fetchWithAuth(`${API_BASE}/comments/${postId}`);

  return res; // Should return array of comments with embedded user info
};
