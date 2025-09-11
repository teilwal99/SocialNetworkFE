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
import { useAuth } from "@/providers/AuthProvider";

export default function Story(consProp : { cons: Conversation}) {
  console.log("Story consProp:", consProp.cons);
  const {user} = useAuth();
  const storyProfile = consProp?.cons.participants?.find(p => p.id !== user?.id); 
  if(!storyProfile) return null;
  return (
    <TouchableOpacity style={styles.storyWrapper}>
      <View style={[styles.storyRing]}>
        <Image source={{ uri:storyProfile.profilePictureUrl?
           "http://localhost:8081" + storyProfile.profilePictureUrl : 
           "http://localhost:8081/media/avatar/default-avatar.png"  }} 
          style={styles.storyAvatar} />
      </View>
      <Text style={styles.storyUsername}>{storyProfile.username}</Text>
    </TouchableOpacity>
  );
}
