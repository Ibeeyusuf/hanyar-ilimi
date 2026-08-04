import { useState, useMemo } from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/theme";
import PopIn from "@/components/ui/PopIn";
import { feedback } from "@/lib/feedback";
import { speak } from "@/lib/speech";
import { shuffle } from "@/lib/shuffle";

// Numeracy-specific quiz body: count objects, match the number, and a simple
// addition tap. Rendered by the quiz screen when subject === "numeracy".
const STEPS = ["count", "matchNum", "add"] as const;
type Step = (typeof STEPS)[number];

export function useNumeracySteps() {
  return STEPS;
}

export default function NumeracyQuiz({ stepIndex, onDone }: { stepIndex: number; onDone: (ok: boolean) => void }) {
  const step = STEPS[stepIndex % STEPS.length];
  // FR-6.1: randomise answer positions per attempt
  const countOptions = useMemo(() => shuffle([3, 4, 5]), [stepIndex]);
  const matchOptions = useMemo(() => shuffle([2, 3, 4]), [stepIndex]);
  const addOptions = useMemo(() => shuffle([2, 3, 4]), [stepIndex]);

  // 1) Count the mangoes -> pick the right number
  const COUNT_TARGET = 4;
  const [counted, setCounted] = useState<number | null>(null);

  // 2) Match the numeral to the right group of dots
  const [matched, setMatched] = useState<number | null>(null);
  const MATCH_TARGET = 3;

  // 3) Simple addition 2 + 1
  const [sum, setSum] = useState<number | null>(null);
  const ADD_ANSWER = 3;

  const answer = (correct: boolean, setter: () => void) => {
    setter();
    correct ? feedback.correct() : feedback.wrong();
    onDone(correct);
  };

  if (step === "count") {
    return (
      <View>
        <View className="flex-row items-center justify-center gap-2">
          <Text className="text-center text-[15px] font-bold" style={{ color: colors.ink }}>Ƙidaya mangwaro. Nawa ne?</Text>
          <Pressable onPress={() => speak("Ƙidaya mangwaro")}><Ionicons name="volume-high" size={18} color={colors.purple} /></Pressable>
        </View>
        <View className="my-4 flex-row flex-wrap items-center justify-center gap-3 rounded-2xl py-6" style={{ backgroundColor: colors.purpleSoft }}>
          {Array.from({ length: COUNT_TARGET }).map((_, i) => (<Text key={i} style={{ fontSize: 44 }}>🥭</Text>))}
        </View>
        <View className="flex-row justify-center gap-3">
          {countOptions.map((n) => {
            const picked = counted === n;
            const ok = picked && n === COUNT_TARGET;
            return (
              <Pressable key={n} onPress={() => answer(n === COUNT_TARGET, () => setCounted(n))}
                className="h-16 w-16 items-center justify-center rounded-2xl"
                style={{ borderWidth: 2, borderColor: ok ? colors.green : picked ? colors.red : colors.line, backgroundColor: ok ? "#E7F4DC" : "#fff" }}>
                <Text className="text-[24px] font-black" style={{ color: colors.ink }}>{n}</Text>
              </Pressable>
            );
          })}
        </View>
        {counted === COUNT_TARGET && (
          <PopIn style={{ marginTop: 12, alignSelf: "center" }}>
            <Text className="text-[13px] font-bold" style={{ color: colors.green }}>Madalla! Mangwaro huɗu ne. 🎉</Text>
          </PopIn>
        )}
      </View>
    );
  }

  if (step === "matchNum") {
    return (
      <View>
        <Text className="text-center text-[15px] font-bold" style={{ color: colors.ink }}>Wanne rukuni yake da 3?</Text>
        <View className="mb-3 mt-2 items-center">
          <View className="rounded-2xl px-6 py-2" style={{ backgroundColor: colors.purpleSoft }}>
            <Text className="text-[32px] font-black" style={{ color: colors.purple }}>3</Text>
          </View>
        </View>
        <View className="flex-row justify-center gap-3">
          {matchOptions.map((n) => {
            const picked = matched === n;
            const ok = picked && n === MATCH_TARGET;
            return (
              <Pressable key={n} onPress={() => answer(n === MATCH_TARGET, () => setMatched(n))}
                className="items-center justify-center rounded-2xl p-3"
                style={{ width: 92, height: 80, borderWidth: 2, borderColor: ok ? colors.green : picked ? colors.red : colors.line, backgroundColor: ok ? "#E7F4DC" : "#fff" }}>
                <View className="flex-row flex-wrap items-center justify-center gap-1" style={{ maxWidth: 70 }}>
                  {Array.from({ length: n }).map((_, i) => (<View key={i} className="h-4 w-4 rounded-full" style={{ backgroundColor: colors.gold }} />))}
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  }

  // add
  return (
    <View>
      <View className="flex-row items-center justify-center gap-2">
        <Text className="text-center text-[15px] font-bold" style={{ color: colors.ink }}>Ƙara su. Nawa ne duka?</Text>
        <Pressable onPress={() => speak("biyu da daya")}><Ionicons name="volume-high" size={18} color={colors.purple} /></Pressable>
      </View>
      <View className="my-4 flex-row items-center justify-center gap-3 rounded-2xl py-5" style={{ backgroundColor: colors.purpleSoft }}>
        <Text style={{ fontSize: 40 }}>🍎🍎</Text>
        <Text className="text-[30px] font-black" style={{ color: colors.purple }}>+</Text>
        <Text style={{ fontSize: 40 }}>🍎</Text>
        <Text className="text-[30px] font-black" style={{ color: colors.purple }}>=</Text>
        <Text className="text-[30px] font-black" style={{ color: colors.ink }}>?</Text>
      </View>
      <View className="flex-row justify-center gap-3">
        {addOptions.map((n) => {
          const picked = sum === n;
          const ok = picked && n === ADD_ANSWER;
          return (
            <Pressable key={n} onPress={() => answer(n === ADD_ANSWER, () => setSum(n))}
              className="h-16 w-16 items-center justify-center rounded-2xl"
              style={{ borderWidth: 2, borderColor: ok ? colors.green : picked ? colors.red : colors.line, backgroundColor: ok ? "#E7F4DC" : "#fff" }}>
              <Text className="text-[24px] font-black" style={{ color: colors.ink }}>{n}</Text>
            </Pressable>
          );
        })}
      </View>
      {sum === ADD_ANSWER && (
        <PopIn style={{ marginTop: 12, alignSelf: "center" }}>
          <Text className="text-[13px] font-bold" style={{ color: colors.green }}>Madalla! 2 + 1 = 3 🎉</Text>
        </PopIn>
      )}
    </View>
  );
}
