import { useAuth } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";

export default function Index() {
  const { isSignedIn } = useAuth();

  // Redirect if not authenticated
  if (isSignedIn === false) {
    return <Redirect href="/(auth)/login" />;
  }

  // Redirect authenticated users to the main tabs
  return <Redirect href="/(tabs)" />;
}
