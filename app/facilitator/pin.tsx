import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { colors } from "@/constants/theme";
import SceneBackdrop from "@/components/SceneBackdrop";
import { checkFacilitatorPin } from "@/lib/data";
import { feedback } from "@/lib/feedback";

// PRD §4 S8: 4-digit PIN, 5 wrong -> 60s cooldown. Default PIN 1234 (demo).
export default function FacilitatorPin() {
  const [pin, setPin] = useState("");
  const [wrong, setWrong] = useState(0);
  const [cooldown, setCooldown] = useState(false);

  const press = async (d: string) => {
    if (cooldown) return;
    feedback.tap();
    const next = (pin + d).slice(0, 4);
    setPin(next);
    if (next.length === 4) {
      const ok = await checkFacilitatorPin(next);
      if (ok) { feedback.success(); router.replace("/facilitator/dashboard"); }
      else {
        feedback.wrong();
        const w = wrong + 1;
        setWrong(w);
        setPin("");
        if (w >= 5) { setCooldown(true); setTimeout(() => { setCooldown(false); setWrong(0); }, 60000); }
      }
    }
  };
  const del = () => setPin(pin.slice(0, -1));

  return (
    <View className="flex-1" style={{ backgroundColor: colors.skyMid }}>
      <SceneBackdrop />
      <View className="flex-1 items-center justify-center p-6">
        <View className="w-full rounded-3xl bg-white p-6" style={{ maxWidth: 360, shadowColor: "#1F2A3C", shadowOpacity: 0.14, shadowRadius: 24, shadowOffset: { width: 0, height: 10 }, elevation: 8 }}>
          <View className="items-center">
            <View className="h-14 w-14 items-center justify-center rounded-2xl" style={{ backgroundColor: colors.purpleSoft }}>
              <Ionicons name="lock-closed" size={26} color={colors.purple} />
            </View>
            <Text className="mt-3 text-[18px] font-black" style={{ color: colors.ink }}>Facilitator Access</Text>
            <Text className="text-[12px]" style={{ color: colors.inkSoft }}>Enter your 4-digit PIN (demo: 1234)</Text>
          </View>

          <View className="my-5 flex-row justify-center gap-3">
            {[0, 1, 2, 3].map((i) => (
              <View key={i} className="h-4 w-4 rounded-full" style={{ backgroundColor: i < pin.length ? colors.purple : colors.line }} />
            ))}
          </View>

          {cooldown && <Text className="mb-2 text-center text-[12px]" style={{ color: colors.red }}>Too many attempts. Wait 60s.</Text>}
          {!cooldown && wrong > 0 && <Text className="mb-2 text-center text-[12px]" style={{ color: colors.red }}>Wrong PIN. {5 - wrong} tries left.</Text>}

          <View className="flex-row flex-wrap justify-center" style={{ gap: 12 }}>
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
              <Pressable key={d} onPress={() => press(d)} className="h-16 w-16 items-center justify-center rounded-2xl" style={{ backgroundColor: colors.cream, borderWidth: 1, borderColor: colors.line }}>
                <Text className="text-[22px] font-black" style={{ color: colors.ink }}>{d}</Text>
              </Pressable>
            ))}
            <View className="h-16 w-16" />
            <Pressable onPress={() => press("0")} className="h-16 w-16 items-center justify-center rounded-2xl" style={{ backgroundColor: colors.cream, borderWidth: 1, borderColor: colors.line }}>
              <Text className="text-[22px] font-black" style={{ color: colors.ink }}>0</Text>
            </Pressable>
            <Pressable onPress={del} className="h-16 w-16 items-center justify-center rounded-2xl" style={{ borderWidth: 1, borderColor: colors.line }}>
              <Ionicons name="backspace-outline" size={22} color={colors.inkSoft} />
            </Pressable>
          </View>

          <Pressable onPress={() => router.replace("/(auth)/login")} className="mt-4 items-center py-2">
            <Text className="text-[12px]" style={{ color: colors.inkSoft }}>Back to child login</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
