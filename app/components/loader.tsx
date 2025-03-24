import { useAuth } from "@clerk/clerk-expo";
import { Link, Stack } from "expo-router";
import {
  StyleSheet,
  Image,
  Pressable,
  TouchableOpacity,
  Text,
  View,
  ActivityIndicator,
} from "react-native";

export default function Loader() {
  return (
    <View style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor:"black"
      }}>
        <ActivityIndicator size="large" color="white" />
    </View>
    
  );
}
