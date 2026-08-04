
import { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, Switch } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { colors } from "@/constants/theme";
import AppShell from "@/components/nav/AppShell";
import { setSoundEnabled } from "@/lib/feedback";
import { setSpeechEnabled, hasHausaVoice } from "@/lib/speech";

const LINKS = [
  { t: "Profile Information", s: "View and update your personal details.", icon: "person", color: colors.purple },
  { t: "Account & Security", s: "Change password and manage account security.", icon: "shield-checkmark", color: colors.green },
  { t: "Parental Controls", s: "Manage screen time, content and app access.", icon: "people", color: colors.blue },
];

export default function SettingsScreen() {
  // Be explicit about whether this device can actually speak Hausa.
  const [hausa, setHausa] = useState<boolean | null>(null);
  useEffect(() => { hasHausaVoice().then(setHausa).catch(() => setHausa(false)); }, []);
  const [notif, setNotif] = useState(true);
  const [sound, setSound] = useState(true);
  return (
    <AppShell crumbs={[{ label: "LITERACY", color: colors.literacy }, { label: "MODULES" }, { label: "SETTINGS", active: true }]} showBee={false}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View className="mb-4 flex-row items-center gap-3 rounded-2xl p-4" style={{ backgroundColor: hausa ? "#E7F4DC" : "#FFF6E5", borderWidth: 1, borderColor: hausa ? "#C7E3AE" : "#F0D9A8" }}>
          <Ionicons name={hausa ? "checkmark-circle" : "information-circle"} size={20} color={hausa ? colors.greenDark : colors.gold} />
          <View className="flex-1">
            <Text className="text-[13px] font-black" style={{ color: colors.ink }}>
              {hausa === null ? "Checking voice…" : hausa ? "Hausa voice available" : "No Hausa voice on this device"}
            </Text>
            <Text className="text-[11.5px]" style={{ color: colors.inkSoft }}>
              {hausa
                ? "Lessons are narrated in Hausa."
                : "Lessons are narrated with the device's default voice. Installing a Hausa voice, or adding the recorded audio library, gives correct pronunciation."}
            </Text>
          </View>
        </View>
        <View className="rounded-3xl bg-white p-5" style={{ shadowColor: "#1F2A3C", shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 3 }}>
          <View className="mb-4 flex-row items-center gap-3">
            <View className="h-12 w-12 items-center justify-center rounded-2xl" style={{ backgroundColor: colors.purpleSoft }}>
              <Ionicons name="settings" size={24} color={colors.purple} />
            </View>
            <View>
              <Text className="text-[22px] font-black" style={{ color: colors.ink }}>Settings</Text>
              <Text className="text-[12px]" style={{ color: colors.inkSoft }}>Manage your account and app preferences.</Text>
            </View>
          </View>

          {LINKS.map((l) => (
            <Pressable key={l.t} className="flex-row items-center gap-3 border-b py-3.5" style={{ borderColor: colors.line }}>
              <View className="h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: l.color }}>
                <Ionicons name={l.icon as any} size={16} color="#fff" />
              </View>
              <View className="flex-1">
                <Text className="text-[14px] font-bold" style={{ color: colors.ink }}>{l.t}</Text>
                <Text className="text-[11px]" style={{ color: colors.inkSoft }}>{l.s}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.inkSoft} />
            </Pressable>
          ))}

          <View className="flex-row items-center gap-3 border-b py-3.5" style={{ borderColor: colors.line }}>
            <View className="h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: colors.gold }}>
              <Ionicons name="notifications" size={16} color="#fff" />
            </View>
            <View className="flex-1">
              <Text className="text-[14px] font-bold" style={{ color: colors.ink }}>Notifications</Text>
              <Text className="text-[11px]" style={{ color: colors.inkSoft }}>Choose what notifications you want to receive.</Text>
            </View>
            <Switch value={notif} onValueChange={setNotif} trackColor={{ true: colors.purple }} />
          </View>
          <View className="flex-row items-center gap-3 border-b py-3.5" style={{ borderColor: colors.line }}>
            <View className="h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: colors.red }}>
              <Ionicons name="musical-notes" size={16} color="#fff" />
            </View>
            <View className="flex-1">
              <Text className="text-[14px] font-bold" style={{ color: colors.ink }}>Sound & Music</Text>
              <Text className="text-[11px]" style={{ color: colors.inkSoft }}>Control background music and sound effects.</Text>
            </View>
            <Switch value={sound} onValueChange={(v) => { setSound(v); setSoundEnabled(v); setSpeechEnabled(v); }} trackColor={{ true: colors.purple }} />
          </View>

          <Pressable onPress={() => router.replace("/(auth)/login")} className="mt-4 flex-row items-center gap-3 rounded-2xl p-3.5" style={{ backgroundColor: "#FCEBEA" }}>
            <Ionicons name="log-out" size={20} color={colors.red} />
            <View>
              <Text className="text-[14px] font-bold" style={{ color: colors.red }}>Log Out</Text>
              <Text className="text-[11px]" style={{ color: colors.inkSoft }}>Sign out from your account.</Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </AppShell>
  );
}