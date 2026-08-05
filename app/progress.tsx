import { useCallback, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { colors } from "@/constants/theme";
import { elevation, surface } from "@/constants/ui";
import { SUBJECTS, MODULES } from "@/constants/content";
import AppShell from "@/components/nav/AppShell";
import { getSessionChildId, getChild, getTotalStars, getSubjectSummary, getModuleProgress, getMastery, type Child } from "@/lib/data";

type Sum = { done: number; total: number; stars: number; percent: number };

/** MY PROGRESS — every figure here is the child's real recorded data. */
export default function ProgressScreen() {
  const [child, setChild] = useState<Child | null>(null);
  const [stars, setStars] = useState(0);
  const [subj, setSubj] = useState<Record<string, Sum>>({});
  const [mods, setMods] = useState<{ id: string; label: string; pct: number; color: string }[]>([]);
  const [mastery, setMastery] = useState(0);

  useFocusEffect(useCallback(() => {
    let alive = true;
    (async () => {
      const id = await getSessionChildId();
      const c = id ? await getChild(id) : undefined;
      const total = await getTotalStars(id);
      const s: Record<string, Sum> = {};
      const m: { id: string; label: string; pct: number; color: string }[] = [];
      for (const sub of SUBJECTS) {
        s[sub.id] = await getSubjectSummary(id, sub.id);
        for (const mod of MODULES[sub.id] ?? []) {
          const pct = await getModuleProgress(id, sub.id, mod.id);
          if (pct > 0) m.push({ id: `${sub.id}/${mod.id}`, label: mod.en, pct, color: sub.color });
        }
      }
      const ms = id ? await getMastery(id) : [];
      const correct = ms.reduce((a, x) => a + x.correct, 0);
      const attempts = ms.reduce((a, x) => a + x.total, 0);
      if (!alive) return;
      setChild(c ?? null); setStars(total); setSubj(s);
      setMods(m.sort((a, b) => b.pct - a.pct).slice(0, 6));
      setMastery(attempts ? Math.round((correct / attempts) * 100) : 0);
    })();
    return () => { alive = false; };
  }, []));

  const totalDone = Object.values(subj).reduce((a, s) => a + s.done, 0);
  const totalAll = Object.values(subj).reduce((a, s) => a + s.total, 0);

  return (
    <AppShell crumbs={[{ label: "MY PROGRESS", active: true }]}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* headline */}
        <View className="items-center rounded-3xl p-5" style={{ backgroundColor: colors.purple, ...elevation.md }}>
          <Ionicons name="ribbon" size={28} color="#fff" />
          <Text className="mt-1 text-[17px] font-black text-white">{child?.name ?? "—"}</Text>
          <Text className="text-[12px] text-white/85">
            {stars} taurari · {totalDone} / {totalAll} darussa
          </Text>
        </View>

        {/* headline metrics */}
        <View className="mt-4 flex-row gap-3">
          {[
            { label: "TAURARI", value: stars, icon: "star" as const, color: colors.gold },
            { label: "DARUSSA", value: totalDone, icon: "book" as const, color: colors.green },
            { label: "MASTERY", value: `${mastery}%`, icon: "trending-up" as const, color: colors.purple },
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

        {/* per subject */}
        <Text className="mb-2 mt-5 text-[15px] font-black" style={{ color: colors.ink }}>Ci gaba a kowane fanni</Text>
        <View className="gap-3">
          {SUBJECTS.map((s) => {
            const d = subj[s.id] ?? { done: 0, total: 0, percent: 0, stars: 0 };
            return (
              <View key={s.id} className="rounded-2xl bg-white p-4" style={{ borderWidth: 1, borderColor: surface.border, ...elevation.sm }}>
                <View className="mb-2 flex-row items-center justify-between">
                  <Text className="text-[14px] font-black" style={{ color: colors.ink }}>{s.en}</Text>
                  <Text className="text-[12px] font-bold" style={{ color: s.color }}>{d.percent}%</Text>
                </View>
                <View className="h-2.5 overflow-hidden rounded-full" style={{ backgroundColor: "#EEF0F5" }}>
                  <View style={{ width: `${d.percent}%`, height: "100%", backgroundColor: s.color, borderRadius: 99 }} />
                </View>
                <Text className="mt-1.5 text-[11.5px]" style={{ color: colors.inkSoft }}>{d.done} / {d.total} darussa · {d.stars} taurari</Text>
              </View>
            );
          })}
        </View>

        {/* modules actually started */}
        {mods.length > 0 && (
          <>
            <Text className="mb-2 mt-5 text-[15px] font-black" style={{ color: colors.ink }}>Darussan da ka fara</Text>
            <View className="flex-row flex-wrap gap-3">
              {mods.map((m) => (
                <View key={m.id} className="items-center rounded-2xl bg-white p-4" style={{ width: "47%", borderWidth: 1, borderColor: surface.border, ...elevation.sm }}>
                  <Text className="text-[24px] font-black" style={{ color: m.color }}>{m.pct}%</Text>
                  <Text className="text-[11.5px]" style={{ color: colors.inkSoft }}>{m.label}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {totalDone === 0 && (
          <View className="mt-5 items-center rounded-2xl p-5" style={{ backgroundColor: "#F4F0FE" }}>
            <Ionicons name="rocket-outline" size={26} color={colors.purple} />
            <Text className="mt-2 text-center text-[13px] font-bold" style={{ color: colors.ink }}>
              Ba ka fara darasi ba tukuna. Fara yanzu!
            </Text>
          </View>
        )}
      </ScrollView>
    </AppShell>
  );
}
