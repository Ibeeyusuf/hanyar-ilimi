import { View, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { backgrounds } from "@/constants/images";

/** Welcome backdrop — full bleed, no bars, no blur. */
export default function LoginScene() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Image source={backgrounds.login} style={StyleSheet.absoluteFill} contentFit="cover" />
    </View>
  );
}
