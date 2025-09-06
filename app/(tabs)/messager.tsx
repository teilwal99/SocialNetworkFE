// app/messages/MessagePage.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,Image
} from 'react-native';
import { Message, Conversation } from '../type/message';
import { useRouter } from 'expo-router';
import { formatDistanceToNow } from 'date-fns';
import styles from '@/styles/feed.styles';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/providers/AuthProvider';
import { STORIES } from '@/constraints/mock-data';
import Story from '../components/story';
import { getFollowersMessagers } from '@/convex/users';



export default function Messager() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [followersMessages, setFollwersMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const {user} = useAuth();
  const StoriesSection = () => (
    <FlatList
      data={followersMessages}
      horizontal
      keyExtractor={(item) => item.id ? item.id.toString():""}
      showsHorizontalScrollIndicator={false}
      style={styles.storiesContainer}
      renderItem={({ item }) => <Story story={item} />}
    />
  );
  // Always run all hooks — don't return early above
  useEffect(() => {
    const fetchConversations = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);

        const data = await getFollowersMessagers(user.id);
        setFollwersMessages(data);
        // Transform data into Conversation[]
        const transformed: Conversation[] = data.map((item: any) => ({
          id: item.conversationId ?? 0, // fallback if null
          lastMessage: item.lastMessage ?? '',
          lastMessageTimestamp: item.lastMessageTimestamp ?? new Date().toISOString(),
          participants: [
            {
              id: item.followerId,
              fullname: item.fullname,
              username: item.username,
              profilePictureUrl: item.profilePictureUrl,
            },
            {
              id: user.id,
              fullname: user.fullname,
              username: user.username,
              profilePictureUrl: user.profilePictureUrl,
            },
          ],
        }));
        console.log("transform", transformed)
        setConversations(transformed);
      } catch (err) {
        console.error("Failed to fetch conversations", err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [user]);


  if (loading) return <Text>Loading...</Text>;
  if (!user) return <Text>User not found.</Text>;

  if (conversations.length === 0)
    return <Text style={{ padding: 20 }}>No conversations yet.</Text>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { router.back(); }}>
          <Ionicons size={28} name="arrow-back" color={Colors.light.tint} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}> Messager </Text>
        <View style={{ width: 28 }}></View>
      </View>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id? item.id.toString() : ""}
        ListHeaderComponent={() => <StoriesSection />}
        renderItem={({ item }: { item: Conversation }) => {
          const otherParticipant = item.participants.find(p => p.id !== user?.id);

          return (
            <TouchableOpacity
              onPress={() => {
                // router.push(`/chat/${otherParticipant?.id}`);
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 14,
                paddingHorizontal: 16,
                borderBottomWidth: 1,
                borderBottomColor: '#f0f0f0',
                backgroundColor: '#fff',
              }}
            >
              <Image
                source={{ uri: otherParticipant?.profilePictureUrl || 'http://localhost:8081/media/avatar/default-avatar.png' }}
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  marginRight: 14,
                  backgroundColor: '#e0e0e0',
                }}
              />

              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontWeight: 'bold',
                    fontSize: 16,
                    marginBottom: 2,
                    color: '#111',
                  }}
                >
                  {otherParticipant?.username ?? 'Unknown User'}
                </Text>

                <Text
                  numberOfLines={1}
                  style={{
                    color: '#666',
                    fontSize: 14,
                  }}
                >
                  {item.lastMessage ? `“${item.lastMessage}”` : 'No messages yet'}
                </Text>
              </View>

              <Text
                style={{
                  fontSize: 12,
                  color: '#999',
                  marginLeft: 12,
                }}
              >
                {item.lastMessageTimestamp
                  ? formatDistanceToNow(new Date(item.lastMessageTimestamp), { addSuffix: true })
                  : ''}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
  </View>
  );
}
