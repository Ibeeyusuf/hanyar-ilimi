import { useCallback, useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { colors } from "@/constants/theme";
import { elevation, surface } from "@/constants/ui";
import { SUBJECTS } from "@/constants/content";
import AppShell from "@/components/nav/AppShell";
import Mascot from "@/components/Mascot";
import { getSessionChildId, getChild, getTotalStars, getSubjectSummary, getEvents, logout, type Child } from "@/lib/data";
import { feedback } from "@/lib/feedback";

/** MY PROFILE — the child's real record. No invented figures. */
export default function ProfileScreen() {
  const [child, setChild] = useState<Child | null>(null);
  const [stars, setStars] = useState(0);
  const [done, setDone] = useState(0);
  const [days, setDays] = useState(0);

  useFocusEffect(useCallback(() => {
    let alive = true;
    (async () => {
      const id = await getSessionChildId();
      const c = id ? await getChild(id) : undefined;
      const total = await getTotalStars(id);
      let d = 0;
      for (const s of SUBJECTS) d += (await getSubjectSummary(id, s.id)).done;
      // distinct days this child has logged in (attendance)
      const evs = await getEvents();
      const set = new Set(evs.filter((e) => e.type === "login" && e.childId === id)
        .map((e) => new Date(e.ts).toDateString()));
      if (!alive) return;
      setChild(c ?? null); setStars(total); setDone(d); setDays(set.size);
    })();
    return () => { alive = false; };
  }, []));

  const signOut = async () => { feedback.tap(); await logout(); router.replace("/(auth)/login"); };

  return (
    <AppShell crumbs={[{ label: "MY PROFILE", active: true }]}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View className="items-center rounded-3xl bg-white p-6" style={{ borderWidth: 1, borderColor: surface.border, ...elevation.md }}>
          <Mascot size={84} />
          <Text className="mt-2 text-[22px] font-black" style={{ color: colors.purple }}>{child?.name ?? "—"}</Text>
          <Text className="text-[12px]" style={{ color: colors.inkSoft }}>
            {child?.sex === "f" ? "Yarinya" : child?.sex === "m" ? "Yaro" : ""}
            {child?.dobEst ? ` · shekaru ${new Date().getFullYear() - child.dobEst}` : ""}
          </Text>
        </View>

        <View className="mt-4 flex-row gap-3">
          {[
            { label: "TAURARI", value: stars, icon: "star" as const, color: colors.gold },
            { label: "DARUSSA", value: done, icon: "book" as const, color: colors.green },
            { label: "KWANAKI", value: days, icon: "calendar" as const, color: colors.blue },
          ].map((m) => (
            <View key={m.label} className="flex-1 overflow-hidden rounded-2xl bg-white" style={{ borderWidth: 1, borderColor: surface.border, ...elevation.sm }}>
              <View style={{ height: 3, backgroundColor: m.color }} />
              <View className="items-center p-3">
                <Ionicons name={m.icon} size={16} color={m.color} />
                <Text className="mt-1 text-[22px] font-black" style={{ color: m.color }}>{m.value}</Text>
                <Text className="text-[10px] font-black tracking-wider" style={{ color: colors.inkSoft }}>{m.label}</Text>
              </View>
            </View>
          ))}
        </View>

        <View className="mt-4 gap-2">
          <Pressable onPress={() => { feedback.tap(); router.push("/progress"); }}
            className="flex-row items-center gap-3 rounded-2xl bg-white p-4" style={{ borderWidth: 1, borderColor: surface.border, ...elevation.sm }}>
            <Ionicons name="stats-chart" size={20} color={colors.purple} />
            <Text className="flex-1 text-[14px] font-bold" style={{ color: colors.ink }}>Ci gabana · My Progress</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.inkSoft} />
          </Pressable>
          <Pressable onPress={() => { feedback.tap(); router.push("/rewards"); }}
            className="flex-row items-center gap-3 rounded-2xl bg-white p-4" style={{ borderWidth: 1, borderColor: surface.border, ...elevation.sm }}>
            <Ionicons name="trophy" size={20} color={colors.gold} />
            <Text className="flex-1 text-[14px] font-bold" style={{ color: colors.ink }}>Lambobin yabo · Rewards</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.inkSoft} />
          </Pressable>
          <Pressable onPress={signOut}
            className="flex-row items-center gap-3 rounded-2xl bg-white p-4" style={{ borderWidth: 1, borderColor: surface.border, ...elevation.sm }}>
            <Ionicons name="log-out-outline" size={20} color={colors.red} />
            <Text className="flex-1 text-[14px] font-bold" style={{ color: colors.red }}>Fita · Log out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </AppShell>
  );
}
