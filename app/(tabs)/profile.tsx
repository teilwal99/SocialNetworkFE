import { FlatList, Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Loader from "../components/loader";
import {styles} from "@/styles/profile.styles";
import { getCurrentUser } from "@/convex/users";
import { useAuth } from "@clerk/clerk-expo";
import { useState } from "react";
import { Doc } from "@/convex/_generated/dataModel";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

export default function Profile(){
  const {signOut, userId} = useAuth();
  const [avatar, setAvatar] = useState<string | null>(null);
  const updateAvatar = useMutation(api.users.updateAvatar);

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const currentUser = useQuery(api.users.getUserByClerkId,{clerkId:userId || "skip"});
  //
  const [editProfile, setEditProfile] = useState({
    fullname: currentUser?.fullname||"",
    bio: currentUser?.bio||"",
  });

  const [selectedPost, setSelectedPost] = useState<Doc<"posts"> | null>(null)
  const posts = useQuery(api.posts.getPostByUser, {});

  const updateProfile = useMutation(api.users.updateProfile)

  const handleSaveProfile = async () => {
    await updateProfile(editProfile);
    setIsEditModalVisible(false); 
  };
  
  const changeAvatar = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (granted) {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled) {
        const newAvatarUri = result.assets[0].uri;
        setAvatar(newAvatarUri);

        // Update avatar in the database
        try {
          // Call mutation function here with arguments
          if(currentUser) await updateAvatar({ userId: currentUser?._id, newAvatar: newAvatarUri });
          console.log('Avatar updated successfully!');
        } catch (error) {
          console.error('Error updating avatar:', error);
          console.log('Failed to update avatar. Please try again.');
        }
      }
    }
  };

  if(!currentUser || posts === undefined) return <Loader />
  
  return (
  <View style={styles.container}>
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Text style={styles.username}> {currentUser.username} </Text>
      </View>
      <View style={styles.headerRight}>
        <TouchableOpacity style={styles.headerIcon} onPress={() => signOut}>
          <Ionicons name="log-out-outline" size={24} color={"white"} />
        </TouchableOpacity>
      </View>
    </View>
    <ScrollView showsVerticalScrollIndicator={false} >
      <View style={styles.profileInfo}>
        <View style={styles.avatarAndStats}>
          <View style={styles.avatarContainer}>
            <Image source={currentUser.image} style={styles.avatar} contentFit="cover" transition={200}/>
            <TouchableOpacity onPress={changeAvatar}  style={styles.changeAvatarButt}>
              <Ionicons size={20} name="camera-reverse-outline" color={"white"} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}> {currentUser.posts} </Text>
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
          source={{ uri: item.imageUrl }} 
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
      visible={isEditModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setIsEditModalVisible(false)}
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
      visible={!!selectedPost}
      animationType="fade"
      transparent={true}
      onRequestClose={() => setSelectedPost(null)}>
        <View style={styles.modalBackdrop}>
          {selectedPost && (
            <View style={styles.postDetailContainer}>
              <View style={styles.postDetailHeader}>
                <TouchableOpacity onPress={()=>setSelectedPost(null)}>
                  <Ionicons name="close" size={24} color={"white"} />
                </TouchableOpacity>
              </View>

              <Image source={selectedPost.imageUrl}
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