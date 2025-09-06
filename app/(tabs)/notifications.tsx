import { FlatList, Pressable, Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Loader from "../components/loader";
import { Ionicons } from "@expo/vector-icons";
import {styles} from "@/styles/notifications.styles";
import { formatDistanceToNow } from "date-fns";

export default function Notifications(){
  const notifications = useQuery(api.notifications.getNotifications);
  
  if(!notifications) return <Loader />
  if(notifications.length === 0) return <NoNotificationsFound />
  
  return (
    <View style={styles.container}>
    <View style={styles.header}>
      <Text style={styles.headerTitle}> Notifications </Text>
    </View>
    <FlatList
      data={notifications}
      contentContainerStyle={styles.container}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => <NotificationsItem notification={item} />}
    />

  </View>);
}

function NotificationsItem ({notification}:any) {
  return (
    <View style={styles.notificationItem}>
      <View style={styles.notificationContent}>
        <Link href={`/user/${notification.sender._id}`} asChild>
          <TouchableOpacity style={styles.avatarContainer}>
            <Image
              source={{ uri: notification.sender.image }}
              style={styles.avatar}
              contentFit="cover"
              transition={200}
              cachePolicy="none" />
            <View style={styles.iconBadge}>
              {notification.type === "like" ? (
                <Ionicons size={14} name="heart" color={"green"} />
              ):(notification.type === "follow" ? (
                <Ionicons size={14} name="person-add" color={"#8b5cf6"} />
              ):(
                <Ionicons size={14} name="chatbubble" color={"#3b82f6"} />
              ))}
            </View>
          </TouchableOpacity>
        </Link>
        <View style={styles.notificationInfo}>
          <Link href={`/notifications`} asChild>
            <TouchableOpacity style={styles.avatarContainer}>
              <Text style={styles.username}>{notification.sender.username}</Text>
              
            </TouchableOpacity>
          </Link>
          <Text style={styles.action}>
            {notification.type === "like" ? (
              "liked your post"
            ):(notification.type === "follow" ? (
              "started following you"
            ):(
              `commented: "${notification.comment.content}" on your post`
            ))}</Text>
          <Text style={styles.timeAgo}>{formatDistanceToNow(notification._creationTime,{addSuffix:true})}</Text>
        </View>
        <Image
          source={{ uri: notification.post ? notification.post.imageUrl : "https://example.com/placeholder-image.jpg"}}
          style={styles.postImage}
          contentFit="cover"
          transition={200}
          cachePolicy="none" />
      </View>
    </View>
  );
}

const NoNotificationsFound = () => {
  return <View style={{
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:"black"
  }}>
    <Ionicons size={24} name="notifications-off" color={"green"} />
    <Text style={{color:"white"}}>No notifications found</Text>
  </View>
};
