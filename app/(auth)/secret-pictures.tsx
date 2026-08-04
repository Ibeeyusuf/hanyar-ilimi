import { useState, useMemo, useEffect } from "react";
import { View, Text, Pressable, ScrollView, Image, useWindowDimensions, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { colors } from "@/constants/theme";
import SceneBackdrop from "@/components/SceneBackdrop";
import Mascot from "@/components/Mascot";
import { SECRET_ICONS } from "@/constants/content";
import { PASSCODE_ORDER } from "@/constants/images";
import { verifyPasscode, loginChild, getProgress, getChild, checkFacilitatorPin } from "@/lib/data";
import { feedback } from "@/lib/feedback";
import { speak } from "@/lib/speech";

function StepRail({ step, total = 6 }: { step: number; total?: number }) {
  return (
    <View className="mb-5 flex-row items-center justify-center">
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} className="flex-row items-center">
          <View className="h-6 w-6 items-center justify-center rounded-full" style={{ backgroundColor: i <= step ? colors.green : "#fff", borderWidth: 2, borderColor: i <= step ? colors.green : colors.line }}>
            {i < step ? <Ionicons name="checkmark" size={12} color="#fff" /> : <Text className="text-[10px] font-bold" style={{ color: i === step ? "#fff" : colors.inkSoft }}>{i + 1}</Text>}
          </View>
          {i < total - 1 && <View className="h-0.5 w-6" style={{ backgroundColor: i < step ? colors.green : colors.line }} />}
        </View>
      ))}
    </View>
  );
}

