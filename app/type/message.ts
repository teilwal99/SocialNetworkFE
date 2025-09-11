import { User } from "./user";

export interface MessageProps {
  id: number;
  content: string;
  timestamp: string; // ISO date string
  sender: Profile;
  receiver: Profile;
  
}
export interface MessageCreateProps {
  senderId: number;
  receiverId: number;
  content: string;
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