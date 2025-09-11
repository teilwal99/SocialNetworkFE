import { FlatList, Pressable, Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { Link } from "expo-router";
import Loader from "../components/loader";
import { Ionicons } from "@expo/vector-icons";
import {styles} from "@/styles/notifications.styles";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { fetchNotificationsByUser, markNotificationAsRead } from "@/apis/notifications";
import { API_BASE } from '../../constants/api_base';

export default function Notifications(){
  const [notifications, setNotifications] = useState<any[] | null>(null);
  const {user} = useAuth();

  useEffect(() => {
    if(!user?.id) return;
    const fetchNotifications = async () => {
      try {
        fetchNotificationsByUser(user.id).then(data => {
          console.log("Fetched notifications:", data);
          setNotifications(data);
        }).catch(err => {
          console.error("Error fetching notifications:", err);
          setNotifications([]);
        });
      } catch (err) {
        console.error("Error in fetchNotifications:", err);
        setNotifications([]);
      }
    };

    fetchNotifications();
  }, [user?.id]);

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
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <NotificationsItem notification={item} />}
    />

  </View>);
}

function NotificationsItem ({notification}:any) {
  return (
    <View style={styles.notificationItem}>
      <Link
        href={
          notification.type === "like" || notification.type === "comment"
            ? "/(tabs)" // later: `/post/${notification.post?.id}`
            : notification.type === "message"
            ? "/messager"
            : notification.type === "follow"
            ? `/user/${notification.sender?.id}`
            : "/notifications"
        }
        asChild
      >
        <TouchableOpacity
          onPress={async () => {
            if (!notification.status) {
              await markNotificationAsRead(notification.id);
            }
          }}
        >
          <View style={styles.notificationContent}>
            <Link href={`/user/${notification.sender?.id}`} asChild>
              {
                notification.sender ? 
                <TouchableOpacity style={styles.avatarContainer}>
                  <Image
                    source={{ uri: API_BASE + notification.sender.profilePictureUrl }}
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
                </TouchableOpacity> : null
              }
              
            </Link>
            <View style={styles.notificationInfo}>
              <Link href={`/notifications`} asChild>
                <TouchableOpacity style={styles.avatarContainer}>
                  <Text style={styles.username}>{notification.sender?.username}</Text>
                  
                </TouchableOpacity>
              </Link>
              <Text style={styles.action}>
                {getNotificationMessage(notification)}</Text>
              <Text style={styles.timeAgo}>{notification._creationTime ? formatDistanceToNow(notification._creationTime,{addSuffix:true}) : null}</Text>
            </View>
            <Image
              source={{ uri: notification.post ? notification.post.imageUrl : "https://example.com/placeholder-image.jpg"}}
              style={styles.postImage}
              contentFit="cover"
              transition={200}
              cachePolicy="none" />
          </View>
        </TouchableOpacity>
      </Link>
      
    </View>
  );
}

const NoNotificationsFound = () => {
  return <View style={{
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:"black",
  }}>
    <Ionicons size={24} name="notifications-off" color={"green"} />
    <Text style={{color:"white"}}>No notifications found</Text>
  </View>
};

function getNotificationMessage(notification: any) {
  switch (notification.type) {
    case "like":
      return "liked your post";
    case "follow":
      return "started following you";
    case "comment":
      return `commented: "${notification.data}" on your post`;
    case "message":
      return `sent you a message: "${notification.data ?? ""}"`;
    case "post":
      return "created a new post";
    case "reminder":
      return `reminder: ${notification.data || "check your activity"}`;
    default:
      return "did something";
  }
}