import {  Pressable, Text, TouchableOpacity, View } from "react-native";
import { Image, } from "expo-image";
import styles  from "@/styles/feed.styles";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import * as FileSystem from "expo-file-system";
import { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import CommentsModal from "./commentsModal";
import { bookmarkPost } from "@/convex/bookmarks";
import { getCurrentUser, getUserByClerkId } from "@/convex/users";
import { useUser } from "@clerk/clerk-expo";
import { deletePost } from "@/convex/posts";

type ProsPosts = {
  post: {
    _id: Id<"posts">;
    imageUrl: string;
    caption?: string;
    likes: number;
    comments: number;
    _creationTime: number; 
    isLiked: boolean;
    isBookmark: boolean; 
    author: {
      _id: string; 
      image: string;
      username?: string; 
    };
  };
};


export default function Post ({post}: ProsPosts) {
  console.log("post",post);
  const [isLike,setIsLiked] = useState(post.isLiked);
 
  const [likesCount,setLikesCount] = useState(post.likes);
  const [commentsCount,setCommentsCount] = useState(post.comments);
  const [showComments,setShowComments] = useState(false);
  const [isBookmark, setIsBookmark] = useState(post.isBookmark);

  const likePost = useMutation(api.posts.likePost);
  const bookmarkPost = useMutation(api.bookmarks.bookmarkPost);
  const {user} = useUser();

  const currentUser = useQuery(api.users.getUserByClerkId,user?{clerkId:user?.id}: "skip")
  
  const handleLike = async () => {
    try {
      const newLike = await likePost({postId:post._id});
      setIsLiked(newLike);
      setLikesCount(newLike?likesCount+1:likesCount-1);
    } catch (error) {
      console.log("Error in liking post", error);
    }
  };

  const handlebookmark = async () => {
    try {
      const newIsBookmark = await bookmarkPost({postId:post._id});
      setIsBookmark(newIsBookmark);
      
    } catch (error) {
      console.log("Error in bookmarking post", error);
    }
  };
  const deletePost = useMutation(api.posts.deletePost);
  const handleDelete = async () => {
    try {
      await deletePost({postId:post._id});
      
    } catch (error) {
      console.log("Error in deleting post", error);
    }
  };

  return (
  <View style={styles.post}> 
    <View style={styles.postHeader}>
      <Link href={currentUser?._id === post.author._id ? "/(tabs)/profile" : `/user/${post.author._id}`} asChild >
        <TouchableOpacity style={styles.postHeaderLeft}>
          <Image 
            source={{ uri: post.author?.image }} 
            style={styles.postAvatar} 
            contentFit="cover" 
            transition={200} 
            cachePolicy="memory-disk"
          />
          <Text style={styles.postUsername}>{post.author?.username}</Text>
        </TouchableOpacity>
      </Link>
      
      {post.author._id !== currentUser?._id ?(
      <TouchableOpacity>
        <Ionicons name="ellipsis-horizontal" size={20} color="white" />
      </TouchableOpacity>): 
      (<TouchableOpacity onPress={handleDelete}>
        <Ionicons name="trash-outline" size={20} color="white"  />
      </TouchableOpacity>)}
      
    </View>
    
    <Image 
      key={post._id} 
      source={{ uri: post.imageUrl }} 
      style={styles.postImage} 
      contentFit="cover"
      transition={200}
      cachePolicy="memory-disk"
    />

    {/*Posts action*/}
    <View style={styles.postActions}> 
      <View style={styles.postActionsLeft}>
        <TouchableOpacity onPress={handleLike}>
          <Ionicons name={isLike ?"heart":"heart-outline"} size={24} color={isLike?"green":"white"}  />
        </TouchableOpacity> 
        <TouchableOpacity onPress={()=>setShowComments(true)}>
          <Ionicons name="chatbubble-outline" size={22} color="white"  />
        </TouchableOpacity> 
        <TouchableOpacity  onPress={handlebookmark}>
          <Ionicons name={isBookmark?"bookmark":"bookmark-outline"} size={24} color={isBookmark?"green":"white"}   />
        </TouchableOpacity> 
      </View>
      
    </View>   

    {/*Posts info*/}
    <View style={styles.postInfo}> 
      <Text style={styles.likesText}>
        {likesCount>0?`${likesCount.toLocaleString()} likes`:`Be the first to like`}
      </Text>
      {post.caption && (
        <View style={styles.captionContainer}>
          <Text style={styles.captionUsername}>{post.author.username}</Text>
          <Text style={styles.captionText}>{post.caption}</Text>
        </View>
      )}

        <TouchableOpacity onPress={()=>setShowComments(true)}>
          <Text style={styles.commentText}>{post.comments?`View ${post.comments} comments`:`Add a comment` }</Text>
        </TouchableOpacity> 
        <Text style={styles.timeAgo}> 2 hours ago </Text>
    </View>  
    <CommentsModal 
      postId={post._id}
      visible={showComments}
      onClose={() => setShowComments(false)}
      onCommentAdded={() => setCommentsCount((prev) => prev+1)}
    />
    
  </View>);
}
