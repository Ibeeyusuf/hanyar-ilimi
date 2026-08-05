import { useState, useCallback, useEffect } from "react";
import { View, Text, Pressable, ScrollView, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { colors, NAV } from "@/constants/theme";
import { SUBJECTS, MODULES, getLessons, LESSON_SUBTITLES } from "@/constants/content";
import { contentFor } from "@/constants/lessonContent";
import { artForVisual, lessonVideo } from "@/constants/images";
import LessonMedia, { AudioBar } from "@/components/LessonMedia";
import { getSessionChildId, getDevice, logEvent, getLessonStates, type LessonState } from "@/lib/data";
import AppShell from "@/components/nav/AppShell";
import { speak } from "@/lib/speech";
import { feedback } from "@/lib/feedback";
import Bounce from "@/components/ui/Bounce";

const OPTION_COLORS = [
  { color: colors.purple, tint: colors.purpleSoft },
  { color: colors.green, tint: "#E7F4DC" },
  { color: colors.orange, tint: "#FBEEDD" },
];

export default function LessonScreen() {
  const { subject, module, lesson } = useLocalSearchParams<{ subject: string; module: string; lesson: string }>();
  const meta = SUBJECTS.find((s) => s.id === subject) ?? SUBJECTS[0];
  const modMeta = MODULES[meta.id]?.find((m) => m.id === module);
  const lessons = getLessons(meta.id, module as string);
  const active = lessons.find((l) => l.id === lesson) ?? lessons[0];
  const content = contentFor(meta.id, module as string, active.id, active.ha, lessons);
  const [sel, setSel] = useState<string | null>(null);
  const [correct, setCorrect] = useState(false);

  // The teaching screen showed no reaction to a wrong tap and let the child
  // continue anyway. It now confirms the right answer before moving on — this
  // is the teach step, so the point is to land the answer, not to score it.
  // Switching lessons from the rail replaces the route without unmounting the
  // screen, so the previous lesson's selection has to be cleared explicitly.
  useEffect(() => { setSel(null); setCorrect(false); }, [active?.id]);

  const choose = (label: string, isCorrect: boolean) => {
    setSel(label);
    speak(label);
    if (isCorrect) { setCorrect(true); feedback.correct(); }
    else { feedback.wrong(); }
  };

  // The lesson rail used to read `done`/`locked` straight off the static
  // content catalogue, so it contradicted the module screen next to it. Both
  // now derive from the child's recorded progress.
  const [states, setStates] = useState<LessonState[]>([]);
  useFocusEffect(useCallback(() => {
    let alive = true;
    (async () => {
      const childId = await getSessionChildId();
      const s = await getLessonStates(childId, meta.id, module as string);
      if (alive) setStates(s);
    })();
    return () => { alive = false; };
  }, [meta.id, module]));

  // FR-5.3: replay counts are logged — they signal which lessons children
  // find hard, which feeds content improvement.
  const countReplay = async () => {
    try {
      const childId = await getSessionChildId();
      const device = await getDevice();
      if (childId) await logEvent("item_response", childId, device.id, { kind: "replay", lesson: active?.id });
    } catch {}
  };
  const { width } = useWindowDimensions();
  const showRail = width >= NAV.breakpoint;

  return (
    <AppShell
      showBee={false}
      crumbs={[{ label: meta.en, color: meta.color }, { label: "MODULES" }, { label: `${modMeta?.num}. ${modMeta?.en}` }, { label: active.ha, active: true }]}
    >
      <View className="flex-1 flex-row">
        <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
          <View className="rounded-3xl bg-white p-5" style={{ shadowColor: "#1F2A3C", shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 3 }}>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Pressable onPress={() => { feedback.tap(); speak(content.word); }} className="h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: colors.purple }}>
                  <Ionicons name="volume-high" size={18} color="#fff" />
                </Pressable>
                <View>
                  <Text className="text-[20px] font-black" style={{ color: colors.purple }}>{active.num}. {active.ha}</Text>
                  <Text className="text-[12px]" style={{ color: colors.ink }}>Kalli hoton. Danna amsar da ta dace.</Text>
                </View>
              </View>
              <View className="flex-row items-center gap-1 rounded-full px-3 py-1.5" style={{ backgroundColor: colors.cream, borderWidth: 1, borderColor: "#EFE3C6" }}>
                <Ionicons name="star" size={14} color={colors.gold} />
                <Text className="text-[12px] font-bold" style={{ color: colors.ink }}>{active.num} / {lessons.length}</Text>
              </View>
            </View>

            {/* teaching clip — video-style player (PRD S5 / FR-5.2) */}
            <View className="mt-4">
              <LessonMedia
                video={lessonVideo[`${module}/${active?.id}`]}
                poster={artForVisual(content.visual)}
                word={content.word}
                sentence={content.hint}
                onReplay={countReplay}
              />
            </View>

            {/* narrated word with waveform */}
            <View className="mt-3">
              <AudioBar word={content.word} onReplay={countReplay} />
            </View>

            <Text className="mt-4 text-center text-[18px] font-black" style={{ color: colors.ink }}>{content.prompt}</Text>

            <View className="mt-4 flex-row flex-wrap justify-center gap-3">
              {content.options.map((o, i) => {
                const c = OPTION_COLORS[i % OPTION_COLORS.length];
                const isSel = sel === o.label;
                const right = isSel && !!o.correct;
                const wrong = isSel && !o.correct;
                return (
                  <Bounce key={i} onPress={() => choose(o.label, !!o.correct)}
                    className="flex-row items-center gap-3 rounded-3xl px-6"
                    style={{ minHeight: 68, backgroundColor: right ? "#EAF6E0" : isSel ? c.tint : "#fff",
                             borderWidth: 2.5, borderColor: right ? colors.green : wrong ? colors.red : c.color }}>
                    <View className="h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: right ? colors.green : c.color }}>
                      <Ionicons name={right ? "checkmark" : "volume-medium"} size={18} color="#fff" />
                    </View>
                    <Text className="text-[18px] font-black" style={{ color: colors.ink }}>{o.label}</Text>
                  </Bounce>
                );
              })}
            </View>
            {sel !== null && !correct && (
              <Text className="mt-3 text-center text-[12.5px] font-bold" style={{ color: colors.red }}>Ba haka ba ne · Ka sake gwadawa</Text>
            )}

            <View className="mt-4 flex-row items-center gap-2 rounded-2xl px-4 py-3" style={{ backgroundColor: "#F3F7E8" }}>
              <Ionicons name="bulb" size={16} color={colors.gold} />
              <Text className="flex-1 text-[12px]" style={{ color: colors.ink }}>
                <Text className="font-bold">Taimako:</Text> {content.hint}
              </Text>
            </View>
          </View>

          {/* footer nav */}
          <View className="mt-5 flex-row items-center justify-between">
            <Pressable onPress={() => router.back()} className="flex-row items-center gap-2 rounded-full bg-white px-6 py-3" style={{ borderWidth: 1, borderColor: colors.line }}>
              <Ionicons name="arrow-back" size={16} color={colors.ink} />
              <Text className="text-[14px] font-bold" style={{ color: colors.ink }}>GABANIN</Text>
            </Pressable>
            <Pressable disabled={!correct} onPress={() => router.push(`/subject/${meta.id}/${module}/${lesson}/quiz`)}
              className="flex-row items-center gap-2 rounded-full px-8 py-3" style={{ backgroundColor: correct ? colors.purple : colors.line }}>
              <Text className="text-[14px] font-black" style={{ color: correct ? "#fff" : colors.inkSoft }}>NA GABA</Text>
              <Ionicons name="arrow-forward" size={16} color={correct ? "#fff" : colors.inkSoft} />
            </Pressable>
          </View>
        </ScrollView>

        {/* DARUSSA rail */}
        {showRail && (
          <View className="w-[230px] px-3 py-4">
            <View className="rounded-3xl bg-white p-3" style={{ borderWidth: 1, borderColor: colors.line }}>
              <Text className="mb-2 px-1 text-[12px] font-black tracking-wider" style={{ color: colors.ink }}>DARUSSA</Text>
              {states.map((l) => {
                const isActive = l.id === active.id;
                return (
                  <Pressable key={l.id} disabled={l.locked} onPress={() => router.replace(`/subject/${meta.id}/${module}/${l.id}`)}
                    className="mb-1 flex-row items-center gap-2 rounded-2xl px-2 py-2"
                    style={{ backgroundColor: isActive ? colors.purpleSoft : "transparent", opacity: l.locked ? 0.55 : 1 }}>
                    <View className="h-7 w-7 items-center justify-center rounded-full" style={{ backgroundColor: l.done ? colors.green : isActive ? colors.purple : "#EDEBF3" }}>
                      <Text className="text-[12px] font-black" style={{ color: l.done || isActive ? "#fff" : colors.inkSoft }}>{l.num}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-[12px] font-bold" style={{ color: colors.ink }} numberOfLines={1}>{l.ha}</Text>
                      <Text className="text-[10px]" style={{ color: colors.inkSoft }} numberOfLines={1}>{LESSON_SUBTITLES[l.id] ?? l.en}</Text>
                    </View>
                    {l.done ? <Ionicons name="checkmark-circle" size={16} color={colors.green} /> : l.locked ? <Ionicons name="lock-closed" size={14} color={colors.inkSoft} /> : null}
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}
      </View>
    </AppShell>
  );
}
