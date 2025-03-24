import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useLocalSearchParams, useRouter } from "expo-router";
import Loader from "../components/loader";
import { TouchableOpacity, View, Text, ScrollView, Pressable } from "react-native";
import { styles } from "@/styles/profile.styles";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { FlatList } from "react-native";
import { replace } from "expo-router/build/global-state/routing";
import { useId, useState } from "react";
import MessageModal from "../components/messageModal";
import { useAuth } from "@clerk/clerk-expo";

export default function UserProfile() {
    const {signOut, userId} = useAuth();
    const currentUser = useQuery(api.users.getUserByClerkId,{clerkId:userId || "skip"});
    const {id} = useLocalSearchParams();
    const [isMessageModalVisible, setIsMessageModalVisible] = useState(false);

    const profile = useQuery(api.users.getUserProfile, {userId: id as Id<"users">});
    
    const posts = useQuery(api.posts.getPostByUser, {userId: id as Id<"users">});
    const isFollowing = useQuery(api.users.isFollowing, {followingId: id as Id<"users">});
    
    const followUser = useMutation(api.users.followUser);
    const router = useRouter();
    const handleBack = () => {
        if(router.canGoBack()){
            router.back();
        }else{
            router.replace("/(tabs)");
        }
    };

    if(!profile || posts === undefined || isFollowing === undefined) return <Loader />

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack}>
                    <Ionicons name="arrow-back" size={24} color={"white"} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}> {profile.username} </Text>
                <View style={{width: 24}}></View>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} >
                <View style={styles.profileInfo}>
                    <View style={styles.avatarAndStats}>
                        <View style={styles.avatarContainer}>
                            <Image source={profile.image} style={styles.avatar} contentFit="cover" transition={200}/>
                        </View>
                        <View style={styles.statsContainer}>
                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}> {profile.posts} </Text>
                                <Text style={styles.statLabel}>  Posts </Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}> {profile.followers} </Text>
                                <Text style={styles.statLabel}>  Followers </Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}> {profile.following} </Text>
                                <Text style={styles.statLabel}>  Following </Text>
                            </View>
                        </View>
                    </View>
                    <Text style={styles.name}>{profile.fullname}</Text>

                    {profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}

                    <View style={styles.buttonContainer}>
                        <Pressable 
                            style={styles.followButton} 
                            onPress={() => followUser({ followingId: id as Id<"users"> })}
                        >
                            <Text style={styles.followButtonText}>{isFollowing ? "Unfollow" : "Follow"}</Text>
                        </Pressable>

                        <Pressable 
                            style={styles.messageButton} 
                            onPress={() => setIsMessageModalVisible(true)}  // Replace with your message function
                        >
                            <Text style={styles.messageButtonText}>Message</Text>
                        </Pressable>
                        {currentUser && (
                        <MessageModal
                            visible={isMessageModalVisible}
                            onClose={() => setIsMessageModalVisible(false)}
                            senderId={currentUser._id}  // Only pass this when it's defined
                            receiverId={profile._id}
                        />
                        )}
                    </View>

                    
                </View>
                <View style={styles.postsGrid}>
                    {posts.length === 0 ? 
                    (
                    <View style={styles.noPostsContainer}>
                        <Ionicons name="image-outline" size={64} color={"white"} />
                        <Text style={styles.noPostsText}> No posts yet </Text>
                    </View>) 
                    : (
                        <FlatList
                            data={posts}
                            numColumns={3}
                            keyExtractor={(item) => item._id}
                            renderItem={({ item }) => (
                                <TouchableOpacity style={styles.gridItem} onPress={() => {}}>
                                <Image
                                    source={item.imageUrl}
                                    style={styles.gridImage}
                                    contentFit="cover"
                                    transition={200}
                                    cachePolicy="none" />
                                </TouchableOpacity>
                            )}
                        />
                    )}
                    
                </View>
            </ScrollView>
        </View>
        
    );
}