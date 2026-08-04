import { ReactNode } from "react";
import { Text, Pressable, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { feedback } from "@/lib/feedback";
import { touch, radius } from "@/constants/ui";

const AP = Animated.createAnimatedComponent(Pressable);

// Large, tactile, gradient primary button. Meets the >=64px touch target rule
// and gives springy press feedback + sound. Use for main child actions.
export default function BigButton({
  label, onPress, icon, colors = ["#7CC242", "#5BA22C"], disabled, sound = true, minWidth,
}: {
  label: string; onPress?: () => void; icon?: keyof typeof Ionicons.glyphMap;
  colors?: [string, string]; disabled?: boolean; sound?: boolean; minWidth?: number;
}) {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AP
      disabled={disabled}
      onPressIn={() => { scale.value = withTiming(0.95, { duration: 80 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 12, stiffness: 220 }); }}
      onPress={() => { if (!disabled) { if (sound) feedback.tap(); onPress?.(); } }}
      style={[style, { minHeight: touch.min, minWidth, opacity: disabled ? 0.5 : 1 }]}
    >
      <LinearGradient
        colors={disabled ? ["#C9C9D4", "#B4B4C0"] : colors}
        start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
        style={{ borderRadius: radius.pill, paddingVertical: 16, paddingHorizontal: 28, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }}
      >
        {icon && <Ionicons name={icon} size={22} color="#fff" />}
        <Text style={{ fontSize: 16, fontWeight: "900", color: "#fff", letterSpacing: 0.5 }}>{label}</Text>
      </LinearGradient>
    </AP>
  );
}
