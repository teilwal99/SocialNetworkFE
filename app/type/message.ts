import { User } from "./user";

export interface Message {
  id: number;
  sender: number;
  receiver: number;
  content: string;
  timestamp: string; // ISO date string
}

export interface Conversation {
  participants: Profile[];

  id: number | null;
  lastMessage: string | null;
  lastMessageTimestamp: string | null; // ISO 8601 format (e.g. 2023-01-01T12:00:00Z)
  unreadCount: number;
}

export interface Profile {
  id: number;
  fullname: string;
  username: string;
  profilePictureUrl: string;
}