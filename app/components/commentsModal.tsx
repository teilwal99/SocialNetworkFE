import { useAuth } from "@clerk/clerk-expo";
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
import styles from "@/styles/feed.styles";
import { Ionicons } from "@expo/vector-icons";
import { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Loader from "./loader";
import Comment from "./comment";

type CommentsModal = {
    postId: Id<"posts">;
    visible: boolean;
    onClose: () => void;
    onCommentAdded: () => void;
}

export default function CommentsModal({postId,visible,onClose,onCommentAdded}:CommentsModal) {
    const [newComment,setNewComment] = useState("");
    const comments = useQuery(api.comments.getComments,{postId});
    const addComments = useMutation(api.comments.createComments);

    const handleAddComment = async () => {
        if(!newComment.trim()){
            return;
        }

        try {
            await addComments({
                content: newComment,
                postId
            });

            setNewComment("");
            onCommentAdded();
        } catch (error) {
            console.error("error post new comment")
        }
    }

  return (
   <Modal visible={visible} onRequestClose={onClose} animationType="slide" transparent={true}>
        <KeyboardAvoidingView 
            behavior={Platform.OS === "android" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "android" ? 20 : 0}
            style={styles.modalContainer}
        >
            <View style={styles.modalHeader}>
                <TouchableOpacity onPress={onClose}>
                    <Ionicons size={24} name="close" color={"white"} />
                </TouchableOpacity>
                <Text style={styles.modalTitle}> Comments </Text>
                <View style={{ width: 24 }}></View>
            </View>

            {comments === undefined? (
                <Loader />
            ) : (
                <FlatList 
                data={comments}
                keyExtractor={(item) => item._id}
                renderItem={({item}) => <Comment comment={item}/>}
                contentContainerStyle={styles.commentsList}

                />
            )
            }
            <View style={styles.commentInput}>
                <TextInput 
                    style={styles.input}
                    placeholder="Add a comment"
                    placeholderTextColor={"black"}
                    value={newComment}
                    onChangeText={setNewComment}
                    multiline
                />
                <TouchableOpacity onPress={handleAddComment} disabled={!newComment.trim()}>
                    <Text style={[styles.postButton,!newComment.trim() && styles.postButtonDisabled] }>Post</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
   </Modal>
    
  );
}
