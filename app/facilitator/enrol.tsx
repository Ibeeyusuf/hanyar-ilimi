import { useState } from "react";
import { View, Text, Pressable, TextInput, ScrollView, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { colors } from "@/constants/theme";
import { elevation, surface } from "@/constants/ui";
import SceneBackdrop from "@/components/SceneBackdrop";
import { SECRET_ICONS } from "@/constants/content";
import { PASSCODE_ORDER } from "@/constants/images";
import { enrolChild, getDevice, updateChild } from "@/lib/data";
import { capturePortrait, choosePortrait, savePortrait, explainPickFailure } from "@/lib/photos";
import { feedback } from "@/lib/feedback";

/**
 * Enrolment: photo -> name/age/sex -> 3 secret pictures. Target under 5 min.
 *
 * The photo comes first because it is the child's login. Everything else can
 * be corrected later from the dashboard; a child who cannot find their own
 * face cannot get into the app at all.
 */
const STEPS = ["Photo", "Details", "Secret pictures"];

export default function Enrol() {
  const [stepN, setStepN] = useState(0);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState<"f" | "m" | null>(null);
  const [seq, setSeq] = useState<number[]>([]);
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoNote, setPhotoNote] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const canDetails = name.trim().length > 0 && sex !== null;

  const pick = async (mode: "camera" | "library") => {
    feedback.tap();
    setPhotoNote(null);
    const res = mode === "camera" ? await capturePortrait() : await choosePortrait();
    if (res.ok) { setPhoto(res.uri); return; }
    setPhotoNote(explainPickFailure(res.reason));
  };

  const tapIcon = (i: number) => {
    if (seq.includes(i) || seq.length >= 3) return;
    feedback.tap();
    setSeq([...seq, i]);
  };

  const finish = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const device = await getDevice();
      const child = await enrolChild({
        name: name.trim(),
        sex: sex!,
        dobEst: age ? new Date().getFullYear() - parseInt(age, 10) : undefined,
        passcode: seq,
        deviceId: device.id,
      });
      // The portrait is moved out of the picker's cache only once the child
      // has an ID to file it under.
      if (photo) {
        const stored = await savePortrait(child.id, photo);
        if (stored) await updateChild(child.id, { photoUri: stored });
      }
      feedback.success();
      router.replace("/facilitator/dashboard");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.skyMid }}>
      <SceneBackdrop />
      <ScrollView contentContainerStyle={{ padding: 16, flexGrow: 1, justifyContent: "center" }}>
        <View className="w-full self-center rounded-3xl bg-white p-6" style={{ maxWidth: 480, ...elevation.md }}>
          <View className="mb-4 flex-row items-center gap-2">
            <Ionicons name="person-add" size={22} color={colors.purple} />
            <Text className="text-[18px] font-black" style={{ color: colors.ink }}>Enrol a child</Text>
          </View>

          {/* progress */}
          <View className="mb-2 flex-row gap-1.5">
            {STEPS.map((_, i) => (
              <View key={i} className="h-2 flex-1 rounded-full" style={{ backgroundColor: i <= stepN ? colors.purple : colors.line }} />
            ))}
          </View>
          <Text className="mb-5 text-[11px] font-bold tracking-wider" style={{ color: colors.inkSoft }}>
            STEP {stepN + 1} OF {STEPS.length} · {STEPS[stepN].toUpperCase()}
          </Text>

          {stepN === 0 && (
            <View>
              <Text className="mb-1 text-[13px] font-bold" style={{ color: colors.ink }}>Take the child’s photo</Text>
              <Text className="mb-4 text-[11.5px]" style={{ color: colors.inkSoft }}>
                This is how they will find themselves at login. Photograph the face straight on, in good light. The photo stays on this tablet and is never uploaded.
              </Text>

              <View className="items-center">
                <View className="items-center justify-center overflow-hidden rounded-full"
                  style={{ height: 148, width: 148, backgroundColor: surface.cardAlt, borderWidth: 3, borderStyle: photo ? "solid" : "dashed", borderColor: photo ? colors.green : colors.line }}>
                  {photo
                    ? <Image source={{ uri: photo }} style={{ width: 148, height: 148 }} resizeMode="cover" />
                    : <Ionicons name="camera-outline" size={44} color={colors.inkSoft} />}
                </View>
              </View>

              {photoNote && (
                <View className="mt-3 flex-row items-start gap-2 rounded-2xl px-4 py-3" style={{ backgroundColor: "#FFF6E5", borderWidth: 1, borderColor: "#F0D9A8" }}>
                  <Ionicons name="information-circle" size={16} color={colors.goldDark} />
                  <Text className="flex-1 text-[12px]" style={{ color: colors.ink }}>{photoNote}</Text>
                </View>
              )}

              <View className="mt-4 flex-row gap-3">
                <Pressable onPress={() => pick("camera")} className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl py-3.5" style={{ backgroundColor: colors.purple }}>
                  <Ionicons name="camera" size={17} color="#fff" />
                  <Text className="text-[13px] font-black text-white">{photo ? "Retake" : "Take photo"}</Text>
                </Pressable>
                <Pressable onPress={() => pick("library")} className="flex-row items-center justify-center gap-2 rounded-2xl px-5 py-3.5" style={{ borderWidth: 1.5, borderColor: colors.line }}>
                  <Ionicons name="images-outline" size={17} color={colors.ink} />
                  <Text className="text-[13px] font-bold" style={{ color: colors.ink }}>Choose</Text>
                </Pressable>
              </View>

              <Pressable onPress={() => setStepN(1)} className="mt-3 items-center rounded-2xl py-3.5" style={{ backgroundColor: photo ? colors.green : colors.purpleSoft }}>
                <Text className="text-[14px] font-black" style={{ color: photo ? "#fff" : colors.purpleDeep }}>
                  {photo ? "Next: details" : "Skip photo for now"}
                </Text>
              </Pressable>
              {!photo && (
                <Text className="mt-2 text-center text-[11px]" style={{ color: colors.inkSoft }}>
                  Without a photo the child gets a drawn face instead. You can add one later from their record on the dashboard.
                </Text>
              )}
            </View>
          )}

          {stepN === 1 && (
            <View>
              <Text className="mb-1 text-[12px] font-bold" style={{ color: colors.inkSoft }}>Name</Text>
              <TextInput value={name} onChangeText={setName} placeholder="Child’s name" placeholderTextColor={colors.inkSoft}
                className="mb-3 rounded-2xl px-4 py-3" style={{ borderWidth: 1.5, borderColor: colors.line, color: colors.ink }} />

              <Text className="mb-1 text-[12px] font-bold" style={{ color: colors.inkSoft }}>Age (approx)</Text>
              <TextInput value={age} onChangeText={(t) => setAge(t.replace(/\D/g, "").slice(0, 2))} keyboardType="number-pad" placeholder="e.g. 9" placeholderTextColor={colors.inkSoft}
                className="mb-3 rounded-2xl px-4 py-3" style={{ borderWidth: 1.5, borderColor: colors.line, color: colors.ink }} />

              <Text className="mb-1 text-[12px] font-bold" style={{ color: colors.inkSoft }}>Sex</Text>
              <View className="mb-4 flex-row gap-3">
                {(["f", "m"] as const).map((s) => (
                  <Pressable key={s} onPress={() => setSex(s)} className="flex-1 items-center rounded-2xl py-3" style={{ borderWidth: 2, borderColor: sex === s ? colors.purple : colors.line, backgroundColor: sex === s ? colors.purpleSoft : "#fff" }}>
                    <Text className="text-[14px] font-bold" style={{ color: colors.ink }}>{s === "f" ? "Girl" : "Boy"}</Text>
                  </Pressable>
                ))}
              </View>

              <View className="flex-row gap-3">
                <Pressable onPress={() => setStepN(0)} className="items-center rounded-2xl px-6 py-3.5" style={{ borderWidth: 1.5, borderColor: colors.line }}>
                  <Text className="text-[13px] font-bold" style={{ color: colors.ink }}>Back</Text>
                </Pressable>
                <Pressable disabled={!canDetails} onPress={() => setStepN(2)} className="flex-1 items-center rounded-2xl py-3.5" style={{ backgroundColor: canDetails ? colors.purple : colors.line }}>
                  <Text className="text-[14px] font-black" style={{ color: canDetails ? "#fff" : colors.inkSoft }}>Next: secret pictures</Text>
                </Pressable>
              </View>
            </View>
          )}

          {stepN === 2 && (
            <View>
              <Text className="mb-1 text-[13px] font-bold" style={{ color: colors.ink }}>Choose {name.trim() || "the child"}’s 3 secret pictures, in order</Text>
              <Text className="mb-3 text-[11px]" style={{ color: colors.inkSoft }}>This becomes their passcode. Let the child pick them.</Text>
              <View className="flex-row flex-wrap justify-center gap-3">
                {SECRET_ICONS.map((icon, i) => {
                  const order = seq.indexOf(i);
                  const picked = order >= 0;
                  return (
                    <Pressable key={i} onPress={() => tapIcon(i)} className="h-20 w-20 items-center justify-center rounded-2xl"
                      style={{ backgroundColor: picked ? colors.purpleSoft : "#fff", borderWidth: 2, borderColor: picked ? colors.purple : colors.line }}>
                      {PASSCODE_ORDER[i] ? <Image source={PASSCODE_ORDER[i]} style={{ width: 48, height: 48 }} resizeMode="contain" /> : <Text className="text-3xl">{icon}</Text>}
                      {picked && <View className="absolute right-1 top-1 h-5 w-5 items-center justify-center rounded-full" style={{ backgroundColor: colors.purple }}><Text className="text-[10px] font-black text-white">{order + 1}</Text></View>}
                    </Pressable>
                  );
                })}
              </View>
              <View className="mt-4 flex-row gap-3">
                <Pressable onPress={() => { setSeq([]); setStepN(1); }} className="items-center rounded-2xl px-6 py-3" style={{ borderWidth: 1.5, borderColor: colors.line }}>
                  <Text className="text-[13px] font-bold" style={{ color: colors.ink }}>Back</Text>
                </Pressable>
                <Pressable disabled={seq.length !== 3 || saving} onPress={finish} className="flex-1 items-center rounded-2xl py-3" style={{ backgroundColor: seq.length === 3 && !saving ? colors.green : colors.line }}>
                  <Text className="text-[13px] font-black" style={{ color: seq.length === 3 && !saving ? "#fff" : colors.inkSoft }}>
                    {saving ? "Saving…" : "Finish enrolment"}
                  </Text>
                </Pressable>
              </View>
              {seq.length > 0 && seq.length < 3 && (
                <Text className="mt-2 text-center text-[11px]" style={{ color: colors.inkSoft }}>{seq.length} of 3 chosen</Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
