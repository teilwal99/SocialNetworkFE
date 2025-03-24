import { Redirect, Stack, useRouter, useSegments } from 'expo-router';
import { StyleSheet, Image, Pressable, TouchableOpacity, Text, View } from 'react-native';
import { useAuth } from "@clerk/clerk-expo";
import { useEffect } from 'react';


export default function InitialLayout() {
    const { isSignedIn, isLoaded } = useAuth();
    const segments = useSegments();
    const router = useRouter();

    console.log("Auth State:", { isSignedIn, isLoaded });

    useEffect(() => {
        if (!isLoaded) return;

        const inAuthScreen = segments[0] === "(auth)";
        if(!inAuthScreen && !isSignedIn){
            router.replace("/(auth)/login")
        }
        else if (inAuthScreen && isSignedIn){
            router.replace("/(tabs)")
        }
    },[isLoaded,isSignedIn,segments]);
    
    if(!isLoaded) return null;

    return <Stack screenOptions={{headerShown:false}} />;
}

