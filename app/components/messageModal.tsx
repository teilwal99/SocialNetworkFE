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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Id } from "@/convex/_generated/dataModel";
import { useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Message from "./message";
import { styles } from "@/styles/profile.styles";
import { useAuth } from "@clerk/clerk-expo";

type MessagesModalProps = {
  senderId: Id<"users">;
  receiverId: Id<"users">;
  visible: boolean;
  onClose: () => void;
};



export default function MessagesModal({ senderId, receiverId, visible, onClose }: MessagesModalProps) {
  const {signOut, userId} = useAuth();
  const currentUser = useQuery(api.users.getUserByClerkId,{clerkId:userId || "skip"});
  const [newMessage, setNewMessage] = useState("");
  const messages = useQuery(api.messages.getMessages, { senderId, receiverId });
  const sendMessage = useMutation(api.messages.sendMessages);
  const flatListRef = useRef<FlatList>(null);
  const handleSendMessage = async () => {
      if (!newMessage.trim()) return;

      try {
          await sendMessage({
              type: "text",
              content: newMessage,
              senderId,
              receiverId,
          });
          setNewMessage("");
      } catch (error) {
          console.error("Error sending message:", error);
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

              <FlatList
                  ref={flatListRef}
                  data={messages}
                  keyExtractor={(item) => item._id}
                  renderItem={({ item }) => <Message message={item} currentUsername={currentUser?.username}  />}
                  ListEmptyComponent={<Text>No messages yet.</Text>}
                  style={styles.messageList}
                  onContentSizeChange={() =>
                    flatListRef.current?.scrollToEnd({ animated: true })
                  }
                  onLayout={() =>
                    flatListRef.current?.scrollToEnd({ animated: true })
                  }
              />

              <View style={styles.messageInputContainer}>
                  <TextInput
                      style={[styles.input, {width:"85%"}]}
                      value={newMessage}
                      onChangeText={setNewMessage}
                      placeholder="Type a message..."
                  />
                  <Pressable onPress={handleSendMessage} style={{marginLeft:20}}>
                      <Ionicons name="send" size={24} color="white" />
                  </Pressable>
              </View>
          </KeyboardAvoidingView>
      </Modal>
  );
}
