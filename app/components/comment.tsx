import { useEffect, useState } from "react";
import {
  Image,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { formatDistanceToNow } from "date-fns";
import styles from "@/styles/feed.styles";
import { API_BASE } from "@/constants/api_base";

interface Comment {
  content: string;
  timestamp: string;
  user: {
    fullname?: string;
    image?: string;
  };
}

export default function Comment({ comment }: { comment: Comment }) {
  return (
    <View style={styles.commentContainer}>
      <Image source={{ uri: comment.user.image ? API_BASE + comment.user.image : API_BASE + "/media/avatar/default-avatar.png" }} style={styles.commentAvatar} />
      <View style={{ flex: 1, flexDirection: "column" }}>
        <Text style={styles.commentUsername}>{comment.user.fullname}</Text>
        <Text style={styles.commentText}>{comment.content}</Text>
        <Text style={styles.commentTime}>
          {formatDistanceToNow(comment.timestamp, { addSuffix: true })}
        </Text>
      </View>
    </View>
  );
}

export function CommentsList({ postId }: { postId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 20 }} />;
  }

  return (
    <FlatList
      data={comments}
      keyExtractor={(item, index) => `${index}`}
      renderItem={({ item }) => <Comment comment={item} />}
    />
  );
}