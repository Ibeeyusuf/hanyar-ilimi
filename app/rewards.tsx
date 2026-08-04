import { useCallback, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { colors } from "@/constants/theme";
import { elevation, surface } from "@/constants/ui";
import { SUBJECTS } from "@/constants/content";
import AppShell from "@/components/nav/AppShell";
import { getSessionChildId, getTotalStars, getSubjectSummary, getMastery } from "@/lib/data";

/**
 * REWARDS — badges are EARNED from real recorded progress, never invented.
 * Locked badges stay visible so a child can see what to aim for, and nothing
 * is ever taken away (PRD §3.5: stars only increase, no losses).
 */
type Badge = { id: string; label: string; ha: string; icon: any; color: string; earned: boolean; hint: string };

export default function RewardsScreen() {
  const [stars, setStars] = useState(0);
  const [badges, setBadges] = useState<Badge[]>([]);

  useFocusEffect(useCallback(() => {
    let alive = true;
    (async () => {
      const id = await getSessionChildId();
      const total = await getTotalStars(id);
      let done = 0;
      const perSubject: Record<string, number> = {};
      for (const s of SUBJECTS) {
        const sum = await getSubjectSummary(id, s.id);
        perSubject[s.id] = sum.done;
        done += sum.done;
      }
      const ms = id ? await getMastery(id) : [];
      const correct = ms.reduce((a, x) => a + x.correct, 0);
      const attempts = ms.reduce((a, x) => a + x.total, 0);
      const pct = attempts ? correct / attempts : 0;

      const list: Badge[] = [
        { id: "first", label: "First Steps", ha: "Matakin Farko", icon: "footsteps", color: colors.green,
          earned: done >= 1, hint: "Kammala darasi 1" },
        { id: "five", label: "Getting Going", ha: "Ci Gaba", icon: "flame", color: colors.orange,
          earned: done >= 5, hint: "Kammala darussa 5" },
        { id: "reader", label: "Reader", ha: "Mai Karatu", icon: "book", color: colors.literacy,
          earned: (perSubject["literacy"] ?? 0) >= 3, hint: "Karatu: darussa 3" },
        { id: "counter", label: "Math Whiz", ha: "Gwanin Lissafi", icon: "calculator", color: colors.numeracy,
          earned: (perSubject["numeracy"] ?? 0) >= 3, hint: "Lissafi: darussa 3" },
        { id: "clean", label: "Clean Hero", ha: "Jarumin Tsafta", icon: "water", color: colors.hygiene,
          earned: (perSubject["hygiene"] ?? 0) >= 3, hint: "Tsafta: darussa 3" },
        { id: "stars10", label: "Star Collector", ha: "Mai Tara Taurari", icon: "star", color: colors.gold,
          earned: total >= 10, hint: "Tara taurari 10" },
        { id: "sharp", label: "Sharp Mind", ha: "Kaifin Hankali", icon: "bulb", color: colors.purple,
          earned: attempts >= 5 && pct >= 0.8, hint: "80% daidai" },
        { id: "ten", label: "Ten Lessons", ha: "Darussa Goma", icon: "trophy", color: colors.gold,
          earned: done >= 10, hint: "Kammala darussa 10" },
      ];
      if (alive) { setStars(total); setBadges(list); }
    })();
    return () => { alive = false; };
  }, []));

  const earned = badges.filter((b) => b.earned).length;

  return (
    <AppShell crumbs={[{ label: "REWARDS", active: true }]}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View className="items-center rounded-3xl p-5" style={{ backgroundColor: colors.gold, ...elevation.md }}>
          <Ionicons name="trophy" size={30} color="#fff" />
          <Text className="mt-1 text-[20px] font-black text-white">{stars} taurari</Text>
          <Text className="text-[12px] text-white/90">{earned} / {badges.length} lambobin yabo</Text>
        </View>

        <Text className="mb-2 mt-5 text-[15px] font-black" style={{ color: colors.ink }}>Lambobin Yabo · Badges</Text>
        <View className="flex-row flex-wrap gap-3">
          {badges.map((b) => (
            <View key={b.id} className="items-center rounded-2xl bg-white p-4"
              style={{ width: "47%", borderWidth: 1, borderColor: surface.border, opacity: b.earned ? 1 : 0.55, ...elevation.sm }}>
              <View className="h-14 w-14 items-center justify-center rounded-full"
                style={{ backgroundColor: b.earned ? b.color : "#E9EAF0" }}>
                <Ionicons name={b.earned ? b.icon : "lock-closed"} size={26} color={b.earned ? "#fff" : colors.inkSoft} />
              </View>
              <Text className="mt-2 text-center text-[13px] font-black" style={{ color: colors.ink }}>{b.ha}</Text>
              <Text className="text-center text-[11px]" style={{ color: colors.inkSoft }}>
                {b.earned ? b.label : b.hint}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </AppShell>
  );
}
