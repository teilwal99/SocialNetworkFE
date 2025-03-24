import { 
  ActivityIndicator, 
  Dimensions, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View 
} from "react-native";

import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { useEffect, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { Image } from "expo-image";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import styles from "@/styles/auth.styles"; 
import * as FileSystem from "expo-file-system";

export default function Create() {
  const router = useRouter();
  const { user } = useUser();
  const [caption, setCaption] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  
  const generateUploadUrl = useMutation(api.posts.generateUploadUrl);
  const createPost = useMutation(api.posts.createPost);

  const pickImage = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (granted) {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
      }
    }
  };

  const handleShare = async () => {
    if (!selectedImage) return;
  
    try {
      setIsSharing(true);
  
      // Step 1: Request an upload URL from Convex
      const uploadUrl = await generateUploadUrl();
  
      // Step 2: Fetch the image as Blob
      const response = await fetch(selectedImage);
      const blob = await response.blob();
      const mimeType = "image/jpeg"; // Ensure correct type
  
      // ✅ Step 3: Upload Image as Binary Content (like `FileSystem.uploadAsync`)
      const uploadResponse = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          "Content-Type": mimeType, // Ensure correct MIME type
        },
        body: blob, // Directly send binary content
      });
  
      if (!uploadResponse.ok) {
        throw new Error("Image upload failed");
      }
  
      const { storageId } = await uploadResponse.json();
  
      // Step 4: Store image reference in database
      try {
        const postId = await createPost({ storageId, caption });
        console.log("Post created with ID:", postId);
      } catch (error) {
        console.error("Error creating post:", error);
      }
  
      // Step 5: Reset state and navigate
      setTimeout(() => {
        setIsSharing(false);
        setSelectedImage(null);
        setCaption("");
        router.replace("/");
      }, 2000);
    } catch (error) {
      console.log("Error sharing post:", error);
    }
  };
  

  // Debugging: Check if Convex returns correct Content-Type
  const checkImageHeaders = async () => {
    if (!selectedImage) return;
    try {
      const response = await fetch(selectedImage);
      console.log("Response Headers:", response.headers.get("Content-Type"));
    } catch (error) {
      console.error("Error fetching image:", error);
    }
  };

  if (!selectedImage) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => { setIsSharing(false); router.back(); }}>
            <Ionicons size={28} name="arrow-back" color={Colors.light.tint} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}> New Post </Text>
          <View style={{ width: 28 }}></View>
        </View>
        <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
          <Ionicons size={Dimensions.get("window").width} name="image-outline" color={Colors.dark.tint} />
          <Text> Tap to select an image </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "android" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "android" ? 100 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { setSelectedImage(null); setCaption(""); }}>
          <Ionicons size={32} name="close-outline" color={isSharing ? Colors.dark.tint : Colors.light.tint} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}> New Post </Text>
        <TouchableOpacity onPress={handleShare} disabled={isSharing || !selectedImage}>
          {isSharing ? (<ActivityIndicator size="small" color={Colors.light.tint} />) : 
          (<Text style={{ color: "green", fontSize: 20 }}> Share </Text>)}
        </TouchableOpacity>
      </View>

      <ScrollView bounces={false} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          <View style={styles.imageContainer}>
            <View style={styles.imageWrapper}>
              <Image source={{ uri: selectedImage }} contentFit="cover" transition={200} style={styles.imageWrapper} />
            </View>
            <TouchableOpacity onPress={pickImage} disabled={isSharing} style={styles.changeImageButt}>
              <Ionicons size={28} name="image-outline" color={Colors.dark.tint} />
              <Text style={{ color: "white" }}> Change </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TextInput
          placeholder="Write a caption..."
          value={caption}
          onChangeText={setCaption}
          style={styles.textArea}
          multiline
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
