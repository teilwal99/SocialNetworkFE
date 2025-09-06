export interface User {
  id: number;
  username: string;
  email?: string;
  profilePictureUrl: string;
  fullname?: string;
  bio?: string;
  timestamp?: string;
  followers?: number;
  following?: number;
  postsCount?: number;
}