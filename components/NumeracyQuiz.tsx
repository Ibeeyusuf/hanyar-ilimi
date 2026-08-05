import { useMemo, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/theme";
import PopIn from "@/components/ui/PopIn";
import { speak } from "@/lib/speech";
import { PHRASES, numberWord, additionPhrase } from "@/constants/phrases";
import { shuffle } from "@/lib/shuffle";

/**
 * Numeracy quiz body: count objects, match a numeral to a group, and a simple
 * addition. Rendered by the quiz screen when subject === "numeracy".
 *
 * The numbers are derived from the lesson id, so every numeracy lesson asks a
 * different question. Previously all thirty of them asked the child to count
 * the same four mangoes and answer the same 2 + 1.
 */
export const NUMERACY_STEPS = ["count", "matchNum", "add"] as const;

function seedFrom(lessonId: string): number {
  return lessonId.split("").reduce((a, c) => a + c.charCodeAt(0), 7);
}

/** Correct answer plus two nearby distractors, never negative, never repeated. */
function optionsAround(answer: number): number[] {
  const set = new Set<number>([answer]);
  let delta = 1;
  while (set.size < 3) {
    if (answer - delta >= 1) set.add(answer - delta);
    if (set.size < 3) set.add(answer + delta);
    delta += 1;
  }
  return shuffle(Array.from(set));
}

export default function NumeracyQuiz({
  stepIndex, lessonId, solved, onAnswer,
}: {
  stepIndex: number;
  lessonId: string;
  solved: boolean;
  onAnswer: (value: number, correct: boolean) => void;
}) {
  const step = NUMERACY_STEPS[stepIndex % NUMERACY_STEPS.length];
  const seed = seedFrom(lessonId);

  // Per-lesson targets — deterministic, so a child returning to the same
  // lesson meets the same question rather than a fresh random one.
  const countTarget = 3 + (seed % 5);                // 3..7
  const matchTarget = 2 + (Math.floor(seed / 3) % 4); // 2..5
  const addA = 1 + (seed % 4);                       // 1..4
  const addB = 1 + (Math.floor(seed / 5) % 3);       // 1..3
  const addAnswer = addA + addB;

  const countOptions = useMemo(() => optionsAround(countTarget), [countTarget]);
  const matchOptions = useMemo(() => optionsAround(matchTarget), [matchTarget]);
  const addOptions = useMemo(() => optionsAround(addAnswer), [addAnswer]);

  // Keyed by step so moving between steps doesn't carry a selection across.
  const [picked, setPicked] = useState<Record<string, number>>({});
  const choose = (value: number, correct: boolean) => {
    setPicked((p) => ({ ...p, [step]: value }));
    onAnswer(value, correct);
  };

  const Tile = ({ n, target }: { n: number; target: number }) => {
    const isPicked = picked[step] === n;
    const right = isPicked && n === target;
    const wrong = isPicked && n !== target;
    return (
      <Pressable onPress={() => choose(n, n === target)}
        className="h-16 w-16 items-center justify-center rounded-2xl"
        style={{ borderWidth: 2, borderColor: right ? colors.green : wrong ? colors.red : colors.line, backgroundColor: right ? "#E7F4DC" : "#fff" }}>
        <Text className="text-[24px] font-black" style={{ color: colors.ink }}>{n}</Text>
      </Pressable>
    );
  };

  const retry = picked[step] !== undefined && !solved;
  const Retry = () => retry
    ? <Text className="mt-3 text-center text-[12.5px] font-bold" style={{ color: colors.red }}>Ba haka ba ne · Ka sake gwadawa</Text>
    : null;

  if (step === "count") {
    return (
      <View>
        <View className="flex-row items-center justify-center gap-2">
          <Text className="text-center text-[15px] font-bold" style={{ color: colors.ink }}>Ƙidaya mangwaro. Nawa ne?</Text>
          <Pressable onPress={() => speak(PHRASES.countTheMangoes)}><Ionicons name="volume-high" size={18} color={colors.purple} /></Pressable>
        </View>
        <View className="my-4 flex-row flex-wrap items-center justify-center gap-3 rounded-2xl py-6" style={{ backgroundColor: colors.purpleSoft }}>
          {Array.from({ length: countTarget }).map((_, i) => (<Text key={i} style={{ fontSize: 44 }}>🥭</Text>))}
        </View>
        <View className="flex-row justify-center gap-3">
          {countOptions.map((n) => <Tile key={n} n={n} target={countTarget} />)}
        </View>
        {solved && (
          <PopIn style={{ marginTop: 12, alignSelf: "center" }}>
            <Text className="text-[13px] font-bold" style={{ color: colors.green }}>Madalla! Mangwaro {countTarget} ne. 🎉</Text>
          </PopIn>
        )}
        <Retry />
      </View>
    );
  }

  if (step === "matchNum") {
    return (
      <View>
        <Text className="text-center text-[15px] font-bold" style={{ color: colors.ink }}>Wanne rukuni yake da {matchTarget}?</Text>
        <View className="mb-3 mt-2 items-center">
          <Pressable onPress={() => speak(numberWord(matchTarget))} className="rounded-2xl px-6 py-2" style={{ backgroundColor: colors.purpleSoft }}>
            <Text className="text-[32px] font-black" style={{ color: colors.purple }}>{matchTarget}</Text>
          </Pressable>
        </View>
        <View className="flex-row justify-center gap-3">
          {matchOptions.map((n) => {
            const isPicked = picked[step] === n;
            const right = isPicked && n === matchTarget;
            const wrong = isPicked && n !== matchTarget;
            return (
              <Pressable key={n} onPress={() => choose(n, n === matchTarget)}
                className="items-center justify-center rounded-2xl p-3"
                style={{ width: 92, minHeight: 80, borderWidth: 2, borderColor: right ? colors.green : wrong ? colors.red : colors.line, backgroundColor: right ? "#E7F4DC" : "#fff" }}>
                <View className="flex-row flex-wrap items-center justify-center gap-1" style={{ maxWidth: 70 }}>
                  {Array.from({ length: n }).map((_, i) => (<View key={i} className="h-4 w-4 rounded-full" style={{ backgroundColor: colors.gold }} />))}
                </View>
              </Pressable>
            );
          })}
        </View>
        <Retry />
      </View>
    );
  }

  // add
  return (
    <View>
      <View className="flex-row items-center justify-center gap-2">
        <Text className="text-center text-[15px] font-bold" style={{ color: colors.ink }}>Ƙara su. Nawa ne duka?</Text>
        <Pressable onPress={() => speak(additionPhrase(addA, addB))}><Ionicons name="volume-high" size={18} color={colors.purple} /></Pressable>
      </View>
      <View className="my-4 flex-row flex-wrap items-center justify-center gap-3 rounded-2xl px-3 py-5" style={{ backgroundColor: colors.purpleSoft }}>
        <Text style={{ fontSize: 34 }}>{"🍎".repeat(addA)}</Text>
        <Text className="text-[30px] font-black" style={{ color: colors.purple }}>+</Text>
        <Text style={{ fontSize: 34 }}>{"🍎".repeat(addB)}</Text>
        <Text className="text-[30px] font-black" style={{ color: colors.purple }}>=</Text>
        <Text className="text-[30px] font-black" style={{ color: colors.ink }}>?</Text>
      </View>
      <View className="flex-row justify-center gap-3">
        {addOptions.map((n) => <Tile key={n} n={n} target={addAnswer} />)}
      </View>
      {solved && (
        <PopIn style={{ marginTop: 12, alignSelf: "center" }}>
          <Text className="text-[13px] font-bold" style={{ color: colors.green }}>Madalla! {addA} + {addB} = {addAnswer} 🎉</Text>
        </PopIn>
      )}
      <Retry />
    </View>
  );
}
