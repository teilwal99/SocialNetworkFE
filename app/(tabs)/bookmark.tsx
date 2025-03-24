import { FlatList, Pressable, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";

import { Link } from "expo-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Loader from "../components/loader";
import styles from "@/styles/feed.styles";

export default function Bookmark(){
  const bookmarkedPosts = useQuery(api.bookmarks.getBookmarks);

  if(!bookmarkedPosts) return <Loader />
  if(bookmarkedPosts.length === 0) return <NoBookmarkFound />
  console.log(bookmarkedPosts);
  return (
  <View style={styles.container}>
    <View style={styles.header}>
      <Text style={styles.headerTitle}> bookmarks </Text>
    </View>
    <FlatList
      data={bookmarkedPosts}
      style={{width: "100%"}}
      keyExtractor={(item) => item._id}
      numColumns={2} // Creates a 2-column grid
      columnWrapperStyle={styles.bookmarkContainer} // Ensures proper spacing between columns
      renderItem={({ item }) => (
        <Image 
          source={{ uri: item.imageUrl }} 
          style={styles.imageBookmark}
          contentFit="cover"
          transition={200}
          cachePolicy="none"
        />
      )}
    />
  </View>);
}

const NoBookmarkFound = () => {
  return <View style={{
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:"black"
  }}>
    <Text style={{color:"green"}}>No bookmarked posts found</Text>
  </View>
};
