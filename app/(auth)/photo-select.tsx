import { View, Text, Pressable, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { colors } from "@/constants/theme";
import SceneBackdrop from "@/components/SceneBackdrop";
import StepRail from "@/components/ui/StepRail";
import { useEffect, useState } from "react";
import { getChildren, Child } from "@/lib/data";
import { speak } from "@/lib/speech";
import { PHRASES } from "@/constants/phrases";
import ChildPortrait from "@/components/ChildPortrait";

export default function PhotoSelectScreen() {
  const [children, setChildren] = useState<Child[]>([]);
  useEffect(() => {
    getChildren().then(setChildren);
    speak(PHRASES.pickYourPhoto);
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
            <Text className="mb-3 text-center text-[13px] font-bold" style={{ color: colors.ink }}>Pick my photo — only this tablet’s children</Text>
            <View className="flex-row flex-wrap justify-center gap-4">
              {children.map((c, i) => {
                const ring = RING[i % RING.length];
                return (
                  <Pressable key={c.id} onPress={() => router.push({ pathname: "/(auth)/secret-pictures", params: { childId: c.id } })}
                    className="items-center gap-1.5">
                    <ChildPortrait child={c} size={96} ringColor={ring} />
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