export default function SecretPicturesScreen() {
  const { childId } = useLocalSearchParams<{ childId?: string }>();
  const { width } = useWindowDimensions();
  const narrow = width < 600;                 // phone: stack instead of side-by-side
  const tile = narrow ? Math.min(80, (width - 96) / 3 - 12) : 80;
  const [seq, setSeq] = useState<number[]>([]);
  const [error, setError] = useState(false);
  const [wrongCount, setWrongCount] = useState(0);
  const [callTeacher, setCallTeacher] = useState(false);
  const [busy, setBusy] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [pin, setPin] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [childPasscode, setChildPasscode] = useState<number[]>([]);

  // FR-3.2: the icon grid is shuffled per session so a watching child can't
  // copy by position. The passcode is the ordered set of PICTURES, not places.
  const layout = useMemo(() => {
    const idx = SECRET_ICONS.map((_, i) => i);
    for (let i = idx.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [idx[i], idx[j]] = [idx[j], idx[i]];
    }
    return idx;
  }, []);

  // FR-1.2: speak the instruction on load.
  useEffect(() => { speak("Danna hotunanka guda uku"); }, []);

  // Held for the facilitator override only — never rendered without the PIN.
  useEffect(() => {
    (async () => {
      if (!childId) return;
      const c = await getChild(childId);
      setChildPasscode(c?.passcode ?? []);
    })();
  }, [childId]);

  // Tapping a chosen picture removes it, so a child can correct a mistake
  // without leaving the screen. feedback is wrapped so a failing sound or
  // haptic can never stop the selection from registering.
  const tap = (i: number) => {
    try { feedback.tap(); } catch {}
    setSeq((prev) => {
      if (prev.includes(i)) return prev.filter((x) => x !== i);
      if (prev.length >= 3) return prev;
      return [...prev, i];
    });
  };

  const confirm = async () => {
    if (seq.length !== 3 || busy) return;
    // Route params can be momentarily empty on first render — never silently
    // skip verification, just ask the child to try again.
    if (!childId) { setError(true); setTimeout(() => setError(false), 1500); return; }
    setBusy(true);
    try {
      const ok = await verifyPasscode(childId, seq);
      if (ok) {
        await loginChild(childId);
        feedback.success();
        // New child (no progress yet) -> placement game; otherwise -> home.
        const prog = await getProgress(childId);
        if (prog.length === 0) router.replace({ pathname: "/facilitator/placement", params: { childId } });
        else router.replace("/home");
        return;
      }
      feedback.wrong();
      setError(true);
      const w = wrongCount + 1;
      setWrongCount(w);
      // S3: after 3 wrong tries, encourage the child to fetch a facilitator.
      // No lockout, no punishment — the child can keep trying.
      if (w >= 3) { setCallTeacher(true); speak("Ka kira malamin ka"); }
      else speak("Ka sake gwadawa");
      setTimeout(() => { setSeq([]); setError(false); }, 1800);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.skyMid }}>
      <SceneBackdrop />
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
        <View className="w-full rounded-3xl bg-white p-6" style={{ maxWidth: 620, shadowColor: "#1F2A3C", shadowOpacity: 0.12, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 6 }}>
          <StepRail step={2} />
          <View className="items-center"><Mascot size={56} pose="trophy" /></View>
          <Text className="mt-1 text-center text-[22px] font-black" style={{ color: colors.purple }}>My Secret Pictures</Text>
          <Text className="mb-1 text-center text-[13px] font-bold" style={{ color: colors.ink }}>Choose your 3 secret pictures in order.</Text>
          <Text className="mb-5 text-center text-[12px]" style={{ color: colors.inkSoft }}>This is your special key! · Wannan shine maɓallinka.</Text>

          {/* wrong attempt — say so clearly, kindly. Silent resets feel broken. */}
          {error && !callTeacher && (
            <View className="mb-4 flex-row items-center justify-center gap-2 rounded-2xl px-4 py-3" style={{ backgroundColor: "#FDECEC", borderWidth: 1, borderColor: "#F3C9C9" }}>
              <Ionicons name="refresh-circle" size={18} color={colors.red} />
              <Text className="text-[13px] font-bold" style={{ color: colors.ink }}>Ba haka ba ne · Try again</Text>
            </View>
          )}

          {/* S3: after 3 wrong tries — kind prompt to fetch a facilitator. No lockout. */}
          {callTeacher && (
            <View className="mb-4 flex-row items-center justify-center gap-2 rounded-2xl px-4 py-3" style={{ backgroundColor: "#FFF6E5", borderWidth: 1, borderColor: "#F0D9A8" }}>
              <Ionicons name="hand-left" size={18} color={colors.gold} />
              <Text className="text-[13px] font-bold" style={{ color: colors.ink }}>Ka kira malaminka · Please call your teacher</Text>
            </View>
          )}

          {/* unambiguous progress — a child (and you, presenting) can always
              see how many pictures are chosen */}
          <View className="mb-3 flex-row items-center justify-center gap-2">
            <Text className="text-[12px] font-bold" style={{ color: colors.inkSoft }}>
              {seq.length} / 3 zaɓaɓɓu · chosen
            </Text>
            {seq.length > 0 && (
              <Pressable onPress={() => setSeq([])} hitSlop={8} className="flex-row items-center gap-1 rounded-full px-2.5 py-1" style={{ backgroundColor: "#F1EFF9" }}>
                <Ionicons name="refresh" size={12} color={colors.purple} />
                <Text className="text-[11px] font-bold" style={{ color: colors.purple }}>Sake · Clear</Text>
              </Pressable>
            )}
          </View>

          <View className={narrow ? "items-center" : "flex-row justify-center"} style={{ gap: narrow ? 16 : 20 }}>
            {/* icon grid */}
            <View className="flex-row flex-wrap justify-center" style={{ maxWidth: narrow ? 3 * tile + 24 : 320, gap: 12 }}>
              {layout.map((iconIndex) => {
                const picked = seq.includes(iconIndex);
                const art = PASSCODE_ORDER[iconIndex];
                return (
                  <Pressable key={iconIndex} onPress={() => tap(iconIndex)}
                    className="items-center justify-center rounded-2xl"
                    style={{ width: tile, height: tile, backgroundColor: picked ? colors.purpleSoft : "#fff", borderWidth: 2, borderColor: picked ? colors.purple : colors.line }}>
                    {art ? <Image source={art} style={{ width: tile * 0.65, height: tile * 0.65 }} resizeMode="contain" /> : <Text style={{ fontSize: tile * 0.4 }}>{SECRET_ICONS[iconIndex]}</Text>}
                  </Pressable>
                );
              })}
            </View>
            {/* slots 1-2-3 — beside the grid on tablet, below it on a phone */}
            <View className={narrow ? "flex-row justify-center gap-3" : "justify-center gap-3"}>
              {[0, 1, 2].map((i) => (
                <View key={i} className="flex-row items-center gap-2">
                  <View className="h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: colors.blue }}>
                    <Text className="text-[13px] font-black text-white">{i + 1}</Text>
                  </View>
                  <View className="h-14 w-14 items-center justify-center rounded-2xl" style={{ borderWidth: 2, borderStyle: "dashed", borderColor: colors.purple, backgroundColor: seq[i] !== undefined ? colors.purpleSoft : "#fff" }}>
                    {seq[i] !== undefined
                      ? (PASSCODE_ORDER[seq[i]] ? <Image source={PASSCODE_ORDER[seq[i]]} style={{ width: 38, height: 38 }} resizeMode="contain" /> : <Text className="text-2xl">{SECRET_ICONS[seq[i]]}</Text>)
                      : <Ionicons name="star-outline" size={20} color={colors.line} />}
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View className="mt-5 flex-row items-center justify-between">
            <Pressable onPress={() => setShowPin(true)} className="flex-row items-center gap-2 rounded-2xl px-4 py-3" style={{ borderWidth: 1.5, borderColor: colors.line }}>
              <Ionicons name="call-outline" size={16} color={colors.inkSoft} />
              <Text className="text-[12px]" style={{ color: colors.inkSoft }}>Can't remember? Call teacher</Text>
            </Pressable>
            <Pressable disabled={seq.length < 3} onPress={confirm} className="items-center rounded-2xl px-10 py-3" style={{ backgroundColor: seq.length < 3 ? colors.line : colors.purple }}>
              <Text className="text-[14px] font-black tracking-wider" style={{ color: seq.length < 3 ? colors.inkSoft : "#fff" }}>TABBATAR · CONFIRM</Text>
            </Pressable>
          </View>

          {/* FR-3.3 — facilitator override. The child's pictures are shown
              ONLY after the facilitator PIN, so a teacher can re-teach a
              child who has forgotten, without weakening the passcode. */}
          {showPin && (
            <View className="mt-4 rounded-2xl p-4" style={{ backgroundColor: "#F4F0FE", borderWidth: 1, borderColor: "#E4DBFA" }}>
              {!revealed ? (
                <View>
                  <Text className="mb-2 text-center text-[12.5px] font-bold" style={{ color: colors.purpleDeep }}>
                    Facilitator PIN to show this child's pictures
                  </Text>
                  <View className="flex-row items-center justify-center gap-2">
                    <TextInput
                      value={pin}
                      onChangeText={setPin}
                      keyboardType="number-pad"
                      secureTextEntry
                      maxLength={4}
                      placeholder="****"
                      placeholderTextColor={colors.inkSoft}
                      className="rounded-xl px-4 py-2 text-center"
                      style={{ borderWidth: 1.5, borderColor: colors.line, backgroundColor: "#fff", color: colors.ink, minWidth: 110, letterSpacing: 6 }}
                    />
                    <Pressable
                      onPress={async () => {
                        if (await checkFacilitatorPin(pin)) { setRevealed(true); setPin(""); }
                        else { feedback.wrong(); setPin(""); }
                      }}
                      className="rounded-xl px-4 py-2.5" style={{ backgroundColor: colors.purple }}>
                      <Text className="text-[12.5px] font-black text-white">Show</Text>
                    </Pressable>
                    <Pressable onPress={() => { setShowPin(false); setPin(""); }} className="rounded-xl px-3 py-2.5" style={{ borderWidth: 1, borderColor: colors.line }}>
                      <Text className="text-[12.5px] font-bold" style={{ color: colors.inkSoft }}>Close</Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <View>
                  <Text className="mb-2 text-center text-[12.5px] font-bold" style={{ color: colors.purpleDeep }}>
                    This child's pictures, in order
                  </Text>
                  <View className="flex-row items-center justify-center gap-3">
                    {childPasscode.map((idx, k) => (
                      <View key={k} className="items-center">
                        <View className="h-14 w-14 items-center justify-center rounded-2xl" style={{ backgroundColor: "#fff", borderWidth: 2, borderColor: colors.purple }}>
                          {PASSCODE_ORDER[idx]
                            ? <Image source={PASSCODE_ORDER[idx]} style={{ width: 38, height: 38 }} resizeMode="contain" />
                            : <Text className="text-2xl">{SECRET_ICONS[idx]}</Text>}
                        </View>
                        <Text className="mt-1 text-[11px] font-bold" style={{ color: colors.inkSoft }}>{k + 1}</Text>
                      </View>
                    ))}
                    <Pressable onPress={() => { setShowPin(false); setRevealed(false); }} className="ml-2 rounded-xl px-3 py-2.5" style={{ borderWidth: 1, borderColor: colors.line }}>
                      <Text className="text-[12.5px] font-bold" style={{ color: colors.inkSoft }}>Close</Text>
                    </Pressable>
                  </View>
                </View>
              )}
            </View>
          )}
        </View>
        <Pressable className="mt-5 flex-row items-center gap-2" onPress={() => router.back()}>
          <View className="h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: "#fff", borderWidth: 1, borderColor: colors.line }}>
            <Ionicons name="arrow-back" size={16} color={colors.ink} />
          </View>
          <Text className="text-[13px]" style={{ color: colors.ink }}>Back</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
