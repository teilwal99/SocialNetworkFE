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
import { useEffect, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { Image } from "expo-image";
import styles from "@/styles/auth.styles"; 
import { createPost, uploadMedia } from "@/apis/posts";
import { useAuth } from "@/providers/AuthProvider";

export default function Create() {
  const router = useRouter();
  const [caption, setCaption] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const {user} = useAuth();

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

  const handleShare = async () => { // Ensure user is fetched
    if(!user) return;
    if (!selectedImage) return;
    setIsSharing(true);

    try {
      const imageUrl = await uploadMedia(selectedImage, "post");
      await createPost({
        content:caption,
        media:imageUrl,
        author: user?.username,
      });

      setCaption("");
      setSelectedImage(null);
      router.replace("/");

    } catch (err) {
      console.error("Post failed:", err);
      alert("Failed to share post.");
    } finally {
      setIsSharing(false);
    }
  };

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
