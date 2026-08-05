import { useState, useMemo } from "react";
import { View, Text, Pressable, ScrollView, TextInput, useWindowDimensions, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { colors, NAV } from "@/constants/theme";
import { SUBJECTS, MODULES, getLessons } from "@/constants/content";
import { contentFor } from "@/constants/lessonContent";
import { artForVisual, objects } from "@/constants/images";
import { speak } from "@/lib/speech";
import { PHRASES } from "@/constants/phrases";
import AppShell from "@/components/nav/AppShell";
import RightRail from "@/components/RightRail";
import PopIn from "@/components/ui/PopIn";
import { feedback } from "@/lib/feedback";
import { shuffle } from "@/lib/shuffle";
import Celebration from "@/components/Celebration";
import NumeracyQuiz, { NUMERACY_STEPS } from "@/components/NumeracyQuiz";
import { getSessionChildId, getDevice, completeLesson, logEvent, type StrandId } from "@/lib/data";

const LITERACY_STEPS = ["choice", "match", "write", "trace"] as const;

// Only steps with a single right answer can be marked. Writing and tracing are
// practice: the app cannot judge a traced letter or a free-typed sentence, and
// pretending otherwise would put a fabricated number into a child's record.
const GRADED: Record<string, boolean> = {
  choice: true, match: true, write: false, trace: false,
  count: true, matchNum: true, add: true,
};

export default function QuizScreen() {
  const { subject, module, lesson } = useLocalSearchParams<{ subject: string; module: string; lesson: string }>();
  const meta = SUBJECTS.find((s) => s.id === subject) ?? SUBJECTS[0];
  const modMeta = MODULES[meta.id]?.find((m) => m.id === module);
  const { width } = useWindowDimensions();
  const showRail = width >= NAV.breakpoint;
  // Answer tiles: two per row on a phone, natural width on anything larger.
  const narrow = width < 600;
  const isNumeracy = meta.id === "numeracy";

  const steps: readonly string[] = isNumeracy ? NUMERACY_STEPS : LITERACY_STEPS;
  const gradedSteps = steps.filter((s) => GRADED[s]);
  const totalSteps = steps.length;

  const [idx, setIdx] = useState(0);
  const [celebrate, setCelebrate] = useState(false);
  const [earnedStars, setEarnedStars] = useState(0);
  const step = steps[idx];

  const lessons = getLessons(meta.id, module as string);
  const active = lessons.find((l) => l.id === lesson) ?? lessons[0];
  const content = contentFor(meta.id, module as string, active?.id ?? "", active?.ha ?? "", lessons);

  // FR-6.1: distractor positions randomised per attempt.
  const choiceOptions = useMemo(() => shuffle(content.options), [content.options]);
  const matchOptions = useMemo(() => shuffle(content.options), [content.options]);

  /**
   * Marking. `firstTry` is the child's FIRST answer on each graded step and is
   * what the score is built from — it is the only honest measure of whether
   * they knew it. `solved` records that they eventually got there, which is
   * what lets them move on. Previously this screen passed a hardcoded score of
   * 1 to completeLesson, so every lesson awarded three stars whatever the
   * child answered, and the "needs help" flag could never fire.
   */
  const [firstTry, setFirstTry] = useState<Record<string, boolean>>({});
  const [solved, setSolved] = useState<Record<string, boolean>>({});
  const [picked, setPicked] = useState<Record<string, string | number>>({});
  const [text, setText] = useState("");
  const [traced, setTraced] = useState(false);

  const answer = async (key: string, value: string | number, correct: boolean) => {
    setPicked((p) => ({ ...p, [key]: value }));
    setFirstTry((f) => (key in f ? f : { ...f, [key]: correct }));
    if (correct) setSolved((s) => ({ ...s, [key]: true }));
    if (correct) feedback.correct(); else feedback.wrong();
    if (!correct) speak(PHRASES.tryAgain);
    // FR-5.3: every item response is logged, not just completions.
    try {
      const childId = await getSessionChildId();
      const device = await getDevice();
      if (childId) {
        await logEvent("item_response", childId, device.id, {
          kind: "answer", lesson: active?.id, step: key, correct,
          firstAttempt: !(key in firstTry),
        });
      }
    } catch {}
  };

  // A graded step advances once the child has reached the right answer — no
  // dead ends, and no advancing on a wrong tap either (PRD §3.5, no fail states).
  const done = GRADED[step]
    ? !!solved[step]
    : step === "write" ? text.trim().length > 2
    : step === "trace" ? traced
    : true;

  const correctFirstTime = gradedSteps.filter((s) => firstTry[s]).length;

  const finishAndSave = async () => {
    const score = gradedSteps.length ? correctFirstTime / gradedSteps.length : 0;
    let stars = 0;
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
        stars = res.stars;
      }
    } catch {}
    setEarnedStars(stars);
    setCelebrate(true);
  };

  const next = () => { if (idx < totalSteps - 1) setIdx(idx + 1); else finishAndSave(); };
  const isLast = idx === totalSteps - 1;

  const hint = isNumeracy
    ? "Ƙidaya a hankali, sannan ka zaɓi lambar da ta dace."
    : step === "choice" ? "Saurari kalmar sannan ka zaɓi amsar da ta dace."
    : step === "match" ? "Ka saurari kalmar sau biyu idan kana bukata."
    : step === "write" ? "Ka tuna fara da babban harafi kuma ka saka alama (.)"
    : "Ka bi layin dot-dot din da yatsanka ko fensirinka.";

  const title = isNumeracy ? `LISSAFI ${idx + 1}`
    : step === "choice" ? "QUIZ 1"
    : step === "match" ? "QUIZ 2"
    : step === "write" ? "QUIZ – WRITING" : "TRACING TIME!";

  const lessonArt = artForVisual(content.visual);

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
              <Text className="text-[22px] font-black" style={{ color: colors.purple }}>{title}</Text>
            </View>

            {/* step pager dots */}
            <View className="mt-3 flex-row gap-1.5">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <View key={i} className="h-2 rounded-full" style={{ width: i === idx ? 22 : 8, backgroundColor: i === idx ? colors.purple : colors.line }} />
              ))}
            </View>

            {isNumeracy && (
              <View className="mt-4">
                <NumeracyQuiz
                  stepIndex={idx}
                  lessonId={active?.id ?? ""}
                  solved={!!solved[step]}
                  onAnswer={(value, correct) => answer(step, value, correct)}
                />
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
                    const isPicked = picked.choice === o.label;
                    const right = isPicked && !!o.correct;
                    const wrong = isPicked && !o.correct;
                    return (
                      <Pressable key={i} onPress={() => answer("choice", o.label, !!o.correct)}
                        className="items-center justify-center rounded-2xl p-3"
                        style={{ flexGrow: 1, flexBasis: narrow ? "45%" : 130, minHeight: 68, borderWidth: 2, borderColor: right ? colors.green : wrong ? colors.red : colors.line, backgroundColor: right ? "#EAF6E0" : "#fff" }}>
                        <Text className="text-[16px] font-black" style={{ color: colors.ink }}>{o.label}</Text>
                      </Pressable>
                    );
                  })}
                </View>
                {picked.choice !== undefined && !solved.choice && (
                  <Text className="mt-3 text-center text-[12.5px] font-bold" style={{ color: colors.red }}>Ba haka ba ne · Ka sake gwadawa</Text>
                )}
              </View>
            )}

            {!isNumeracy && step === "match" && (
              <View className="mt-4">
                <Text className="text-center text-[14px] font-bold" style={{ color: colors.ink }}>Danna kalmar da ta dace da hoton.</Text>
                <View className="mt-3 items-center justify-center rounded-2xl" style={{ height: 150, backgroundColor: colors.purpleSoft }}>
                  {lessonArt
                    ? <Image source={lessonArt} style={{ width: 118, height: 118 }} resizeMode="contain" />
                    : <Text style={{ fontSize: 84 }}>{content.visual}</Text>}
                </View>
                <View className="mt-3 flex-row flex-wrap justify-center gap-3">
                  {matchOptions.map((o, i) => {
                    const isPicked = picked.match === o.label;
                    const right = isPicked && !!o.correct;
                    const wrong = isPicked && !o.correct;
                    return (
                      <Pressable key={i} onPress={() => answer("match", o.label, !!o.correct)}
                        className="items-center justify-center rounded-2xl p-3"
                        style={{ flexGrow: 1, flexBasis: narrow ? "45%" : 130, minHeight: 62, borderWidth: 2, borderColor: right ? colors.green : wrong ? colors.red : colors.line, backgroundColor: right ? "#EAF6E0" : "#fff" }}>
                        <Text className="text-[15px] font-bold" style={{ color: colors.ink }}>{o.label}</Text>
                      </Pressable>
                    );
                  })}
                </View>
                {solved.match && (
                  <PopIn style={{ marginTop: 12, alignSelf: "center" }}>
                    <View className="flex-row items-center gap-2 rounded-2xl px-4 py-2" style={{ backgroundColor: colors.purpleSoft }}>
                      <Ionicons name="star" size={16} color={colors.gold} />
                      <Text className="text-[13px] font-bold" style={{ color: colors.purple }}>Madalla! Ka yi daidai.</Text>
                    </View>
                  </PopIn>
                )}
              </View>
            )}

            {!isNumeracy && step === "write" && (
              <View className="mt-4">
                <Text className="text-[13px] font-bold" style={{ color: colors.ink }}>Ka kalli hoton sannan ka rubuta jimla mai ma’ana.</Text>
                <Text className="mb-2 text-[12px] font-bold" style={{ color: colors.purple }}>Rubuta a akwatin rubutu da ke kasa.</Text>
                <View className="flex-row items-center justify-center gap-4 rounded-2xl" style={{ height: 140, backgroundColor: "#F3E9D6" }}>
                  <Image source={objects.pencil} style={{ width: 72, height: 72 }} resizeMode="contain" />
                  {lessonArt && <Image source={lessonArt} style={{ width: 82, height: 82 }} resizeMode="contain" />}
                </View>
                <View className="mt-3 rounded-2xl p-3" style={{ borderWidth: 2, borderColor: colors.purpleSoft }}>
                  <TextInput value={text} onChangeText={(t) => setText(t.slice(0, 60))} multiline placeholder="Rubuta jimlarka a nan..." placeholderTextColor={colors.inkSoft}
                    style={{ minHeight: 80, color: colors.ink, textAlignVertical: "top" }} />
                  <Text className="text-right text-[10px]" style={{ color: colors.inkSoft }}>{text.length} / 60</Text>
                </View>
                <Text className="mt-2 text-[11px]" style={{ color: colors.inkSoft }}>
                  Wannan aikin rubutu ne — malaminka zai duba shi. Ba a ba da maki a nan.
                </Text>
              </View>
            )}

            {!isNumeracy && step === "trace" && (
              <View className="mt-4">
                <Text className="text-[13px] font-bold" style={{ color: colors.ink }}>Bi layin dot-dot din don rubuta kalmar daidai.</Text>
                <Pressable onPress={() => speak(content.word)} className="mt-2 flex-row items-center gap-2">
                  <View className="h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: colors.purple }}>
                    <Ionicons name="volume-medium" size={14} color="#fff" />
                  </View>
                  <Text className="text-[13px] font-bold" style={{ color: colors.purple }}>Ka saurari: {content.word}</Text>
                </Pressable>
                <View className="mt-3 items-center justify-center rounded-2xl" style={{ height: 120, backgroundColor: "#CDEBD3" }}>
                  <View className="rounded-2xl bg-white px-4 py-2"><Text className="text-[18px] font-black" style={{ color: colors.purple }}>{content.word}</Text></View>
                </View>
                <View className="mt-3 rounded-2xl p-4" style={{ borderWidth: 2, borderColor: colors.purpleSoft }}>
                  <View className="flex-row flex-wrap justify-center gap-1">
                    {content.word.split("").map((c, i) => (
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

            <Pressable onPress={() => speak(hint)} className="mt-4 flex-row items-center gap-2 rounded-2xl px-4 py-2" style={{ backgroundColor: colors.purpleSoft }}>
              <Ionicons name="volume-medium" size={16} color={colors.purple} />
              <Text className="flex-1 text-[12px]" style={{ color: colors.ink }}>{hint}</Text>
            </Pressable>
          </View>

          <View className="mt-5 flex-row items-center justify-between">
            <Pressable onPress={() => (idx > 0 ? setIdx(idx - 1) : router.back())} className="flex-row items-center gap-2 rounded-full bg-white px-6 py-3" style={{ borderWidth: 1, borderColor: colors.line }}>
              <Ionicons name="arrow-back" size={16} color={colors.ink} />
              <Text className="text-[14px] font-bold" style={{ color: colors.ink }}>KOMA BAYAN</Text>
            </Pressable>
            <Pressable disabled={!done} onPress={next} className="flex-row items-center gap-2 rounded-full px-8 py-3" style={{ backgroundColor: done ? colors.purple : colors.line }}>
              <Text className="text-[14px] font-black" style={{ color: done ? "#fff" : colors.inkSoft }}>{isLast ? "KA MIKA AMSA" : "NA GABA"}</Text>
              <Ionicons name={isLast ? "checkmark" : "arrow-forward"} size={16} color={done ? "#fff" : colors.inkSoft} />
            </Pressable>
          </View>
        </ScrollView>

        {showRail && (
          <RightRail
            ciGaba={Math.round((idx / totalSteps) * 100)}
            ciGabaLabel={`Ka kammala ${idx} daga ${totalSteps}`}
            maki={`${correctFirstTime} / ${gradedSteps.length}`}
            hint={hint}
          />
        )}
      </View>

      <Celebration
        visible={celebrate}
        stars={earnedStars}
        xp={earnedStars * 10}
        onClose={() => { setCelebrate(false); router.replace("/home"); }}
      />
    </AppShell>
  );
}
