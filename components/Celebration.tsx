import { useEffect } from "react";
import { View, Text, Pressable, Dimensions } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming, withDelay, withSpring, Easing, withRepeat } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/theme";
import CountUp from "@/components/ui/CountUp";
import Mascot from "@/components/Mascot";
import { feedback } from "@/lib/feedback";

const { width } = Dimensions.get("window");
const COLORS = ["#8B5CF6", "#7CC242", "#F6B93B", "#4AA3E0", "#E24B4B", "#F39C3D"];

function Confetti({ i }: { i: number }) {
  const t = useSharedValue(0);
  const startX = (i / 28) * width;
  const drift = (Math.random() - 0.5) * 120;
  const delay = Math.random() * 400;
  const dur = 1600 + Math.random() * 1200;
  const color = COLORS[i % COLORS.length];
  const size = 8 + Math.random() * 8;

  useEffect(() => {
    t.value = withDelay(delay, withRepeat(withTiming(1, { duration: dur, easing: Easing.linear }), -1, false));
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: startX + drift * t.value },
      { translateY: -40 + t.value * 720 },
      { rotate: `${t.value * 720}deg` },
    ],
    opacity: 1 - t.value * 0.3,
  }));

  return <Animated.View style={[{ position: "absolute", top: 0, left: 0, width: size, height: size * 1.4, borderRadius: 2, backgroundColor: color }, style]} />;
}

export default function Celebration({ visible, xp = 10, onClose }: { visible: boolean; xp?: number; onClose: () => void }) {
  const card = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      card.value = withSpring(1, { damping: 11, stiffness: 160 });
      feedback.success();
    } else {
      card.value = 0;
    }
  }, [visible]);

  const cardStyle = useAnimatedStyle(() => ({ opacity: card.value, transform: [{ scale: 0.7 + card.value * 0.3 }] }));

  if (!visible) return null;

  return (
    <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(30,30,50,0.45)" }}>
      {Array.from({ length: 28 }).map((_, i) => <Confetti key={i} i={i} />)}

      <Animated.View style={[cardStyle, { width: "84%", maxWidth: 380, backgroundColor: "#fff", borderRadius: 28, padding: 24, alignItems: "center" }]}>
        <Mascot size={96} pose="trophy" />
        <Text style={{ fontSize: 24, fontWeight: "900", color: colors.purple, marginTop: 8 }}>Madalla! 🎉</Text>
        <Text style={{ fontSize: 14, color: colors.inkSoft, marginTop: 4, textAlign: "center" }}>Ka kammala darasi! · Lesson complete!</Text>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 16, backgroundColor: colors.purpleSoft, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 999 }}>
          <Ionicons name="star" size={22} color={colors.gold} />
          <Text style={{ fontSize: 20, fontWeight: "900", color: colors.purple }}>+<CountUp to={xp} suffix=" XP" /></Text>
        </View>

        <Pressable onPress={onClose} style={{ marginTop: 20, backgroundColor: colors.green, paddingHorizontal: 40, paddingVertical: 14, borderRadius: 999 }}>
          <Text style={{ fontSize: 16, fontWeight: "900", color: "#fff" }}>CI GABA · CONTINUE</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}
