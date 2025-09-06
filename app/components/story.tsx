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
import { Conversation } from "../type/message";

export default function Story({ story }: any) {
  return (
    <TouchableOpacity style={styles.storyWrapper}>
      <View style={[styles.storyRing]}>
        <Image source={{ uri:story.profilePictureUrl?
           "http://locahost:8081" + story.profilePictureUrl : 
           "http://localhost:8081/media/avatar/default-avatar.png"  }} 
          style={styles.storyAvatar} />
      </View>
      <Text style={styles.storyUsername}>{story.username}</Text>
    </TouchableOpacity>
  );
}
