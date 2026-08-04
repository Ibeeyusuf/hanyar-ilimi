import { View, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { backgrounds } from "@/constants/images";

/**
 * In-app backdrop — full bleed, no bars, no blur.
 *
 * `cover` fills the screen edge to edge. Because the artwork is 3:2 and
 * screens are wider, some sky and foreground is trimmed — the characters sit
 * at mid height and are never lost. Supplying the artwork at the tablet's own
 * 16:10 shape (see BACKGROUND-SPEC.md) removes the trim entirely.
 */
export default function SceneBackdrop() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Image source={backgrounds.scene} style={StyleSheet.absoluteFill} contentFit="cover" />
    </View>
  );
}
