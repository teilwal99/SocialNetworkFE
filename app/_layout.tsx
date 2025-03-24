import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import InitialLayout from './components/initialLayout';
import ClerkAndConvexProvider from '@/providers/ClerkAndConvexProvider';
import {useFonts} from "expo-font";
import { SplashScreen } from 'expo-router';
import { useCallback, useEffect } from 'react';
import * as NavigationBar from 'expo-navigation-bar';
import { Platform } from 'react-native';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({"JetBrainMono-Medium": require("../assets/fonts/JetBrainsMono-Medium.ttf")})
  
  const onRootLayoutView = useCallback(async() => {
    if(fontsLoaded) await SplashScreen.hideAsync();
  }, [fontsLoaded]);
  
  useEffect(() => {
    if(Platform.OS === "android"){
      NavigationBar.setBackgroundColorAsync("#000000");
      NavigationBar.setButtonStyleAsync("light");
    }
      
  },[]);

  return (
    
      <ClerkAndConvexProvider>
      
        <SafeAreaProvider>
          <SafeAreaView style={{ flex: 1, backgroundColor: "black" }} onLayout={onRootLayoutView}>
            <InitialLayout  />
          </SafeAreaView>
        </SafeAreaProvider>
      </ClerkAndConvexProvider>
    
  );
}

