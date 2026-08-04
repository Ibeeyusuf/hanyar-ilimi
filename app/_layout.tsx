import "../global.css";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavProvider } from "@/components/nav/NavContext";
import { useEffect } from "react";
import { initData } from "@/lib/data";

export default function RootLayout() {
  useEffect(() => { initData(); }, []);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavProvider>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: "#BFE6F5" },
              animation: "fade",
              animationDuration: 220,
            }}
          >
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="subject" />
            <Stack.Screen name="home" />
            <Stack.Screen name="profile" />
            <Stack.Screen name="progress" />
            <Stack.Screen name="rewards" />
            <Stack.Screen name="settings" />
            <Stack.Screen name="facilitator" />
          </Stack>
        </NavProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
