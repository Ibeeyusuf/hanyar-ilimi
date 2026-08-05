import { useState, useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { colors } from "@/constants/theme";
import SceneBackdrop from "@/components/SceneBackdrop";
import { speak } from "@/lib/speech";
import { PHRASES } from "@/constants/phrases";
import { feedback } from "@/lib/feedback";
import { saveAssessment, getDevice } from "@/lib/data";

// Simple adaptive placement: 5 questions rising in difficulty; the level
// reached sets the starting level. Demo of PRD §3.4 placement / baseline.
const QUESTIONS = [
  { q: "Wanne ne 'A'?", options: ["A", "B", "D"], answer: 0 },
  { q: "Wanne ne '3'?", options: ["5", "3", "8"], answer: 1 },
  { q: "Wanne kalma ce 'Uwa'?", options: ["Uwa", "Kaza", "Ruwa"], answer: 0 },
  { q: "2 + 1 = ?", options: ["2", "4", "3"], answer: 2 },
  { q: "Wanne ne babban harafi?", options: ["a", "K", "c"], answer: 1 },
];

export default function Placement() {
  const { childId } = useLocalSearchParams<{ childId?: string }>();
  const [idx, setIdx] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);

  const answer = (i: number) => {
    const ok = i === QUESTIONS[idx].answer;
    if (ok) feedback.correct(); else feedback.wrong();
    const nc = correct + (ok ? 1 : 0);
    setCorrect(nc);
    if (idx < QUESTIONS.length - 1) setIdx(idx + 1);
    else { setDone(true); speak(PHRASES.wellDone); }
  };

  const level = correct <= 1 ? 1 : correct <= 3 ? 2 : 3;

  // PRD §3.4 / §10 — the placement result IS the child's baseline record.
  // Without persisting it there is nothing to measure month-6/12 against.
  useEffect(() => {
    if (!done || !childId) return;
    (async () => {
      try {
        const device = await getDevice();
        await saveAssessment(childId, device.id, "karatu", "baseline", level);
        await saveAssessment(childId, device.id, "lissafi", "baseline", level);
      } catch {}
    })();
  }, [done, childId, level]);

  if (done) {
    return (
      <View className="flex-1" style={{ backgroundColor: colors.skyMid }}>
        <SceneBackdrop />
        <View className="flex-1 items-center justify-center p-6">
          <View className="w-full items-center rounded-3xl bg-white p-8" style={{ maxWidth: 380 }}>
            <Ionicons name="ribbon" size={48} color={colors.purple} />
            <Text className="mt-3 text-[20px] font-black" style={{ color: colors.ink }}>Placement Complete</Text>
            <Text className="mt-1 text-center text-[13px]" style={{ color: colors.inkSoft }}>Answered {correct} of {QUESTIONS.length} correctly.</Text>
            <View className="my-4 rounded-2xl px-6 py-3" style={{ backgroundColor: colors.purpleSoft }}>
              <Text className="text-center text-[13px] font-bold" style={{ color: colors.purpleDeep }}>Starting Level</Text>
              <Text className="text-center text-[32px] font-black" style={{ color: colors.purple }}>{level}</Text>
            </View>
            <Pressable onPress={() => router.replace("/home")} className="items-center rounded-2xl px-8 py-3.5" style={{ backgroundColor: colors.green }}>
              <Text className="text-[14px] font-black text-white">Start learning</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  const cur = QUESTIONS[idx];
  return (
    <View className="flex-1" style={{ backgroundColor: colors.skyMid }}>
      <SceneBackdrop />
      <View className="flex-1 items-center justify-center p-6">
        <View className="w-full rounded-3xl bg-white p-6" style={{ maxWidth: 420 }}>
          <Text className="text-center text-[11px] font-black tracking-wide" style={{ color: colors.inkSoft }}>PLACEMENT · {idx + 1} / {QUESTIONS.length}</Text>
          <View className="my-3 flex-row items-center justify-center gap-2">
            <Text className="text-center text-[20px] font-black" style={{ color: colors.ink }}>{cur.q}</Text>
            <Pressable onPress={() => speak(cur.q)}><Ionicons name="volume-high" size={20} color={colors.purple} /></Pressable>
          </View>
          <View className="mt-2 gap-3">
            {cur.options.map((o, i) => (
              <Pressable key={i} onPress={() => answer(i)} className="items-center rounded-2xl py-4" style={{ borderWidth: 2, borderColor: colors.line, backgroundColor: "#fff" }}>
                <Text className="text-[18px] font-black" style={{ color: colors.ink }}>{o}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}
