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
} from "react-native";
import styles from "@/styles/feed.styles";
import { Ionicons } from "@expo/vector-icons";
import { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Loader from "./loader";
import {formatDistanceToNow} from "date-fns";


interface Comment {
    content:string;
    _creationTime:number;
    user:{
        fullname?: string;
        image?:string;
    }
}

export default function Comment({comment}: {comment: Comment}) {
  return (
    <View style={styles.commentContainer}>
        <Image source={{uri: comment.user.image}} style={styles.commentAvatar} />
        <View style={{flex:1, flexDirection:"column"}}>
            <Text style={styles.commentUsername}>{comment.user.fullname}</Text>
            <Text style={styles.commentText}>{comment.content}</Text>
            <Text style={styles.commentTime}>{formatDistanceToNow(comment._creationTime,{addSuffix:true})}</Text>

        </View>
    </View>
    
  );
}
