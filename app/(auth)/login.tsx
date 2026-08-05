import { useEffect, useRef } from "react";
import { View, Text, Pressable, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming, withSequence, Easing } from "react-native-reanimated";
import { colors } from "@/constants/theme";
import { elevation } from "@/constants/ui";
import LoginScene from "@/components/LoginScene";
import Logo from "@/components/brand/Logo";
import Mascot from "@/components/Mascot";
import { speak } from "@/lib/speech";
import { PHRASES } from "@/constants/phrases";
import { feedback } from "@/lib/feedback";

/**
 * S1 — Welcome (PRD §4).
 *
 * Children here are pre-literate: there is no username, no password, nothing
 * to type. The screen speaks its greeting on load, repeats it if the child
 * hesitates, and offers a single very large FARA (Start) button.
 * A discreet corner icon leads to the facilitator PIN.
 */
export default function WelcomeScreen() {
  const { width } = useWindowDimensions();
  const narrow = width < 600;
  const pulse = useSharedValue(1);
  const idleTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const greet = () => speak(PHRASES.welcome);
    greet();
    // FR-1.2 asks for a reminder if the child hesitates — but only a couple,
    // not an endless loop. Repeating forever is irritating and, on a shared
    // tablet in a quiet room, disruptive.
    let repeats = 0;
    idleTimer.current = setInterval(() => {
      repeats += 1;
      if (repeats > 2) {
        if (idleTimer.current) clearInterval(idleTimer.current);
        idleTimer.current = null;
        return;
      }
      greet();
    }, 12000);
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 900, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.0, { duration: 900, easing: Easing.inOut(Easing.ease) })
      ), -1, false);
    return () => { if (idleTimer.current) clearInterval(idleTimer.current); };
  }, [pulse]);

  const start = () => {
    if (idleTimer.current) clearInterval(idleTimer.current);
    feedback.tap();
    router.push("/(auth)/photo-select");
  };

  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

  return (
    <View className="flex-1" style={{ backgroundColor: colors.skyMid }}>
      <LoginScene />

      <View className="flex-1 items-center justify-center px-6">
        <View className="items-center rounded-3xl bg-white/95 px-8 py-8" style={{ maxWidth: 520, ...elevation.lg }}>
          <Logo />

          <View className="my-3 flex-row items-center gap-3">
            <Mascot size={narrow ? 64 : 84} />
            <View style={{ maxWidth: 240 }}>
              <Text className="text-[22px] font-black" style={{ color: colors.purple }}>Sannu!</Text>
              <Text className="text-[14px]" style={{ color: colors.ink }}>Danna don farawa · Tap to begin</Text>
            </View>
          </View>

          {/* single large primary action — the only thing a child must do */}
          <Animated.View style={pulseStyle}>
            <Pressable
              onPress={start}
              className="mt-2 flex-row items-center justify-center gap-3 rounded-full"
              style={{ minHeight: 84, paddingHorizontal: narrow ? 44 : 64, backgroundColor: colors.green, ...elevation.md }}
            >
              <Ionicons name="play" size={30} color="#fff" />
              <Text className="text-[28px] font-black tracking-wider text-white">FARA</Text>
            </Pressable>
          </Animated.View>

          <Pressable onPress={() => speak(PHRASES.welcome)} className="mt-4 flex-row items-center gap-2" hitSlop={10}>
            <Ionicons name="volume-high" size={18} color={colors.purple} />
            <Text className="text-[13px] font-bold" style={{ color: colors.purple }}>Sake saurara · Hear again</Text>
          </Pressable>
        </View>
      </View>

      {/* Discreet facilitator entry (PRD S1). Rendered LAST with an explicit
          zIndex — the full-screen content layer above would otherwise sit on
          top of it and swallow the tap. */}
      <Pressable
        onPress={() => router.push("/facilitator/pin")}
        hitSlop={16}
        style={{
          position: "absolute", top: 16, left: 16, height: 46, width: 46,
          alignItems: "center", justifyContent: "center", borderRadius: 23,
          backgroundColor: "rgba(255,255,255,0.55)",
          zIndex: 50, elevation: 50,
        }}
      >
        <Ionicons name="school-outline" size={21} color={colors.ink} />
      </Pressable>
    </View>
  );
}
