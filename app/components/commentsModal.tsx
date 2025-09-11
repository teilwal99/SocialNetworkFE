import { Link, Stack } from "expo-router";
import {
  StyleSheet,
  Image,
  Pressable,
  TouchableOpacity,
  Text,
  View,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import Loader from "./loader";
import Comment from "./comment";
import styles from "@/styles/feed.styles";
import { API_BASE } from "@/constants/api_base";
import { createComment, getComments } from "@/apis/comments";
import { useAuth } from "@/providers/AuthProvider";

type CommentsModal = {
  postId: number;
  visible: boolean;
  onClose: () => void;
  onCommentAdded: () => void;
};

export default function CommentsModal({
  postId,
  visible,
  onClose,
  onCommentAdded,
}: CommentsModal) {
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const {user,logout} = useAuth();
  if(!user){
    logout();
  }
  const fetchComments = async () => {
    try {
      setLoading(true);
      const data = await getComments(postId);
      setComments(data);
    } catch (err) {
      console.error("Error loading comments:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      if(!user)return;
      const data = await createComment({
        postId,
        author: user?.username,
        content: newComment,
      });

      setNewComment("");
      fetchComments(); // Refresh comments
      onCommentAdded();
    } catch (error) {
      console.error("Error posting new comment:", error);
    }
  };

  useEffect(() => {
    if (visible) {
      fetchComments();
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      animationType="slide"
      transparent={true}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "android" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "android" ? 20 : 0}
        style={styles.modalContainer}
      >
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons size={24} name="close" color={"white"} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Comments</Text>
          <View style={{ width: 24 }} />
        </View>

        {loading ? (
          <Loader />
        ) : (
          <FlatList
            data={comments}
            keyExtractor={(item) => item.id?.toString()}
            renderItem={({ item }) => <Comment comment={item} />}
            contentContainerStyle={styles.commentsList}
          />
        )}

        <View style={styles.commentInput}>
          <TextInput
            style={styles.input}
            placeholder="Add a comment"
            placeholderTextColor={"black"}
            value={newComment}
            onChangeText={setNewComment}
            multiline
          />
          <TouchableOpacity
            onPress={handleAddComment}
            disabled={!newComment.trim()}
          >
            <Text
              style={[
                styles.postButton,
                !newComment.trim() && styles.postButtonDisabled,
              ]}
            >
              Post
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
