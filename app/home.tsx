import { useCallback, useState } from "react";
import { View, Text, Pressable, ScrollView, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { colors, NAV } from "@/constants/theme";
import { elevation, surface } from "@/constants/ui";
import { SUBJECTS } from "@/constants/content";
import { navIcons } from "@/constants/images";
import AppShell from "@/components/nav/AppShell";
import Mascot from "@/components/Mascot";
import SmartImage from "@/components/SmartImage";
import { getSessionChildId, getChild, getTotalStars, getSubjectSummary, type Child } from "@/lib/data";
import { speak } from "@/lib/speech";
import { PHRASES } from "@/constants/phrases";
import { feedback } from "@/lib/feedback";

type Summary = { done: number; total: number; stars: number; percent: number };

/**
 * S4 — Home (PRD §4).
 *
 * The hub a child returns to after every lesson. Shows who they are, how many
 * stars they've earned, and two large academic tiles that RESUME at the next
 * incomplete lesson (FR-4.1) rather than dumping them in a list. Hygiene sits
 * below as an always-open banner, matching the PRD's "flat list, all unlocked".
 */
export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const wide = width >= NAV.breakpoint;
  const [child, setChild] = useState<Child | null>(null);
  const [stars, setStars] = useState(0);
  const [sum, setSum] = useState<Record<string, Summary>>({});

  useFocusEffect(useCallback(() => {
    let alive = true;
    (async () => {
      const id = await getSessionChildId();
      const c = id ? await getChild(id) : undefined;
      const total = await getTotalStars(id);
      const s: Record<string, Summary> = {};
      for (const sub of SUBJECTS) s[sub.id] = await getSubjectSummary(id, sub.id);
      if (!alive) return;
      setChild(c ?? null);
      setStars(total);
      setSum(s);
      // The child's name was spoken here, but a Hausa name read by an English
      // engine is worse than not saying it — and a name can never have a
      // recorded clip. The greeting is a fixed line; the name is on screen.
      speak(PHRASES.chooseWhatToLearn);
    })();
    return () => { alive = false; };
  }, []));

  /**
   * A subject tile opens that subject's module list.
   *
   * This used to jump straight to the child's next unfinished lesson, which
   * saved a tap but took away the map: a child could not see what they had
   * done, what came next, or choose to go back over something. Landing on the
   * module list keeps the structure visible, which is the point of the tile.
   */
  const open = (subjectId: string) => {
    feedback.tap();
    router.push(`/subject/${subjectId}`);
  };

  const academic = SUBJECTS.filter((s) => s.id !== "hygiene");
  const hygiene = SUBJECTS.find((s) => s.id === "hygiene");

  return (
    <AppShell crumbs={[{ label: "HOME", active: true }]}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {/* greeting + star total */}
        <View className="mb-5 flex-row items-center justify-between rounded-3xl bg-white p-4"
          style={{ borderWidth: 1, borderColor: surface.border, ...elevation.sm }}>
          <View className="flex-row items-center gap-3">
            <Mascot size={56} />
            <View>
              <Text className="text-[20px] font-black" style={{ color: colors.purple }}>
                Sannu{child ? `, ${child.name}` : ""}!
              </Text>
              <Text className="text-[12px]" style={{ color: colors.inkSoft }}>Zabi abin da za ka koya · Choose what to learn</Text>
            </View>
          </View>
          <View className="flex-row items-center gap-1.5 rounded-full px-4 py-2" style={{ backgroundColor: colors.cream, borderWidth: 1, borderColor: "#EFE3C6" }}>
            <Ionicons name="star" size={18} color={colors.gold} />
            <Text className="text-[18px] font-black" style={{ color: colors.ink }}>{stars}</Text>
          </View>
        </View>

        {/* two academic strands */}
        <View className={wide ? "flex-row gap-4" : "gap-4"}>
          {academic.map((s) => {
            const d = sum[s.id] ?? { done: 0, total: 0, percent: 0, stars: 0 };
            return (
              <Pressable key={s.id} onPress={() => open(s.id)}
                className="flex-1 overflow-hidden rounded-3xl bg-white"
                style={{ borderWidth: 1, borderColor: surface.border, ...elevation.md }}>
                <View style={{ height: 5, backgroundColor: s.color }} />
                <View className="items-center p-5">
                  {navIcons[s.id]
                    ? <SmartImage source={navIcons[s.id]} size={78} />
                    : <Ionicons name={s.icon as any} size={64} color={s.color} />}
                  <Text className="mt-2 text-[20px] font-black" style={{ color: colors.ink }}>{s.en}</Text>
                  <Text className="text-[12px]" style={{ color: colors.inkSoft }}>{s.ha}</Text>

                  <View className="mt-3 h-2.5 w-full overflow-hidden rounded-full" style={{ backgroundColor: "#EEF0F5" }}>
                    <View style={{ width: `${d.percent}%`, height: "100%", backgroundColor: s.color, borderRadius: 99 }} />
                  </View>
                  <Text className="mt-1.5 text-[11.5px]" style={{ color: colors.inkSoft }}>
                    {d.done} / {d.total} darussa · {d.percent}%
                  </Text>

                  <View className="mt-3 flex-row items-center gap-2 rounded-full px-5 py-2.5" style={{ backgroundColor: s.color }}>
                    <Ionicons name="play" size={16} color="#fff" />
                    <Text className="text-[13px] font-black text-white">{d.done ? "CI GABA" : "FARA"}</Text>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* hygiene — always open (PRD §3.1) */}
        {hygiene && (
          <Pressable onPress={() => { feedback.tap(); router.push(`/subject/${hygiene.id}`); }}
            className="mt-4 flex-row items-center gap-4 overflow-hidden rounded-3xl bg-white p-4"
            style={{ borderWidth: 1, borderColor: surface.border, ...elevation.sm }}>
            {navIcons[hygiene.id]
              ? <SmartImage source={navIcons[hygiene.id]} size={56} />
              : <Ionicons name={hygiene.icon as any} size={44} color={hygiene.color} />}
            <View className="flex-1">
              <Text className="text-[17px] font-black" style={{ color: colors.ink }}>{hygiene.en}</Text>
              <Text className="text-[12px]" style={{ color: colors.inkSoft }}>{hygiene.ha} · duk a buɗe</Text>
            </View>
            <View className="flex-row items-center gap-1 rounded-full px-3 py-1.5" style={{ backgroundColor: (hygiene.color ?? colors.green) + "22" }}>
              <Ionicons name="star" size={13} color={colors.gold} />
              <Text className="text-[12px] font-bold" style={{ color: colors.ink }}>{(sum[hygiene.id]?.stars) ?? 0}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.inkSoft} />
          </Pressable>
        )}
      </ScrollView>
    </AppShell>
  );
}
