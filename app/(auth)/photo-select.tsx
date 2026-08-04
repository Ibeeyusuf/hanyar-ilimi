import { View, Text, Pressable, ScrollView, useWindowDimensions, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { colors } from "@/constants/theme";
import SceneBackdrop from "@/components/SceneBackdrop";
import { AVATARS } from "@/constants/content";
import { useEffect, useState } from "react";
import { getChildren, Child } from "@/lib/data";
import { speak } from "@/lib/speech";
import { avatarSet } from "@/constants/images";

function StepRail({ step, total = 6 }: { step: number; total?: number }) {
  return (
    <View className="mb-5 flex-row items-center justify-center">
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} className="flex-row items-center">
          <View className="h-6 w-6 items-center justify-center rounded-full" style={{ backgroundColor: i <= step ? colors.green : "#fff", borderWidth: 2, borderColor: i <= step ? colors.green : colors.line }}>
            {i < step ? <Ionicons name="checkmark" size={12} color="#fff" /> : <Text className="text-[10px] font-bold" style={{ color: i === step ? "#fff" : colors.inkSoft }}>{i + 1}</Text>}
          </View>
          {i < total - 1 && <View className="h-0.5 w-6" style={{ backgroundColor: i < step ? colors.green : colors.line }} />}
        </View>
      ))}
    </View>
  );
}

export default function PhotoSelectScreen() {
  const [children, setChildren] = useState<Child[]>([]);
  useEffect(() => {
    getChildren().then(setChildren);
    speak("Danna hotonka");
  }, []);

  // Each child must be instantly distinguishable — she picks HER OWN picture
  // (PRD S2). Six distinct designer portraits, one per child on this tablet.
  const RING = ["#8B5CF6", "#F6B93B", "#7CC242", "#4AA3E0", "#F39C3D", "#E24B4B"];

  return (
    <View className="flex-1" style={{ backgroundColor: colors.skyMid }}>
      <SceneBackdrop />
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
        <View className="w-full rounded-3xl bg-white p-6" style={{ maxWidth: 640, shadowColor: "#1F2A3C", shadowOpacity: 0.12, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 6 }}>
          <StepRail step={0} />
          <Text className="text-center text-[24px] font-black" style={{ color: colors.purple }}>Wanene kai? · Who are you?</Text>
          <Text className="mb-5 mt-1 text-center text-[12px]" style={{ color: colors.inkSoft }}>
            Danna hotonka · Tap your photo
          </Text>

          <View className="rounded-2xl p-4" style={{ backgroundColor: "#EAF4FB" }}>
            <Text className="mb-3 text-center text-[13px] font-bold" style={{ color: colors.ink }}>Pick my photo — only this tablet's children</Text>
            <View className="flex-row flex-wrap justify-center gap-4">
              {children.map((c, i) => {
                const ring = RING[i % RING.length];
                const face = avatarSet[i % avatarSet.length];
                return (
                  <Pressable key={c.id} onPress={() => router.push({ pathname: "/(auth)/secret-pictures", params: { childId: c.id } })}
                    className="items-center gap-1.5">
                    <View className="items-center justify-center overflow-hidden rounded-full"
                      style={{ height: 96, width: 96, backgroundColor: "#fff", borderWidth: 4, borderColor: ring }}>
                      <Image source={face} style={{ width: 96, height: 96 }} resizeMode="cover" />
                    </View>
                    <Text className="text-[13px] font-bold" style={{ color: colors.ink }}>{c.name}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* On this screen, tapping your own face IS the action. A "continue"
              button here skipped child selection entirely, which left the
              passcode screen with nobody to verify against. */}
          <Text className="mt-5 text-center text-[12px]" style={{ color: colors.inkSoft }}>
            Danna hoton ka don ci gaba · Tap your photo to continue
          </Text>
        </View>

        <Pressable className="mt-5 flex-row items-center gap-2" onPress={() => router.replace("/(auth)/login")}>
          <View className="h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: "#fff", borderWidth: 1, borderColor: colors.line }}>
            <Ionicons name="arrow-back" size={16} color={colors.ink} />
          </View>
          <Text className="text-[13px]" style={{ color: colors.ink }}>Baya · Back</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
