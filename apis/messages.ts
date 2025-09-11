import { API_BASE } from '../constants/api_base';
import { getItem } from '../app/utils/Storage';
import { MessageProps, Conversation, MessageCreateProps } from '../app/type/message';
import { getAuthHeaders } from './headerAuth';
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import { sendNotification } from './notifications';

export const fetchConversationsByUser = async (userId: number): Promise<Conversation[]> => {
  const res = await fetch(`${API_BASE}/conversations/user/${userId}`, {
    headers: await getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch messages: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  console.log("fetchConversationsByUser response:", data);
  return data;
};

export const fetchMessages = async (
  sender: number,
  receiver: number
): Promise<MessageProps[]> => {
  try {
    const res = await fetch(
      `${API_BASE}/messages/conversation?sender=${sender}&receiver=${receiver}`,
      {
        headers: await getAuthHeaders(),
      }
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch messages: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    console.log("fetchMessages data:", data);
    return Array.isArray(data) ? data : data.messages || [];
  } catch (err) {
    console.error("fetchMessages error:", err);
    return [];
  }
};
let stompClient: any = null;
let stompConnected: Promise<void> | null = null;
const connectWebSocket = async (onMessage: (msg: any) => void) => {
    const socket = new WebSocket("ws://localhost:8081/ws-mysocial");
    stompClient = Stomp.over(socket);

    const headers = await getAuthHeaders(); // ✅ resolve async before use

    stompConnected = new Promise((resolve, reject) => {
        stompClient.connect(
        headers, // ✅ now it’s an object
        (frame: any) => {
            console.log("✅ STOMP connected:", frame);

            stompClient.subscribe("/topic/messages", (message: any) => {
            onMessage(JSON.parse(message.body));
            });

            resolve();
        },
        (error: any) => {
            console.error("❌ STOMP error:", error);
            reject(error);
        }
        );
    });

    return stompConnected; // let caller await if they want
};

export const sendMessageWS = async (message: any) => {
  if (!stompConnected) {
    console.warn("WebSocket not initialized");
    return false;
  }

  await stompConnected; // ✅ wait until connected
  console.log("Sending message ws:", message);
  stompClient.send("/app/chat.send", {}, JSON.stringify(message));
  return true;
};

export const sendMessage = async (
  message: Omit<MessageCreateProps, "id" | "timestamp">
) => {
  
  if(await sendMessageWS(message)) {
    return {
      ...message,
      id: Date.now(), // temp ID
      timestamp: new Date().toISOString(),
    };
  }
  else {
    connectWebSocket(() => {}).then(() => {
      sendMessageWS(message);
    });

    if(message.content !== ""){
      await sendNotification({
        type: "message",
        data: message.content,
        receiverId: message.receiverId, // owner of the post
        senderId: message.senderId,
      });
    }

    return {
      ...message,
      id: Date.now(), // temp ID
      timestamp: new Date().toISOString(),
    };  
  }
};