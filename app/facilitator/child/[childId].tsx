import { useCallback, useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput, Modal, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { colors } from "@/constants/theme";
import { elevation, surface } from "@/constants/ui";
import SceneBackdrop from "@/components/SceneBackdrop";
import ChildPortrait from "@/components/ChildPortrait";
import { SECRET_ICONS } from "@/constants/content";
import { PASSCODE_ORDER } from "@/constants/images";
import { feedback } from "@/lib/feedback";
import { capturePortrait, choosePortrait, savePortrait, deletePortrait, explainPickFailure } from "@/lib/photos";
import {
  getChild, updateChild, removeChild, resetPasscode, getChildPasscode,
  getProgress, getTotalStars, masteryPercent, type Child,
} from "@/lib/data";

/**
 * Child record (facilitator only — this route sits behind the PIN).
 *
 * This screen exists because enrolment tells a facilitator they can add a
 * photo later, and until now there was nowhere to do it. Everything captured
 * at enrolment has to be correctable here: a name spelled wrong on a busy
 * morning, an age guessed and later confirmed, a portrait taken against a
 * window, and — the one that actually locks a child out — a set of secret
 * pictures they cannot remember.
 */
export default function ChildRecord() {
  const { childId } = useLocalSearchParams<{ childId: string }>();

  const [child, setChild] = useState<Child | null>(null);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState<"f" | "m">("f");
  const [passcode, setPasscode] = useState<number[]>([]);
  const [stats, setStats] = useState({ lessons: 0, stars: 0, mastery: 0 });

  const [note, setNote] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [showPasscode, setShowPasscode] = useState(false);
  const [draftPasscode, setDraftPasscode] = useState<number[]>([]);
  const [confirmRemove, setConfirmRemove] = useState(false);

  useFocusEffect(useCallback(() => {
    let alive = true;
    (async () => {
      if (!childId) return;
      const c = await getChild(childId);
      const progress = await getProgress(childId);
      const stars = await getTotalStars(childId);
      const mastery = await masteryPercent(childId);
      const pc = await getChildPasscode(childId);
      if (!alive || !c) return;
      setChild(c);
      setName(c.name);
      setAge(c.dobEst ? String(new Date().getFullYear() - c.dobEst) : "");
      setSex(c.sex);
      setPasscode(pc);
      setStats({ lessons: progress.filter((p) => p.completedAt).length, stars, mastery });
    })();
    return () => { alive = false; };
  }, [childId]));

  const flash = (msg: string | null) => { setNote(msg); setSaved(false); };

  const changePhoto = async (mode: "camera" | "library") => {
    if (!child) return;
    feedback.tap();
    flash(null);
    const res = mode === "camera" ? await capturePortrait() : await choosePortrait();
    if (!res.ok) { flash(explainPickFailure(res.reason)); return; }
    const stored = await savePortrait(child.id, res.uri);
    if (!stored) { flash("The photo could not be saved. Try again."); return; }
    await updateChild(child.id, { photoUri: stored });
    // The stored path is stable, so React Native's image cache would keep
    // showing the old face. A cache-busting suffix forces the reload.
    setChild({ ...child, photoUri: `${stored}?v=${Date.now()}` });
    setSaved(true);
  };

  const removePhoto = async () => {
    if (!child) return;
    feedback.tap();
    await deletePortrait(child.id);
    await updateChild(child.id, { photoUri: undefined });
    setChild({ ...child, photoUri: undefined });
    flash("Photo removed. This child now shows a drawn face at login.");
  };

  const saveDetails = async () => {
    if (!child || !name.trim()) return;
    feedback.tap();
    await updateChild(child.id, {
      name: name.trim(),
      sex,
      dobEst: age ? new Date().getFullYear() - parseInt(age, 10) : undefined,
    });
    setNote(null);
    setSaved(true);
  };

  const savePasscode = async () => {
    if (!child || draftPasscode.length !== 3) return;
    await resetPasscode(child.id, draftPasscode);
    setPasscode(draftPasscode);
    setDraftPasscode([]);
    setShowPasscode(false);
    feedback.success();
    setNote(null);
    setSaved(true);
  };

  const doRemove = async () => {
    if (!child) return;
    await removeChild(child.id);
    feedback.tap();
    router.replace("/facilitator/dashboard");
  };

  if (!child) {
    return (
      <View className="flex-1" style={{ backgroundColor: colors.skyMid }}>
        <SceneBackdrop />
        <Text className="p-8 text-center text-[13px]" style={{ color: colors.inkSoft }}>Loading…</Text>
      </View>
    );
  }

  const dirty = name.trim() !== child.name
    || sex !== child.sex
    || age !== (child.dobEst ? String(new Date().getFullYear() - child.dobEst) : "");

  return (
    <View className="flex-1" style={{ backgroundColor: colors.skyMid }}>
      <SceneBackdrop />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View className="mb-4 flex-row items-center gap-3">
          <Pressable onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-full bg-white" style={{ borderWidth: 1, borderColor: surface.border, ...elevation.xs }}>
            <Ionicons name="arrow-back" size={19} color={colors.ink} />
          </Pressable>
          <View className="flex-1">
            <Text className="text-[19px] font-black" style={{ color: colors.ink }}>{child.name}</Text>
            <Text className="text-[11.5px]" style={{ color: colors.inkSoft }}>
              Enrolled {new Date(child.enrolledAt).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {(note || saved) && (
          <View className="mb-4 flex-row items-start gap-2 rounded-2xl px-4 py-3"
            style={{ backgroundColor: note ? "#FFF6E5" : "#E7F4DC", borderWidth: 1, borderColor: note ? "#F0D9A8" : "#C7E3AE" }}>
            <Ionicons name={note ? "information-circle" : "checkmark-circle"} size={16} color={note ? colors.goldDark : colors.greenDark} />
            <Text className="flex-1 text-[12px]" style={{ color: colors.ink }}>{note ?? "Saved."}</Text>
          </View>
        )}

        {/* what this child has done — read-only, so a facilitator can see
            whether a change is worth making before they make it */}
        <View className="mb-4 flex-row gap-3">
          {[
            { label: "LESSONS", value: `${stats.lessons}`, color: colors.green },
            { label: "STARS", value: `${stats.stars}`, color: colors.gold },
            { label: "MASTERY", value: stats.mastery ? `${stats.mastery}%` : "—", color: colors.purple },
          ].map((m) => (
            <View key={m.label} className="flex-1 overflow-hidden rounded-2xl bg-white" style={{ borderWidth: 1, borderColor: surface.border, ...elevation.sm }}>
              <View style={{ height: 3, backgroundColor: m.color }} />
              <View className="items-center p-3">
                <Text className="text-[22px] font-black" style={{ color: m.color }}>{m.value}</Text>
                <Text className="text-[9.5px] font-black tracking-wider" style={{ color: colors.inkSoft }}>{m.label}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* portrait */}
        <View className="mb-4 rounded-2xl bg-white p-4" style={{ borderWidth: 1, borderColor: surface.border, ...elevation.sm }}>
          <Text className="mb-1 text-[10.5px] font-black tracking-wider" style={{ color: colors.inkSoft }}>LOGIN PHOTO</Text>
          <Text className="mb-3 text-[11.5px]" style={{ color: colors.inkSoft }}>
            This is how {child.name} finds themselves at login. It stays on this tablet.
          </Text>
          <View className="flex-row items-center gap-4">
            <ChildPortrait child={child} size={84} ringColor={child.photoUri ? colors.green : colors.line} ringWidth={3} />
            <View className="flex-1 gap-2">
              <View className="flex-row gap-2">
                <Pressable onPress={() => changePhoto("camera")} className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl py-2.5" style={{ backgroundColor: colors.purple }}>
                  <Ionicons name="camera" size={15} color="#fff" />
                  <Text className="text-[12px] font-black text-white">{child.photoUri ? "Retake" : "Take photo"}</Text>
                </Pressable>
                <Pressable onPress={() => changePhoto("library")} className="flex-row items-center justify-center gap-2 rounded-2xl px-4 py-2.5" style={{ borderWidth: 1.5, borderColor: colors.line }}>
                  <Ionicons name="images-outline" size={15} color={colors.ink} />
                  <Text className="text-[12px] font-bold" style={{ color: colors.ink }}>Choose</Text>
                </Pressable>
              </View>
              {child.photoUri && (
                <Pressable onPress={removePhoto} className="items-center rounded-2xl py-2" hitSlop={6}>
                  <Text className="text-[11.5px] font-bold" style={{ color: colors.red }}>Remove photo</Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>

        {/* details */}
        <View className="mb-4 rounded-2xl bg-white p-4" style={{ borderWidth: 1, borderColor: surface.border, ...elevation.sm }}>
          <Text className="mb-3 text-[10.5px] font-black tracking-wider" style={{ color: colors.inkSoft }}>DETAILS</Text>

          <Text className="mb-1 text-[12px] font-bold" style={{ color: colors.inkSoft }}>Name</Text>
          <TextInput value={name} onChangeText={setName} placeholderTextColor={colors.inkSoft}
            className="mb-3 rounded-2xl px-4 py-3" style={{ borderWidth: 1.5, borderColor: colors.line, color: colors.ink }} />

          <Text className="mb-1 text-[12px] font-bold" style={{ color: colors.inkSoft }}>Age (approx)</Text>
          <TextInput value={age} onChangeText={(t) => setAge(t.replace(/\D/g, "").slice(0, 2))} keyboardType="number-pad"
            placeholder="not recorded" placeholderTextColor={colors.inkSoft}
            className="mb-3 rounded-2xl px-4 py-3" style={{ borderWidth: 1.5, borderColor: colors.line, color: colors.ink }} />

          <Text className="mb-1 text-[12px] font-bold" style={{ color: colors.inkSoft }}>Sex</Text>
          <View className="mb-4 flex-row gap-3">
            {(["f", "m"] as const).map((s) => (
              <Pressable key={s} onPress={() => setSex(s)} className="flex-1 items-center rounded-2xl py-3"
                style={{ borderWidth: 2, borderColor: sex === s ? colors.purple : colors.line, backgroundColor: sex === s ? colors.purpleSoft : "#fff" }}>
                <Text className="text-[14px] font-bold" style={{ color: colors.ink }}>{s === "f" ? "Girl" : "Boy"}</Text>
              </Pressable>
            ))}
          </View>

          <Pressable disabled={!dirty || !name.trim()} onPress={saveDetails} className="items-center rounded-2xl py-3.5"
            style={{ backgroundColor: dirty && name.trim() ? colors.green : colors.line }}>
            <Text className="text-[13px] font-black" style={{ color: dirty && name.trim() ? "#fff" : colors.inkSoft }}>Save details</Text>
          </Pressable>
        </View>

        {/* secret pictures */}
        <View className="mb-4 rounded-2xl bg-white p-4" style={{ borderWidth: 1, borderColor: surface.border, ...elevation.sm }}>
          <Text className="mb-1 text-[10.5px] font-black tracking-wider" style={{ color: colors.inkSoft }}>SECRET PICTURES</Text>
          <Text className="mb-3 text-[11.5px]" style={{ color: colors.inkSoft }}>
            {child.name}’s passcode, in order. Show it to remind them; change it if they cannot remember it.
          </Text>
          <View className="flex-row items-center gap-3">
            {passcode.length === 0 && <Text className="text-[12px]" style={{ color: colors.inkSoft }}>No passcode recorded.</Text>}
            {passcode.map((idx, k) => (
              <View key={k} className="items-center">
                <View className="h-14 w-14 items-center justify-center rounded-2xl" style={{ borderWidth: 2, borderColor: colors.purple, backgroundColor: "#fff" }}>
                  {PASSCODE_ORDER[idx]
                    ? <Image source={PASSCODE_ORDER[idx]} style={{ width: 38, height: 38 }} resizeMode="contain" />
                    : <Text className="text-2xl">{SECRET_ICONS[idx]}</Text>}
                </View>
                <Text className="mt-1 text-[11px] font-bold" style={{ color: colors.inkSoft }}>{k + 1}</Text>
              </View>
            ))}
          </View>
          <Pressable onPress={() => { setDraftPasscode([]); setShowPasscode(true); }} className="mt-3 items-center rounded-2xl py-3"
            style={{ borderWidth: 1.5, borderColor: colors.line }}>
            <Text className="text-[13px] font-bold" style={{ color: colors.ink }}>Change secret pictures</Text>
          </Pressable>
        </View>

        {/* removal */}
        <View className="rounded-2xl bg-white p-4" style={{ borderWidth: 1, borderColor: "#F3C9C9" }}>
          <Text className="mb-1 text-[10.5px] font-black tracking-wider" style={{ color: colors.red }}>REMOVE FROM THIS TABLET</Text>
          <Text className="mb-3 text-[11.5px]" style={{ color: colors.inkSoft }}>
            Deletes {child.name}’s profile, photo and passcode from this tablet. Their completed work stays in the record so group totals do not change.
          </Text>
          <Pressable onPress={() => setConfirmRemove(true)} className="items-center rounded-2xl py-3" style={{ borderWidth: 1.5, borderColor: colors.red }}>
            <Text className="text-[13px] font-black" style={{ color: colors.red }}>Remove child</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* change passcode */}
      <Modal visible={showPasscode} transparent animationType="fade" onRequestClose={() => setShowPasscode(false)}>
        <View className="flex-1 items-center justify-center p-6" style={{ backgroundColor: "rgba(30,30,50,0.45)" }}>
          <View className="w-full rounded-3xl bg-white p-5" style={{ maxWidth: 460 }}>
            <Text className="text-[16px] font-black" style={{ color: colors.ink }}>New secret pictures</Text>
            <Text className="mb-3 mt-1 text-[12px]" style={{ color: colors.inkSoft }}>
              Let {child.name} choose all three themselves, in the order they will tap them.
            </Text>
            <View className="flex-row flex-wrap justify-center gap-3">
              {SECRET_ICONS.map((icon, i) => {
                const order = draftPasscode.indexOf(i);
                const picked = order >= 0;
                return (
                  <Pressable key={i}
                    onPress={() => {
                      if (picked) { setDraftPasscode(draftPasscode.filter((x) => x !== i)); return; }
                      if (draftPasscode.length >= 3) return;
                      feedback.tap();
                      setDraftPasscode([...draftPasscode, i]);
                    }}
                    className="h-[72px] w-[72px] items-center justify-center rounded-2xl"
                    style={{ backgroundColor: picked ? colors.purpleSoft : "#fff", borderWidth: 2, borderColor: picked ? colors.purple : colors.line }}>
                    {PASSCODE_ORDER[i] ? <Image source={PASSCODE_ORDER[i]} style={{ width: 44, height: 44 }} resizeMode="contain" /> : <Text className="text-3xl">{icon}</Text>}
                    {picked && (
                      <View className="absolute right-1 top-1 h-5 w-5 items-center justify-center rounded-full" style={{ backgroundColor: colors.purple }}>
                        <Text className="text-[10px] font-black text-white">{order + 1}</Text>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
            <Text className="mt-3 text-center text-[11.5px]" style={{ color: colors.inkSoft }}>{draftPasscode.length} of 3 chosen · tap a picture again to undo</Text>
            <View className="mt-4 flex-row gap-3">
              <Pressable onPress={() => { setShowPasscode(false); setDraftPasscode([]); }} className="flex-1 items-center rounded-2xl py-3" style={{ borderWidth: 1.5, borderColor: colors.line }}>
                <Text className="text-[13px] font-bold" style={{ color: colors.ink }}>Cancel</Text>
              </Pressable>
              <Pressable disabled={draftPasscode.length !== 3} onPress={savePasscode} className="flex-1 items-center rounded-2xl py-3"
                style={{ backgroundColor: draftPasscode.length === 3 ? colors.green : colors.line }}>
                <Text className="text-[13px] font-black" style={{ color: draftPasscode.length === 3 ? "#fff" : colors.inkSoft }}>Save passcode</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* confirm removal */}
      <Modal visible={confirmRemove} transparent animationType="fade" onRequestClose={() => setConfirmRemove(false)}>
        <View className="flex-1 items-center justify-center p-6" style={{ backgroundColor: "rgba(30,30,50,0.45)" }}>
          <View className="w-full rounded-3xl bg-white p-5" style={{ maxWidth: 380 }}>
            <Text className="text-[16px] font-black" style={{ color: colors.ink }}>Remove {child.name}?</Text>
            <Text className="mb-4 mt-1 text-[12px]" style={{ color: colors.inkSoft }}>
              Their profile, photo and passcode are deleted from this tablet and they will no longer appear at login. This cannot be undone here.
            </Text>
            <View className="flex-row gap-3">
              <Pressable onPress={() => setConfirmRemove(false)} className="flex-1 items-center rounded-2xl py-3" style={{ borderWidth: 1.5, borderColor: colors.line }}>
                <Text className="text-[13px] font-bold" style={{ color: colors.ink }}>Keep</Text>
              </Pressable>
              <Pressable onPress={doRemove} className="flex-1 items-center rounded-2xl py-3" style={{ backgroundColor: colors.red }}>
                <Text className="text-[13px] font-black text-white">Remove</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
