import {  Dimensions, Pressable, Text, TouchableOpacity, View } from "react-native";
import { Image, } from "expo-image";
import styles  from "@/styles/feed.styles";
import { Link, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import * as FileSystem from "expo-file-system";
import { useMutation, useQuery } from "convex/react";
import CommentsModal from "./commentsModal";
import { bookmarkPost } from "@/apis/bookmarks";
import { likePost, deletePost, getReaction } from "@/apis/posts";
import { User } from "../type/user";
import { useAuth } from "@/providers/AuthProvider";

type PostProps = {
  post: {
    id: number;
    imageUrl: string;
    caption?: string;
    likes: number;
    comments: number;
    creationTime: number;
    isLiked: boolean;
    isBookmark: boolean;
    author: {
      _id: number;
      username?: string;
      image: string;
    };
  };
};

type ReactionType = "like" | "love" | "haha";

const reactionIconMap: Record<ReactionType, { icon: string; filledIcon: string }> = {
  like: { icon: "thumbs-up-outline", filledIcon: "thumbs-up" },
  love: { icon: "heart-outline", filledIcon: "heart" },
  haha: { icon: "happy-outline", filledIcon: "happy" },
};

const { width } = Dimensions.get("window");
const reactionTypes = ["like", "love", "haha"] as const;

export default function Post({ post }: PostProps) {
  const [userReaction, setUserReaction] = useState<"like" | "love" | "haha" | null>(null);
  const [reactionCounts, setReactionCounts] = useState<Record<string, number>>({
    like: 0,
    love: 0,
    haha: 0,
  });
  const [commentsCount, setCommentsCount] = useState(post.comments);
  const [showComments, setShowComments] = useState(false);
  const [isBookmark, setIsBookmark] = useState(post.isBookmark);
  const [imageHeight, setImageHeight] = useState<number | null>(null);
  const [likesCount, setLikesCount] = useState<number>(0);
  const { user, logout } = useAuth();

  if(!user){logout();}

  const fetchReaction = async (user: any) => {
    const postReactions = await getReaction(post.id);

    // find user's reaction
    const userReacted = postReactions.reactions.find(
      (reaction: any) => reaction.user.fullname === user.fullname
    );
    setUserReaction(userReacted?.reactionType ?? null);

    if (postReactions?.counts) {
      setReactionCounts({
        like: postReactions.counts.like ?? 0,
        love: postReactions.counts.love ?? 0,
        haha: postReactions.counts.haha ?? 0,
      });

      const total =
        (postReactions.counts.like ?? 0) +
        (postReactions.counts.love ?? 0) +
        (postReactions.counts.haha ?? 0);

      setLikesCount(total);
    }
  };


  useEffect(() => {
    (async () => {
      
      await fetchReaction(user);
    })();
  }, []);

  const handleReaction = async (type: "like" | "love" | "haha") => {
    try {
      if (!user) return;

      const updated = await likePost(post.id,post.author._id, user.id, type);
      console.log(updated);
      // Case: reaction was removed (same type clicked again)
      if (updated.status) {
        setUserReaction(null);
        await fetchReaction(user);
        return; // stop further updates
      }

      // Case: new or changed reaction
      setUserReaction(type);

      setReactionCounts((prev) => {
        const newCounts = { ...prev };

        // remove previous reaction if exists
        if (userReaction && newCounts[userReaction] > 0) {
          newCounts[userReaction]--;
        }

        // add new one
        newCounts[type] = (newCounts[type] || 0) + 1;
        return newCounts;
      });

      // update total likes
      setLikesCount((prev) => prev + 1); // optional if not using fetchReaction
    } catch (err) {
      console.error("Reaction error:", err);
    }
  };



  /* const handleBookmark = async () => {
    try {
      const updated = await bookmarkPost(post.id);
      setIsBookmark(updated);
    } catch (err) {
      console.error("Bookmark error:", err);
    }
  }; */

  const handleDelete = async () => {
    try {
      await deletePost( post.id);
      // Optionally: trigger refresh or notify deletion
    } catch (err) {
      console.error("Delete error:", err);
    }
  };
  
  const handleImagePost = async (uri: string) => {

    // Create an invisible Image object to get dimensions
    const img = new global.Image();
    img.src = uri;
    img.onload = () => {
      const scaleFactor = (width - 16) / img.width;
      const height = img.height * scaleFactor;
      setImageHeight(height);
    };
  }
  const tempImgUrl = "http://localhost:8081" + post.imageUrl;
  useEffect(() => {
    if (tempImgUrl) {
      handleImagePost(tempImgUrl);
    }
  }, [tempImgUrl]);
  if (post.author.image) {
    var tempAvatarUrl = "http://localhost:8081" + post.author.image;
  }
  else {
    var tempAvatarUrl = "http://localhost:8081/media/avatar/default-avatar.png";
  }
  return (
    <View style={styles.post}>
      {/* Header */}
      <View style={styles.postHeader}>
        <Link
          href={
            user?.id === post.author._id
              ? "/(tabs)/profile"
              : `/user/${post.author._id}`
          }
          asChild
        >
          <TouchableOpacity style={styles.postHeaderLeft}>
            <Image
              source={{ uri: tempAvatarUrl }}
              style={styles.postAvatar}
              contentFit="cover"
              transition={200}
              cachePolicy="memory-disk"
            />
            <Text style={styles.postUsername}>{post.author?.username}</Text>
          </TouchableOpacity>
        </Link>

        {user?.id === post.author._id ? (
          <TouchableOpacity onPress={handleDelete}>
            <Ionicons name="trash-outline" size={20} color="white" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity>
            <Ionicons name="ellipsis-horizontal" size={20} color="white" />
          </TouchableOpacity>
        )}
      </View>

      {/* Image */}
      <Image
        key={post.id}
        source={{ uri: post.imageUrl ? tempImgUrl: "" }}
        style={[styles.postImage, { height: imageHeight }]}
        contentFit="contain"
        transition={200}
        cachePolicy="memory-disk"
      />

      {/* Actions */}
      <View style={styles.postActions}>
        <View style={styles.postActionsLeft}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {reactionTypes.map((type) => {
              const isActive = userReaction === type;
              const iconName = isActive
                ? reactionIconMap[type].filledIcon
                : reactionIconMap[type].icon;
              const iconColor = isActive ? "#00BFFF" : "white"; // or any highlight color

              return (
                <TouchableOpacity
                  key={type}
                  onPress={() => handleReaction(type)}
                  style={{ alignItems: "center" }}
                >
                  <Ionicons name={iconName as any} size={22} color={iconColor} />
                  <Text
                    style={{
                      fontSize: 13,
                      color: iconColor,
                      fontWeight: isActive ? "bold" : "normal",
                      marginTop: 2,
                    }}
                  >
                    {reactionCounts[type]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          

          <TouchableOpacity onPress={() => setShowComments(true)}>
            <Ionicons name="chatbubble-outline" size={22} color="white" />
            <Text
                    style={{
                      fontSize: 13,
                      color: "white",
                      fontWeight: "normal",
                      marginTop: 2,
                      textAlign:"center"
                    }}
                  >
                    {commentsCount}
                  </Text>
          </TouchableOpacity>

          {/* <TouchableOpacity onPress={handleBookmark}>
            <Ionicons
              name={isBookmark ? "bookmark" : "bookmark-outline"}
              size={24}
              color={isBookmark ? "green" : "white"}
            />
          </TouchableOpacity> */}
        </View>
      </View>

      {/* Info */}
      <View style={styles.postInfo}>
        <Text style={styles.likesText}>
          {likesCount > 0 ?"": `Be the first to like`}
        </Text>

        {post.caption && (
          <View style={styles.captionContainer}>
            <Text style={styles.captionUsername}>{post.author.username}</Text>
            <Text style={styles.captionText}>{post.caption}</Text>
          </View>
        )}

        <TouchableOpacity onPress={() => setShowComments(true)}>
          <Text style={styles.commentText}>
            {commentsCount
              ? `View ${commentsCount} comments`
              : "Add a comment"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.timeAgo}>2 hours ago</Text>
      </View>

      {/* Comments */}
      <CommentsModal
        postId={post.id}
        visible={showComments}
        onClose={() => setShowComments(false)}
        onCommentAdded={() => setCommentsCount((prev) => prev + 1)}
      />
    </View>
  );
}