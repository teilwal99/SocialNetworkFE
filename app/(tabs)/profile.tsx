import { FlatList, Keyboard, KeyboardAvoidingView,  Platform, Pressable, ScrollView, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { Image } from "expo-image";
import Loader from "../components/loader";
import {styles} from "@/styles/profile.styles";
import { updateAvatar, updateUser } from "@/convex/users";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { getPostsByUser, uploadMedia } from "@/convex/posts";
import { User } from "../type/user";
import * as ImagePicker from "expo-image-picker";
import { set } from "date-fns";
import Modal from "react-native-modal";
import { useAuth } from "@/providers/AuthProvider";

const API_BASE = "http://localhost:8081"; 

export default function Profile() {
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [editProfile, setEditProfile] = useState({
    fullname: "",
    bio: "",
  });
  const [avatar, setAvatar] = useState<string | null>(null);

  const [selectedPost, setSelectedPost] = useState<any>(null);
  const { user,logout } = useAuth();

  useEffect(() => {
      (async () => {
        if(!user)return;
        try {
          setCurrentUser(user);
          setAvatar(user.profilePictureUrl);
          setEditProfile({  
            fullname: user.fullname || "",
            bio: user.bio || "",
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
          if (currentUser?.username) {
            const postsbyuser = await getPostsByUser(currentUser?.username);
            setPosts(postsbyuser);
            currentUser.postsCount = postsbyuser.length; 
          }
        } catch (err) {
          console.error('Failed to fetch posts:', err);
        }
    })();
  }, [currentUser?.id]);

  
  // 🖼️ Change avatar
  const changeAvatar = async () => {
    try {
      const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!granted) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) return;

      const localUri = result.assets[0].uri;

      // Upload media and get back the file URL
      const uploadedUrl = await uploadMedia(localUri, "avatar");

      // Update avatar in DB
      if (currentUser?.id) {
        await updateAvatar(uploadedUrl, currentUser?.id);
      }else {
        console.error("Current user ID is not available");
      }
      // Reflect avatar change instantly
      setAvatar(uploadedUrl);

      console.log("Avatar updated!");
    } catch (error) {
      console.error("Error updating avatar:", error);
    }
  };


  // 💾 Save profile
  const handleSaveProfile = async () => {
    if (!currentUser) return;
    await updateUser(currentUser.id, editProfile);
    setIsEditModalVisible(false); 
  };

  if(currentUser?.profilePictureUrl) {
    var avatarUrl = API_BASE + currentUser.profilePictureUrl;
  }
  else {
    var avatarUrl = `${API_BASE}/media/avatar/default-avatar.png`;
  }
  
  if(!currentUser || posts === undefined) return <Loader />
  
  return (
  <View style={styles.container}>
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Text style={styles.username}> {currentUser.username} </Text>
      </View>
      <View style={styles.headerRight}>
        <TouchableOpacity style={styles.headerIcon} onPress={() => logout}>
          <Ionicons name="log-out-outline" size={24} color={"white"} />
        </TouchableOpacity>
      </View>
    </View>
    <ScrollView showsVerticalScrollIndicator={false} >
      <View style={styles.profileInfo}>
        <View style={styles.avatarAndStats}>
          <View style={styles.avatarContainer}>
            <Image source={avatarUrl} style={styles.avatar} contentFit="cover" transition={200}/>
            <TouchableOpacity onPress={changeAvatar}  style={styles.changeAvatarButt}>
              <Ionicons size={20} name="camera-reverse-outline" color={"white"} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}> {currentUser.postsCount ?? 0} </Text>
              <Text style={styles.statLabel}>  Posts </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}> {currentUser.followers} </Text>
              <Text style={styles.statLabel}>  Folowers </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}> {currentUser.following} </Text>
              <Text style={styles.statLabel}>  Folowing </Text>
            </View>
          </View>
        </View>
          <Text style={styles.name}>{currentUser.fullname}</Text>

          {currentUser.bio && <Text style={styles.bio}>{currentUser.bio}</Text>}

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.editButton} onPress={()=>setIsEditModalVisible(true)}>
              <Text style={styles.editButtonText}> Edit Profile </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIcon} >
              <Ionicons name="share-outline" size={20} color={"white"} />
            </TouchableOpacity>
          </View>
      </View>
      {posts.length===0 && <NoPostsFound/>}
      <FlatList
      data={posts}
      scrollEnabled={false}
      keyExtractor={(item) => item._id}
      numColumns={3} // Creates a 2-column grid
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.gridItem} onPress={() => setSelectedPost(item)}>
          <Image 
          source={{ uri:API_BASE + item.imageUrl }} 
          style={styles.gridImage}
          contentFit="cover"
          transition={200}
          cachePolicy="memory-disk"
        />
        </TouchableOpacity>
        
      )}
    />
    </ScrollView>
      {/*modal bio update*/}
      <Modal
        isVisible={isEditModalVisible}
        onBackdropPress={() => setIsEditModalVisible(false)} // tap outside to close
        onBackButtonPress={() => setIsEditModalVisible(false)} // Android back button
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropOpacity={0.5}
        style={{ margin: 0 }} // Fullscreen modal
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView behavior={Platform.OS === "android" || Platform.OS === "ios"?"padding":"height"}  style={styles.modalContainer}>
            <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}> Edit Profile </Text>
                  <TouchableOpacity onPress={()=>setIsEditModalVisible(false)}>
                    <Ionicons name="close" size={24} color={"white"} />
                  </TouchableOpacity>
                </View>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}> Name </Text>
                    <TextInput 
                        style={styles.input}
                        placeholderTextColor={"grey"}
                        value={editProfile.fullname}
                        onChangeText={(text) => setEditProfile((prev) => ({...prev , fullname:text}))}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}> Bio </Text>
                    <TextInput 
                        style={styles.input}
                        placeholderTextColor={"grey"}
                        value={editProfile.bio}
                        onChangeText={(text) => setEditProfile((prev) => ({...prev , bio:text}))}
                        multiline
                    />
                  </View>
                  <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
                    <Text style={styles.saveButtonText}> Save Changes </Text>
                  </TouchableOpacity>
                
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
        
      </Modal>
      {/*modal image post*/}
    <Modal
      isVisible={!!selectedPost}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropOpacity={0.5}
      style={{ margin: 0 }}
      onBackdropPress={() => setSelectedPost(null)}
      onBackButtonPress={() => setSelectedPost(null)} 
    >
        <View style={styles.modalBackdrop}>
          {selectedPost && (
            <View style={styles.postDetailContainer}>
              <View style={styles.postDetailHeader}>
                <TouchableOpacity onPress={()=>setSelectedPost(null)}>
                  <Ionicons name="close" size={24} color={"white"} />
                </TouchableOpacity>
              </View>

              <Image source={API_BASE + selectedPost.imageUrl}
                cachePolicy={"memory-disk"}
                style={styles.postDetailImage}
              />
            </View>
          )}
        </View>
      </Modal>
  </View>);
}

const NoPostsFound = () => {
  return <View style={{
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:"black"
  }}>
    <Text style={{color:"white"}}>No posts found</Text>
  </View>
};