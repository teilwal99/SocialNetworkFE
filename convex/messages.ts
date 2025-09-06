import { API_BASE } from '../constants/api_base';
import { getItem } from '../app/utils/Storage';
import { Message, Conversation } from '../app/type/message';

const getAuthHeaders = async () => {
  const token = await getItem('access_token');
  if (!token) throw new Error('No access token found');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export const fetchConversations = async (userId: number): Promise<Conversation[]> => {
  const res = await fetch(`${API_BASE}/conversations/user/${userId}`, {
    headers: await getAuthHeaders(),
  });
  return res.json();
};

export const fetchMessages = async (sender: number, receiver: number): Promise<Message[]> => {
  const res = await fetch(`${API_BASE}/messages/conversation?sender=${sender}&receiver=${receiver}`, {
    headers: await getAuthHeaders(),
  });
  return res.json();
};

export const sendMessage = async (message: Omit<Message, 'id' | 'timestamp'>): Promise<Message> => {
  const res = await fetch(`${API_BASE}/messages/send`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify(message),
  });
  return res.json();
};
