import { View, Text, Pressable, ScrollView, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import { speak } from "@/lib/speech";
import { PHRASES } from "@/constants/phrases";
import { colors, NAV } from "@/constants/theme";
import { SUBJECTS, MODULES } from "@/constants/content";
import { getSessionChildId, getLessonStates, type LessonState } from "@/lib/data";
import AppShell from "@/components/nav/AppShell";

const CARD_TINT = ["#EAF6E0", "#FBF3DC", "#F5EAF9", "#FCE9EC", "#E7F1FB", "#FBF3DC"];

export default function ModuleLessonsScreen() {
  // FR-1.2: speak the screen instruction on load
  useEffect(() => { speak(PHRASES.chooseALesson); }, []);
  const { subject, module } = useLocalSearchParams<{ subject: string; module: string }>();
  const meta = SUBJECTS.find((s) => s.id === subject) ?? SUBJECTS[0];
  const modMeta = MODULES[meta.id]?.find((m) => m.id === module);
  const { width } = useWindowDimensions();
  const cardW = width >= NAV.breakpoint ? "31%" : width >= 560 ? "47%" : "100%";

  // Real stars + sequential unlock, recomputed whenever the screen regains
  // focus so finishing a lesson visibly unlocks the next one.
  const [lessons, setLessons] = useState<LessonState[]>([]);
  useFocusEffect(useCallback(() => {
    let alive = true;
    (async () => {
      const childId = await getSessionChildId();
      const states = await getLessonStates(childId, meta.id, module as string);
      if (alive) setLessons(states);
    })();
    return () => { alive = false; };
  }, [meta.id, module]));

  return (
    <AppShell crumbs={[{ label: meta.en, color: meta.color }, { label: "MODULES" }, { label: `${modMeta?.num}. ${modMeta?.en}`, active: true }]}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <View className="mb-4 flex-row items-center justify-center gap-3">
          <View className="h-14 w-14 items-center justify-center rounded-2xl" style={{ backgroundColor: (meta.color ?? colors.purple) + "22" }}>
            <Ionicons name={(modMeta?.icon as any) ?? "book"} size={28} color={meta.color ?? colors.purple} />
          </View>
          <View>
            <Text className="text-[24px] font-black" style={{ color: colors.purple }}>{modMeta?.num}. {modMeta?.en}</Text>
            <Text className="text-[12px]" style={{ color: colors.purpleDeep }}>{modMeta?.ha}: kalmomi da yaddarorin su.</Text>
          </View>
        </View>

        <View className="flex-row flex-wrap justify-center" style={{ gap: 16 }}>
          {lessons.map((l, i) => (
            <Pressable key={l.id} disabled={l.locked} onPress={() => router.push(`/subject/${meta.id}/${module}/${l.id}`)}
              className="rounded-3xl p-4" style={{ width: cardW as any, backgroundColor: CARD_TINT[i % CARD_TINT.length], borderWidth: 2, borderColor: "#EFE9DB", opacity: l.locked ? 0.75 : 1, shadowColor: "#1F2A3C", shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 2 }}>
              <View className="mb-2 flex-row items-center gap-2">
                <View className="h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: colors.purple }}>
                  <Text className="text-[13px] font-black text-white">{l.num}</Text>
                </View>
                <Text className="flex-1 text-[14px] font-black" style={{ color: colors.ink }}>{l.ha}</Text>
              </View>
              <View className="h-16 items-center justify-center rounded-2xl bg-white/50">
                <Ionicons name={(modMeta?.icon as any) ?? "book"} size={30} color={(meta.color ?? colors.purple) + "CC"} />
              </View>
              <View className="mt-2 flex-row items-center justify-between">
                <View className="flex-row gap-0.5">
                  {[0, 1, 2].map((s) => (
                    <Ionicons key={s} name={s < l.stars ? "star" : "star-outline"} size={16} color={colors.gold} />
                  ))}
                </View>
                <View className="h-7 w-7 items-center justify-center rounded-full" style={{ backgroundColor: l.done ? colors.green : l.locked ? colors.inkSoft : colors.purple }}>
                  <Ionicons name={l.done ? "checkmark" : l.locked ? "lock-closed" : "arrow-forward"} size={14} color="#fff" />
                </View>
              </View>
            </Pressable>
          ))}
        </View>

        <View className="mt-6 flex-row items-center justify-between px-2">
          <Pressable onPress={() => router.back()} className="flex-row items-center gap-2 rounded-full bg-white px-5 py-2.5" style={{ borderWidth: 1, borderColor: colors.line }}>
            <Ionicons name="arrow-back" size={16} color={colors.ink} />
            <Text className="text-[13px] font-bold" style={{ color: colors.ink }}>BAYA</Text>
          </Pressable>
          <Text className="text-[12px] font-bold" style={{ color: colors.inkSoft }}>
            {lessons.filter((l) => l.done).length} / {lessons.length} an kammala
          </Text>
        </View>
      </ScrollView>
    </AppShell>
  );
}
