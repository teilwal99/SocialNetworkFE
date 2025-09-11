import { API_BASE } from "../constants/api_base";
import { fetchWithAuth, getAuthHeaders } from "./headerAuth";
import SockJS from "sockjs-client";
import Stomp from "stompjs";

// ✅ REST API: Fetch notifications for a receiver
export const fetchNotificationsByUser = async (
  userId: number
): Promise<Notification[]> => {
  const res = await fetchWithAuth(
    `${API_BASE}/notifications/receiver/${userId}`
  );
  console.log("fetchNotificationsByUser fetch:", res);
  
  return res;
};

// ✅ REST API: Mark notification as read
export const markNotificationAsRead = async (
  notificationId: number
): Promise<Notification> => {
  const res = await fetchWithAuth(
    `${API_BASE}/notifications/${notificationId}/read`,
    { method: "PUT" }
  );
  return res;
};

// ✅ REST API: Delete a notification
export const deleteNotification = async (notificationId: number) => {
  const res = await fetchWithAuth(
    `${API_BASE}/notifications/${notificationId}`,
    { method: "DELETE" }
  );

  if (!res.ok) {
    throw new Error(
      `Failed to delete notification: ${res.status} ${res.statusText}`
    );
  }
  return true;
};

// =====================
// 🔹 WebSocket / STOMP
// =====================
let stompClient: any = null;
let stompConnected: Promise<void> | null = null;

/**
 * Connect WebSocket and subscribe to notifications
 */
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

/**
 * Send a notification over WebSocket
 */
export const sendNotificationWS = async (notification: any) => {
  if (!stompConnected) {
    console.warn("WebSocket not initialized, call connectWebSocket first");
    return false;
  }

  await stompConnected;
  console.log("📤 Sending notification:", notification);

  // ✅ match your backend's STOMP endpoint
  stompClient.send("/app/notifications", {}, JSON.stringify(notification));
  return true;
};

export const sendNotification = async (
  notification: any
) => {
  
  if(await sendNotificationWS(notification)) {
    return {
      ...notification,
      id: Date.now(), // temp ID
      timestamp: new Date().toISOString(),
    };
  }
  else {
    connectWebSocket(() => {}).then(() => {
      sendNotificationWS(notification);
    });
    return {
      ...notification,
      id: Date.now(), // temp ID
      timestamp: new Date().toISOString(),
    };  
  }
};