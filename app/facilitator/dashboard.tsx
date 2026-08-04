import { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { colors } from "@/constants/theme";
import { elevation, surface, radius } from "@/constants/ui";
import SceneBackdrop from "@/components/SceneBackdrop";
import { getChildren, hasLoggedInToday, masteryPercent, childrenNeedingHelp, getProgress, type Child } from "@/lib/data";

type Row = { child: Child; present: boolean; mastery: number; lessons: number; needsHelp: string[] };

export default function Dashboard() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [flags, setFlags] = useState<Record<string, string[]>>({});

  const load = async () => {
    const children = await getChildren();
    const help = await childrenNeedingHelp();
    setFlags(help);
    const built: Row[] = [];
    for (const c of children) {
      const present = await hasLoggedInToday(c.id);
      const mastery = await masteryPercent(c.id);
      const prog = await getProgress(c.id);
      built.push({ child: c, present, mastery, lessons: prog.filter((p) => p.completedAt).length, needsHelp: help[c.id] ?? [] });
    }
    setRows(built);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const presentCount = rows.filter((r) => r.present).length;
  const avgMastery = rows.length ? Math.round(rows.reduce((s, r) => s + r.mastery, 0) / rows.length) : 0;
  const flaggedCount = Object.keys(flags).length;

  return (
    <View className="flex-1" style={{ backgroundColor: colors.skyMid }}>
      <SceneBackdrop />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* header */}
        <View className="mb-4 flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <Pressable onPress={() => router.replace("/(auth)/login")} className="h-10 w-10 items-center justify-center rounded-full bg-white" style={{ borderWidth: 1, borderColor: surface.border, ...elevation.xs }}>
              <Ionicons name="arrow-back" size={19} color={colors.ink} />
            </Pressable>
            <View>
              <Text className="text-[19px] font-black" style={{ color: colors.ink }}>Morning Shift · Group A</Text>
              <Text className="text-[11.5px]" style={{ color: colors.inkSoft }}>{new Date().toDateString()}</Text>
            </View>
          </View>
          <View className="flex-row items-center gap-1.5 rounded-full px-3 py-1.5" style={{ backgroundColor: "#E7F4DC", ...elevation.xs }}>
            <Ionicons name="cloud-offline-outline" size={13} color={colors.greenDark} />
            <Text className="text-[11px] font-bold" style={{ color: colors.greenDark }}>Offline — will sync</Text>
          </View>
        </View>

        {/* metric cards — consistent accent-bar pattern, real elevation */}
        <View className="mb-5 flex-row gap-3">
          {[
            { label: "PRESENT TODAY", value: presentCount, suffix: ` / ${rows.length}`, color: colors.green, icon: "checkmark-done" as const },
            { label: "AVG MASTERY", value: `${avgMastery}%`, suffix: "", color: colors.purple, icon: "trending-up" as const },
            { label: "NEEDS HELP", value: flaggedCount, suffix: "", color: flaggedCount ? colors.red : colors.inkSoft, icon: "alert-circle" as const },
          ].map((m, i) => (
            <View key={i} className="flex-1 overflow-hidden rounded-2xl bg-white" style={{ borderWidth: 1, borderColor: surface.border, ...elevation.sm }}>
              <View style={{ height: 3, backgroundColor: m.color }} />
              <View className="p-4">
                <View className="mb-2 flex-row items-center justify-between">
                  <Text className="text-[10.5px] font-black tracking-wider" style={{ color: colors.inkSoft }}>{m.label}</Text>
                  <Ionicons name={m.icon} size={14} color={m.color} />
                </View>
                <Text className="text-[26px] font-black" style={{ color: m.color }}>{m.value}<Text className="text-[15px]" style={{ color: colors.inkSoft }}>{m.suffix}</Text></Text>
              </View>
            </View>
          ))}
        </View>

        {/* actions */}
        <View className="mb-4 flex-row gap-3">
          <Pressable onPress={() => router.push("/facilitator/enrol")} className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl py-3.5" style={{ backgroundColor: colors.purple, ...elevation.xs }}>
            <Ionicons name="person-add" size={17} color="#fff" />
            <Text className="text-[13px] font-black text-white">Enrol Child</Text>
          </Pressable>
          <Pressable onPress={load} className="flex-row items-center justify-center gap-2 rounded-2xl px-5 py-3.5" style={{ backgroundColor: "#fff", borderWidth: 1, borderColor: surface.border, ...elevation.xs }}>
            <Ionicons name="refresh" size={17} color={colors.ink} />
            <Text className="text-[13px] font-bold" style={{ color: colors.ink }}>Refresh</Text>
          </Pressable>
        </View>

        {/* child list */}
        <View className="overflow-hidden rounded-2xl bg-white" style={{ borderWidth: 1, borderColor: surface.border, ...elevation.sm }}>
          <View className="flex-row items-center px-4 py-2.5" style={{ backgroundColor: surface.cardAlt, borderBottomWidth: 1, borderBottomColor: surface.border }}>
            <Text className="flex-1 text-[10.5px] font-black tracking-wider" style={{ color: colors.inkSoft }}>CHILD</Text>
            <Text className="text-[10.5px] font-black tracking-wider" style={{ color: colors.inkSoft }}>STATUS</Text>
          </View>
          {loading && <Text className="p-5 text-center text-[13px]" style={{ color: colors.inkSoft }}>Loading…</Text>}
          {!loading && rows.map((r, i) => (
            <View key={r.child.id} className="flex-row items-center gap-3 px-4 py-3" style={{ borderTopWidth: i === 0 ? 0 : 1, borderTopColor: surface.border }}>
              <View className="h-11 w-11 items-center justify-center rounded-full" style={{ backgroundColor: colors.purpleSoft }}>
                <Ionicons name="happy" size={21} color={colors.purple} />
              </View>
              <View className="flex-1">
                <Text className="text-[14px] font-bold" style={{ color: colors.ink }}>{r.child.name}</Text>
                <Text className="text-[11.5px]" style={{ color: colors.inkSoft }}>{r.lessons} lessons completed · {r.mastery}% mastery</Text>
              </View>
              <View className="flex-row items-center gap-2">
                {r.needsHelp.length > 0 && (
                  <View className="flex-row items-center gap-1 rounded-full px-2.5 py-1" style={{ backgroundColor: "#FCEBEA" }}>
                    <Ionicons name="alert-circle" size={12} color={colors.red} />
                    <Text className="text-[10px] font-bold" style={{ color: colors.red }}>needs help</Text>
                  </View>
                )}
                <View className="flex-row items-center gap-1 rounded-full px-2.5 py-1" style={{ backgroundColor: r.present ? "#E7F4DC" : surface.cardAlt }}>
                  <Ionicons name={r.present ? "checkmark-circle" : "ellipse-outline"} size={12} color={r.present ? colors.greenDark : colors.inkSoft} />
                  <Text className="text-[10px] font-bold" style={{ color: r.present ? colors.greenDark : colors.inkSoft }}>{r.present ? "present" : "absent"}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
