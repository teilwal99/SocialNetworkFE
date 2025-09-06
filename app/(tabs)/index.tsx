import { useEffect, useState } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, Text, View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from "@/styles/feed.styles";
import Loader from '../components/loader';
import Post from '../components/post';
import { API_BASE } from '@/constants/api_base';
import { useRouter } from 'expo-router';
import { getFeedPost } from '@/convex/posts';
import { deleteItem } from '../utils/Storage';
import { useAuth } from '@/providers/AuthProvider';

export default function Index() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const { isSignedIn, isLoaded, token, logout } = useAuth();

  useEffect(() => {
    const runFeedPost = async () => {
      if (!isSignedIn) {
        router.replace("/login");
        return;
      }

      try {
        setLoading(true);
        const data = await getFeedPost(); // use token from context
        console.log("Fetched posts:", data);
        setPosts(data);
      } catch (error: any) {
        const message = error?.response?.data?.message || error?.message || "";
        console.error("Fetch error:", message);

        if (message.includes("403") || message.includes("No access token")) {
          await logout(); // centralized logout
          router.replace("/login");
        } else {
          alert("Failed to load posts.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (isLoaded) {
      runFeedPost();
    }
  }, [isLoaded, isSignedIn]);

  if (!isLoaded || loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  /* if (loading) return <Loader />; */

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>spotlight</Text>
        <TouchableOpacity onPress={logout}>
          <Ionicons size={24} name="log-out-outline" color="green" />
        </TouchableOpacity>
      </View>
      {posts.length === 0 ? <NoPostsFound />
      :  <FlatList
        data={posts}
        keyExtractor={(item) => item._id?.toString() || item.id?.toString()}
       /*  ListHeaderComponent={() => <StoriesSection />} */
        renderItem={({ item }) => <Post post={item} />}
        showsVerticalScrollIndicator={false}
      />
    }
      
    </View>
  );
}

const NoPostsFound = () => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'black' }}>
    <Text style={{ color: 'white' }}>No posts found</Text>
  </View>
);
