import { useSSO } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image, Pressable, Text, TouchableOpacity, View } from "react-native";
import { StyleSheet , Dimensions} from "react-native";
import { useAuth } from "@clerk/clerk-expo";
import styles from "@/styles/auth.styles";

export default function Login(){
    const {startSSOFlow} = useSSO();
    const router = useRouter();
    const { isSignedIn } = useAuth();

    const handleGoogleSignIn = async () => {
        
        try {
          const { createdSessionId, setActive } = await startSSOFlow({
            strategy: "oauth_google",
          });
      
          console.log("Login Response:", { createdSessionId, setActive });
      
          if (setActive && createdSessionId) {
            await setActive({ session: createdSessionId });
      
            console.log("Session activated!");
            console.log("Current auth state:", { isSignedIn });
      
            // Add a slight delay to allow Clerk to update state
            setTimeout(() => {
              console.log("Redirecting to (tabs)...");
              router.replace("/(tabs)");
            }, 1000);
          } else {
            console.log("Session was not created.");
          }
        } catch (error) {
          console.error("OAuth error:", error);
        }
    };

  return (
  <View style={styles.container}>
    <View style={styles.brandSection}>
        <View style={styles.logoContainer}>
            <Ionicons name='leaf' size={32} color={"green"} />
        </View>    
        <Text style={styles.appName} > spotlight </Text>
        <Text style={styles.tagLine} > something </Text>
    </View>

    {/*illustration*/}
    <View style={styles.container}>
        <Image
            source={require("../../assets/images/Social interaction-bro.svg")}
            resizeMode="cover"
        />
    </View>

    {/*login*/}
    <View >
        <TouchableOpacity onPress={handleGoogleSignIn} activeOpacity={0.9} style={styles.loginGoogle}>
            <View style={styles.loginLogo}>
                <Ionicons name='logo-google' size={20} color={"green"} />
            </View>
            <Text style={styles.loginText} > Continue with google </Text>
        </TouchableOpacity>
        
        <Text style={styles.tagLine} > Agee with term & condition </Text>
    </View>

  </View>);
}