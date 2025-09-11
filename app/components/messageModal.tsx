import {
  StyleSheet,
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
import { API_BASE } from "@/constants/api_base";
import { fetchMessages, sendMessage } from "@/apis/messages";
import { useAuth } from "@/providers/AuthProvider";
import { Conversation, MessageCreateProps, MessageProps, Profile } from "../type/message";

type MessagesModalProps = {
  sender: Profile | null;
  receiver: Profile | null;
  visible: boolean;
  onClose: () => void;
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
};

export default function MessagesModal({
  sender,
  receiver,
  visible,
  onClose,
  setConversations,
}: MessagesModalProps) {
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  const { user } = useAuth(); // ✅ get current user
  if (!sender) return null; // ✅ ensure sender is defined
  useEffect(() => {
    if (visible && receiver) {
      fetchMessagesData();
    }
  }, [visible, receiver]);

  const fetchMessagesData = async () => {
    if (!receiver) return;
    setLoading(true);
    try {
      const data = await fetchMessages(sender.id, receiver.id);
      setMessages(data);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !receiver || !sender) return;

    try {
      // 1. Build optimistic message as MessageProps
      const optimisticMsg: MessageProps = {
        id: Date.now(), // temp ID
        sender,
        receiver,
        content: newMessage.trim(),
        timestamp: new Date().toISOString(),
      };

      // 2. Optimistically update UI
      setMessages((prev) => [...prev, optimisticMsg]);
      setConversations(prev => {
        const convoIndex = prev.findIndex(c =>
          c.participants.some(p => p.id === receiver.id)
        );
        if (convoIndex !== -1) {
          const updatedConvo = { ...prev[convoIndex] };
          updatedConvo.lastMessage = optimisticMsg.content;
          updatedConvo.lastMessageTimestamp = optimisticMsg.timestamp;
          return [
            updatedConvo,
            ...prev.filter((_, i) => i !== convoIndex)
          ];
        }
        return prev;
      });
      setNewMessage("");

      // 3. Send message via WS (don’t await, WS will echo back real one)
      sendMessage({
        senderId: sender.id,
        receiverId: receiver.id,
        content: optimisticMsg.content,
      });

    } catch (err) {
      console.error("Error sending message:", err);
    }
  };



  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      animationType="slide"
      transparent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "android" ? "padding" : "height"}
        style={styles.modalContainer}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={onClose}>
            <Ionicons name="close" size={24} color="white" />
          </Pressable>
        </View>

        {/* Messages */}
        {loading ? (
          <ActivityIndicator size="large" color="#fff" style={{ flex: 1 }} />
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <Message
                message={item}
                sender={sender}
                receiver={receiver}
              />
            )}
            ListEmptyComponent={
              <Text style={{ color: "#fff", textAlign: "center" }}>
                No messages yet.
              </Text>
            }
            style={styles.messageList}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
            onLayout={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
          />
        )}

        {/* Input */}
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
