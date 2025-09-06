import { useLocalSearchParams, useRouter } from "expo-router";
import Loader from "../components/loader";
import { TouchableOpacity, View, Text, ScrollView, Pressable } from "react-native";
import { styles } from "@/styles/profile.styles";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { FlatList } from "react-native";
import { useEffect, useId, useState } from "react";
import MessageModal from "../components/messageModal";
import { checkFollowStatus, getUserById, toggleFollow } from "@/convex/users";
import { getPostsByUser } from "@/convex/posts";
import profile from "../(tabs)/profile";
import { User } from "../type/user";
import { set } from "date-fns";
import { useAuth } from "@/providers/AuthProvider";
const BASE_URL = "http://localhost:8081"; // Adjust this to your API base URL
export default function UserProfile() {
    const [guestUser, setGuestUser] = useState<User | null>(null);
    const {user , logout} = useAuth();
    const [guestFollowers, setGuestFollowers] = useState<number>(0);
    const [guestProfile, setGuestProfile] = useState({
        fullname: "",
        bio: "",
    });
    const [posts, setPosts] = useState<any[]>([]);
    const {id} = useLocalSearchParams();
    const [isMessageModalVisible, setIsMessageModalVisible] = useState(false);
    const [isFollowing, setIsFollowing] = useState<boolean>(false);
    const [isRequestSent, setIsRequestSent] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const guest = await getUserById(id as string);
                guest.postsCount = posts.length; 
                if(guest.profilePictureUrl) {
                    guest.profilePictureUrl = BASE_URL + guest.profilePictureUrl;
                }
                else {
                    guest.profilePictureUrl = `${BASE_URL}/media/avatar/default-avatar.png`;
                }
                setGuestUser(guest);
                setGuestFollowers(guest.followers);
                setGuestProfile({  
                    fullname: guestUser?.fullname || "",
                    bio: guestUser?.bio || "",
                });
            } catch (err) {
                console.error('Failed to fetch user:', err);
            }
        })();
    }, []);


    // 📮 Get user posts
    useEffect(() => {
        (async () => {
            try {
              if (guestUser?.username) {
                const postsbyuser = await getPostsByUser(guestUser?.username);
                setPosts(postsbyuser);
                guestUser.postsCount = postsbyuser.length; 
              }
            } catch (err) {
              console.error('Failed to fetch posts:', err);
            }
        })();
    }, [guestUser?.id]);
    
    // 🖼️ Check if current user is following guest user
    useEffect(() => {
        (async () => {
            if (user && guestUser) {
                const follwed = await checkFollowStatus(guestUser.id);
                if (follwed != null) {
                    setIsFollowing(true);
                    if(follwed === 0) {
                        setIsRequestSent(true);
                    }
                }
            }
        })();
    }, [user, guestUser]);

    const router = useRouter();
    const handleBack = () => {
        if(router.canGoBack()){
            router.back();
        }else{
            router.replace("/(tabs)");
        }
    };

    const handleFollow = async (userId: number | undefined, guestId: number) => {
        try {
            if (!userId) {
                alert("You need to be logged in to follow users.");
                return;
            }
            const follow = await toggleFollow(userId, guestId);
            setIsFollowing(follow === "Followed" ? true : false);
            setGuestFollowers((prev) => follow === "Followed" ? prev + 1 : prev - 1);
            if (follow) {
                setIsRequestSent(false);
            }
            return follow;
        } catch (error) {
            console.error("Failed to toggle follow:", error);
            alert("Failed to toggle follow.");
        }
    };

    if(!guestUser || posts === undefined || isFollowing === undefined) return <Loader />
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack}>
                    <Ionicons name="arrow-back" size={24} color={"white"} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}> {guestUser.username} </Text>
                <View style={{width: 24}}></View>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} >
                <View style={styles.profileInfo}>
                    <View style={styles.avatarAndStats}>
                        <View style={styles.avatarContainer}>
                            <Image source={guestUser.profilePictureUrl} style={styles.avatar} contentFit="cover" transition={200}/>
                        </View>
                        <View style={styles.statsContainer}>
                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}> {guestUser.postsCount} </Text>
                                <Text style={styles.statLabel}>  Posts </Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}> {guestFollowers} </Text>
                                <Text style={styles.statLabel}>  Followers </Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}> {guestUser.following} </Text>
                                <Text style={styles.statLabel}>  Following </Text>
                            </View>
                        </View>
                    </View>
                    <Text style={styles.name}>{guestUser.fullname}</Text>

                    {guestUser.bio && <Text style={styles.bio}>{guestUser.bio}</Text>}

                    <View style={styles.buttonContainer}>
                        <Pressable 
                            style={styles.followButton} 
                            onPress={() => {
                                handleFollow(user?.id, guestUser.id);
                            }}
                        >
                            <Text style={styles.followButtonText}>{isFollowing ? "Unfollow" : "Follow"}</Text>
                        </Pressable>

                        <Pressable 
                            style={styles.messageButton} 
                            onPress={() => setIsMessageModalVisible(true)}  // Replace with your message function
                        >
                            <Text style={styles.messageButtonText}>Message</Text>
                        </Pressable>
                        {user && (
                        <MessageModal
                            visible={isMessageModalVisible}
                            onClose={() => setIsMessageModalVisible(false)}
                            senderId={String(user.id)}
                            receiverId={String(guestUser.id)}
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
                                    source={BASE_URL + item.imageUrl}
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