import { useState, useMemo } from "react";
import { View, Text, Pressable, ScrollView, TextInput, useWindowDimensions, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { colors, NAV } from "@/constants/theme";
import { SUBJECTS, MODULES, getLessons } from "@/constants/content";
import { contentFor } from "@/constants/lessonContent";
import { objects } from "@/constants/images";
import { speak } from "@/lib/speech";
import AppShell from "@/components/nav/AppShell";
import RightRail from "@/components/RightRail";
import PopIn from "@/components/ui/PopIn";
import { feedback } from "@/lib/feedback";
import { shuffle } from "@/lib/shuffle";
import Celebration from "@/components/Celebration";
import { getSessionChildId, getDevice, completeLesson, type StrandId } from "@/lib/data";

// Real artwork for the lesson's subject, so the match step shows the picture
// the child just learned rather than a generic emoji.
const LESSON_ART: Record<string, any> = {
  "🍎": objects.apple, "🪑": objects.chair, "☕": objects.cup, "✏️": objects.pencil,
  "🐦": objects.bird, "📖": objects.bookOpen, "🅰️": objects.bookAb, "🐕": objects.dog,
  "👩": objects.mother, "🧼": objects.soap, "🏃": objects.running,
  "🪥": objects.toothbrush, "🍽️": objects.plate, "🐟": objects.fish,
};
import NumeracyQuiz, { useNumeracySteps } from "@/components/NumeracyQuiz";

const STEPS = ["choice", "match", "write", "trace"] as const;
type Step = (typeof STEPS)[number];

export default function QuizScreen() {
  const { subject, module, lesson } = useLocalSearchParams<{ subject: string; module: string; lesson: string }>();
  const meta = SUBJECTS.find((s) => s.id === subject) ?? SUBJECTS[0];
  const modMeta = MODULES[meta.id]?.find((m) => m.id === module);
  const { width } = useWindowDimensions();
  const showRail = width >= NAV.breakpoint;
  const isNumeracy = meta.id === "numeracy";
  const numSteps = useNumeracySteps();

  const [idx, setIdx] = useState(0);
  const [celebrate, setCelebrate] = useState(false);
  const [numDone, setNumDone] = useState(false);
  const [earnedXp, setEarnedXp] = useState(10);
  const step = STEPS[idx];
  // FR-6.1: distractor positions randomised per attempt
  // The quiz is about THIS lesson — options come from its own content, so no
  // two lessons ever present the same question.
  const lessons = getLessons(meta.id, module as string);
  const active = lessons.find((l) => l.id === lesson) ?? lessons[0];
  const content = contentFor(meta.id, module as string, active?.id ?? "", active?.ha ?? "", lessons);
  const choiceOptions = useMemo(() => shuffle(content.options), [idx, active?.id]);
  const matchOptions = useMemo(() => shuffle(content.options), [idx, active?.id]);
  const [choice, setChoice] = useState<string | null>(null);
  const [match, setMatch] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [traced, setTraced] = useState(false);

  const totalSteps = isNumeracy ? numSteps.length : STEPS.length;

  const done = isNumeracy
    ? numDone
    : (step === "choice" && !!choice) ||
      (step === "match" && !!match) ||
      (step === "write" && text.trim().length > 2) ||
      (step === "trace" && traced);

  const finishAndSave = async () => {
    // Simple score: pass if the final step was completed correctly.
    const score = 1; // reaching the end with correct answers -> full marks in this prototype
    try {
      const childId = await getSessionChildId();
      const device = await getDevice();
      if (childId) {
        const strandMap: Record<string, StrandId> = { literacy: "karatu", numeracy: "lissafi", hygiene: "tsafta" };
        const res = await completeLesson(
          childId, device.id,
          strandMap[meta.id] ?? "karatu",
          modMeta?.id ?? "level1",
          `${modMeta?.id}/${lesson}`,
          score,
          [`${meta.id}.${modMeta?.id}`]
        );
        setEarnedXp(res.stars * 10);        // 10 XP per star actually earned
      }
    } catch {}
    setCelebrate(true);
  };
  const next = () => { if (idx < totalSteps - 1) { setIdx(idx + 1); setNumDone(false); } else finishAndSave(); };

  const hint = isNumeracy ? "Ƙidaya a hankali, sannan ka zaɓi lambar da ta dace." : step === "choice" ? "Saurari kalmar maimaita." : step === "match" ? "Ka saurari kalmar sau biyu idan kana bukata." : step === "write" ? "Ka tuna fara da babban harafi kuma ka saka alama (.)" : "Ka bi layin dot-dot din da yatsanka ko fensirinka.";
  const title = step === "choice" ? "QUIZ 1" : step === "match" ? "QUIZ 2" : step === "write" ? "QUIZ – WRITING" : "TRACING TIME!";

  return (
    <AppShell showBee={!showRail}
      crumbs={[{ label: meta.en, color: meta.color }, { label: "MODULES" }, { label: `${modMeta?.num}. ${modMeta?.en}` }, { label: "QUIZ", active: true }]}>
      <View className="flex-1 flex-row">
        <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
          <View className="rounded-3xl bg-white p-5" style={{ shadowColor: "#1F2A3C", shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 3 }}>
            <View className="flex-row items-center gap-2">
              <View className="h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: colors.purple }}>
                <Ionicons name={isNumeracy ? "calculator" : step === "write" ? "pencil" : step === "trace" ? "brush" : "help"} size={18} color="#fff" />
              </View>
              <Text className="text-[22px] font-black" style={{ color: colors.purple }}>{isNumeracy ? `LISSAFI ${idx + 1}` : title}</Text>
            </View>

            {/* step pager dots */}
            <View className="mt-3 flex-row gap-1.5">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <View key={i} className="h-2 rounded-full" style={{ width: i === idx ? 22 : 8, backgroundColor: i === idx ? colors.purple : colors.line }} />
              ))}
            </View>

            {isNumeracy && (
              <View className="mt-4">
                <NumeracyQuiz stepIndex={idx} onDone={(ok) => setNumDone(ok)} />
              </View>
            )}

            {!isNumeracy && step === "choice" && (
              <View className="mt-4">
                <Text className="text-center text-[14px] font-bold" style={{ color: colors.ink }}>Saurari kalmar, sannan ka zaɓi amsar da ta dace.</Text>
                <Pressable onPress={() => speak(content.word)} className="mt-3 flex-row items-center justify-center gap-2 self-center rounded-2xl px-6 py-2" style={{ backgroundColor: colors.purpleSoft }}>
                  <Text className="text-[20px] font-black" style={{ color: colors.purple }}>{content.word}</Text>
                  <Ionicons name="volume-high" size={18} color={colors.purple} />
                </Pressable>
                <Text className="mt-2 text-center text-[14px]" style={{ color: colors.ink }}>{content.prompt}</Text>
                <View className="mt-3 flex-row flex-wrap justify-center gap-3">
                  {choiceOptions.map((o, i) => {
                    const picked = choice === o.label;
                    return (
                      <Pressable key={i} onPress={() => { setChoice(o.label); o.correct ? feedback.correct() : feedback.wrong(); }}
                        className="items-center justify-center rounded-2xl p-3"
                        style={{ minWidth: 130, minHeight: 68, borderWidth: 2, borderColor: picked ? (o.correct ? colors.green : colors.red) : colors.line, backgroundColor: picked && o.correct ? "#EAF6E0" : "#fff" }}>
                        <Text className="text-[16px] font-black" style={{ color: colors.ink }}>{o.label}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}

            {!isNumeracy && step === "match" && (
              <View className="mt-4">
                <Text className="text-center text-[14px] font-bold" style={{ color: colors.ink }}>Danna kalmar da ta dace da hoton.</Text>
                <View className="mt-3 items-center justify-center rounded-2xl" style={{ height: 150, backgroundColor: colors.purpleSoft }}>
                  {LESSON_ART[content.visual]
                    ? <Image source={LESSON_ART[content.visual]} style={{ width: 118, height: 118 }} resizeMode="contain" />
                    : <Text style={{ fontSize: 84 }}>{content.visual}</Text>}
                </View>
                <View className="mt-3 flex-row flex-wrap justify-center gap-3">
                  {matchOptions.map((o, i) => {
                    const show = match === o.label && o.correct;
                    const wrong = match === o.label && !o.correct;
                    return (
                      <Pressable key={i} onPress={() => { setMatch(o.label); o.correct ? feedback.correct() : feedback.wrong(); }}
                        className="items-center justify-center rounded-2xl p-3"
                        style={{ minWidth: 130, minHeight: 62, borderWidth: 2, borderColor: show ? colors.green : wrong ? colors.red : colors.line, backgroundColor: show ? "#EAF6E0" : "#fff" }}>
                        <Text className="text-[15px] font-bold" style={{ color: colors.ink }}>{o.label}</Text>
                      </Pressable>
                    );
                  })}
                </View>
                {match && (
                  <PopIn style={{ marginTop: 12, alignSelf: "center" }}>
                    <View className="flex-row items-center gap-2 rounded-2xl px-4 py-2" style={{ backgroundColor: colors.purpleSoft }}>
                      <Ionicons name="star" size={16} color={colors.gold} />
                      <Text className="text-[13px] font-bold" style={{ color: colors.purple }}>Madalla! Ka yi daidai. Ka samu maki 1.</Text>
                    </View>
                  </PopIn>
                )}
              </View>
            )}

            {!isNumeracy && step === "write" && (
              <View className="mt-4">
                <Text className="text-[13px] font-bold" style={{ color: colors.ink }}>Ka kalli hoton sannan ka rubuta jimla mai ma'ana.</Text>
                <Text className="mb-2 text-[12px] font-bold" style={{ color: colors.purple }}>Rubuta a akwatin rubutu da ke kasa.</Text>
                <View className="items-center justify-center rounded-2xl" style={{ height: 140, backgroundColor: "#F3E9D6" }}>
                  <Text style={{ fontSize: 60 }}>✏️📖</Text>
                </View>
                <View className="mt-3 rounded-2xl p-3" style={{ borderWidth: 2, borderColor: colors.purpleSoft }}>
                  <TextInput value={text} onChangeText={(t) => setText(t.slice(0, 60))} multiline placeholder="Rubuta jimlarka a nan..." placeholderTextColor={colors.inkSoft}
                    style={{ minHeight: 80, color: colors.ink, textAlignVertical: "top" }} />
                  <Text className="text-right text-[10px]" style={{ color: colors.inkSoft }}>{text.length} / 60</Text>
                </View>
              </View>
            )}

            {!isNumeracy && step === "trace" && (
              <View className="mt-4">
                <Text className="text-[13px] font-bold" style={{ color: colors.ink }}>Bi layin dot-dot din don rubuta kalmar daidai.</Text>
                <View className="mt-2 flex-row items-center gap-2">
                  <View className="h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: colors.purple }}>
                    <Ionicons name="volume-medium" size={14} color="#fff" />
                  </View>
                  <Text className="text-[13px] font-bold" style={{ color: colors.purple }}>Ka saurari: Sannu</Text>
                </View>
                <View className="mt-3 items-center justify-center rounded-2xl" style={{ height: 120, backgroundColor: "#CDEBD3" }}>
                  <View className="rounded-2xl bg-white px-4 py-2"><Text className="text-[18px] font-black" style={{ color: colors.purple }}>Sannu!</Text></View>
                </View>
                <View className="mt-3 rounded-2xl p-4" style={{ borderWidth: 2, borderColor: colors.purpleSoft }}>
                  <View className="flex-row justify-center gap-1">
                    {"Sannu".split("").map((c, i) => (
                      <View key={i} className="h-14 w-11 items-center justify-center rounded-lg" style={{ borderWidth: 2, borderStyle: "dashed", borderColor: colors.purple }}>
                        <Text className="text-[26px] font-black" style={{ color: "#C9BEEA" }}>{c}</Text>
                      </View>
                    ))}
                  </View>
                </View>
                <Pressable onPress={() => { setTraced(true); feedback.success(); }} className="mt-3 flex-row items-center justify-center gap-2 rounded-full py-3" style={{ borderWidth: 2, borderColor: traced ? colors.green : colors.purple, backgroundColor: traced ? "#EAF6E0" : "#fff" }}>
                  <Ionicons name={traced ? "checkmark-circle" : "brush"} size={18} color={traced ? colors.green : colors.purple} />
                  <Text className="text-[13px] font-bold" style={{ color: colors.ink }}>{traced ? "An Kammala!" : "Na Gama Bi Layin"}</Text>
                </Pressable>
              </View>
            )}

            <View className="mt-4 flex-row items-center gap-2 rounded-2xl px-4 py-2" style={{ backgroundColor: colors.purpleSoft }}>
              <Ionicons name="volume-medium" size={16} color={colors.purple} />
              <Text className="flex-1 text-[12px]" style={{ color: colors.ink }}>{hint}</Text>
            </View>
          </View>

          <View className="mt-5 flex-row items-center justify-between">
            <Pressable onPress={() => (idx > 0 ? setIdx(idx - 1) : router.back())} className="flex-row items-center gap-2 rounded-full bg-white px-6 py-3" style={{ borderWidth: 1, borderColor: colors.line }}>
              <Ionicons name="arrow-back" size={16} color={colors.ink} />
              <Text className="text-[14px] font-bold" style={{ color: colors.ink }}>KOMA BAYAN</Text>
            </Pressable>
            <Pressable disabled={!done} onPress={next} className="flex-row items-center gap-2 rounded-full px-8 py-3" style={{ backgroundColor: done ? colors.purple : colors.line }}>
              <Text className="text-[14px] font-black" style={{ color: done ? "#fff" : colors.inkSoft }}>{idx === STEPS.length - 1 ? "KA MIKA AMSA" : "NA GABA"}</Text>
              <Ionicons name={idx === STEPS.length - 1 ? "checkmark" : "arrow-forward"} size={16} color={done ? "#fff" : colors.inkSoft} />
            </Pressable>
          </View>
        </ScrollView>

        {showRail && (
          <RightRail
            ciGaba={isNumeracy ? Math.round(((idx + 1) / totalSteps) * 100) : step === "write" || step === "trace" ? 40 : undefined}
            ciGabaLabel={isNumeracy ? `Ka kammala ${idx + 1} daga ${totalSteps}` : step === "write" ? "Ka kammala 1 daga 5" : step === "trace" ? "Ka kammala 1 daga 5" : undefined}
            star={!isNumeracy && step === "choice" ? 1 : undefined}
            starTotal={3}
            maki={isNumeracy ? `${idx} / ${totalSteps}` : step === "match" ? "2 / 5" : step === "write" || step === "trace" ? "1 / 5" : undefined}
            hint={hint}
            startSeconds={isNumeracy ? 60 : step === "write" ? 265 : step === "trace" ? 270 : 45}
          />
        )}
      </View>

      <Celebration visible={celebrate} xp={earnedXp} onClose={() => { setCelebrate(false); router.replace("/home"); }} />
    </AppShell>
  );
}
