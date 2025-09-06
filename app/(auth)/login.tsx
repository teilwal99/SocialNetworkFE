import * as SecureStore from "expo-secure-store";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Alert, Image, Pressable, Text, TextInput, TouchableOpacity, View } from "react-native";
import { StyleSheet , Dimensions} from "react-native";
import { ImageBackground } from "react-native";
import styles from "@/styles/auth.styles";
import { useState } from "react";
import { set } from "date-fns";
import { getItem, saveItem } from "@/app/utils/Storage";
import { useAuth } from "@/providers/AuthProvider";

export default function Login(){
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {isSignedIn,setIsSignedIn, token, setToken} = useAuth();

  const handleLogin = async () => {
    try {
      const res = await fetch("http://localhost:8081/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      await setToken(data.token);
      setIsSignedIn(true);
      router.replace("/(tabs)");
    } catch (err: any) {
      alert("Login failed: " + err.message);
    }
  };
    
  return (
    <ImageBackground
      source={require("../../assets/images/Social interaction-bro.png")}// must be a PNG/JPG, not SVG
      resizeMode="cover"
      style={styles.bgContainer}
    >
      {/* Overlay */}
      <View style={styles.overlay} />

      {/* Login content */}
      <View style={styles.container}>
        {/* Brand */}
        <View style={styles.brandSection}>
          <View style={styles.logoContainer}>
            <Ionicons name="leaf" size={32} color="green" />
          </View>
          <Text style={styles.appName}>spotlight</Text>
          <Text style={styles.tagLine}>Welcome back!</Text>
        </View>

        {/* Form */}
        <View>
          <TextInput
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            style={styles.input}
          />
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
          />
          <TouchableOpacity
            onPress={handleLogin}
            activeOpacity={0.9}
            style={styles.loginGoogle}
            disabled={isSubmitting}
          >
            <Ionicons name="log-in-outline" size={20} color="green" />
            <Text style={styles.loginText}>
              {isSubmitting ? "Logging in..." : "Login"}
            </Text>
          </TouchableOpacity>

          <Text style={styles.tagLine}>By logging in you agree to our Terms</Text>
        </View>
      </View>
    </ImageBackground>
  );

}