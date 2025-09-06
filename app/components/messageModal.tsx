import {
  StyleSheet,
  Image,
  Pressable,
  Text,
  View,
  Modal,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import Message from "./message";
import { styles } from "@/styles/profile.styles";
import { useAuth } from "@clerk/clerk-expo";
import { API_BASE } from "@/constants/api_base";

type MessageType = {
  id: string;
  type: "text" | "image";
  content: string;
  senderId: string;
  receiverId: string;
  createdAt: string;
};

type UserType = {
  id: string;
  username: string;
  // add other fields as needed
};

type MessagesModalProps = {
  senderId: string;
  receiverId: string;
  visible: boolean;
  onClose: () => void;
};

export default function MessagesModal({
  senderId,
  receiverId,
  visible,
  onClose,
}: MessagesModalProps) {
  const { userId } = useAuth();
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (visible) {
      fetchMessages();
      fetchCurrentUser();
    }
  }, [visible]);

  const fetchCurrentUser = async () => {
    try {
      if (!userId) return;
      const res = await fetch(`${API_BASE}/user/${userId}`);
      if (!res.ok) throw new Error("Failed to fetch current user");
      const data = await res.json();
      setCurrentUser(data);
    } catch (err) {
      console.error("Current user fetch error:", err);
    }
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${API_BASE}/messages?senderId=${senderId}&receiverId=${receiverId}`
      );
      if (!res.ok) throw new Error("Failed to fetch messages");
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error("Message fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const res = await fetch(`${API_BASE}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "text",
          content: newMessage,
          senderId,
          receiverId,
        }),
      });

      if (!res.ok) throw new Error("Failed to send message");

      setNewMessage("");
      fetchMessages(); // refresh messages
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <Modal visible={visible} onRequestClose={onClose} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === "android" ? "padding" : "height"}
        style={styles.modalContainer}
      >
        <View style={styles.header}>
          <Pressable onPress={onClose}>
            <Ionicons name="close" size={24} color="white" />
          </Pressable>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#fff" style={{ flex: 1 }} />
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Message message={item} currentUsername={currentUser?.username || ""} />
            )}
            ListEmptyComponent={<Text style={{ color: "#fff", textAlign: "center" }}>No messages yet.</Text>}
            style={styles.messageList}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
            onLayout={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
          />
        )}

        <View style={styles.messageInputContainer}>
          <TextInput
            style={[styles.input, { width: "85%" }]}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type a message..."
            placeholderTextColor="#aaa"
          />
          <Pressable onPress={handleSendMessage} style={{ marginLeft: 20 }}>
            <Ionicons name="send" size={24} color="white" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
