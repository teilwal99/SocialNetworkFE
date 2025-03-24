import { useAuth } from "@clerk/clerk-expo";
import { Link, Stack } from "expo-router";
import {
  StyleSheet,
  Image,
  Pressable,
  TouchableOpacity,
  Text,
  View,
} from "react-native";
import styles from "@/styles/feed.styles";
import { Ionicons } from "@expo/vector-icons";

export type StoryType = {
  id: string;
  username: string;
  avatar: string;
  hasStory: boolean;
};

export default function Story({ story }: { story: StoryType }) {
  return (
    <TouchableOpacity style={styles.storyWrapper}>
      <View style={[styles.storyRing, !story.hasStory && styles.noStory]}>
        <Image source={{ uri: story.avatar }} style={styles.storyAvatar} />
      </View>
      <Text style={styles.storyUsername}>{story.username}</Text>
    </TouchableOpacity>
  );
}
