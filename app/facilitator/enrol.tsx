import { useState } from "react";
import { View, Text, Pressable, TextInput, ScrollView, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { colors } from "@/constants/theme";
import SceneBackdrop from "@/components/SceneBackdrop";
import { SECRET_ICONS } from "@/constants/content";
import { PASSCODE_ORDER } from "@/constants/images";
import { enrolChild, getDevice } from "@/lib/data";
import { feedback } from "@/lib/feedback";

// PRD enrolment: photo (demo skips camera) -> name/age/sex -> assign ->
// child picks 3 secret pictures -> done. Target <=5 min.
export default function Enrol() {
  const [stepN, setStepN] = useState(0);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState<"f" | "m" | null>(null);
  const [seq, setSeq] = useState<number[]>([]);

  const canDetails = name.trim().length > 0 && sex !== null;

  const tapIcon = (i: number) => {
    if (seq.includes(i) || seq.length >= 3) return;
    feedback.tap();
    setSeq([...seq, i]);
  };

  const finish = async () => {
    const device = await getDevice();
    await enrolChild({
      name: name.trim(),
      sex: sex!,
      dobEst: age ? new Date().getFullYear() - parseInt(age) : undefined,
      passcode: seq,
      deviceId: device.id,
    });
    feedback.success();
    router.replace("/facilitator/dashboard");
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.skyMid }}>
      <SceneBackdrop />
      <ScrollView contentContainerStyle={{ padding: 16, flexGrow: 1, justifyContent: "center" }}>
        <View className="w-full self-center rounded-3xl bg-white p-6" style={{ maxWidth: 480, shadowColor: "#1F2A3C", shadowOpacity: 0.12, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 6 }}>
          <View className="mb-4 flex-row items-center gap-2">
            <Ionicons name="person-add" size={22} color={colors.purple} />
            <Text className="text-[18px] font-black" style={{ color: colors.ink }}>Enrol a Child</Text>
          </View>

          {/* progress */}
          <View className="mb-5 flex-row gap-1.5">
            {[0, 1].map((i) => (
              <View key={i} className="h-2 flex-1 rounded-full" style={{ backgroundColor: i <= stepN ? colors.purple : colors.line }} />
            ))}
          </View>

          {stepN === 0 && (
            <View>
              <Text className="mb-1 text-[12px] font-bold" style={{ color: colors.inkSoft }}>Name</Text>
              <TextInput value={name} onChangeText={setName} placeholder="Child's name" placeholderTextColor={colors.inkSoft}
                className="mb-3 rounded-2xl px-4 py-3" style={{ borderWidth: 1.5, borderColor: colors.line, color: colors.ink }} />

              <Text className="mb-1 text-[12px] font-bold" style={{ color: colors.inkSoft }}>Age (approx)</Text>
              <TextInput value={age} onChangeText={setAge} keyboardType="number-pad" placeholder="e.g. 9" placeholderTextColor={colors.inkSoft}
                className="mb-3 rounded-2xl px-4 py-3" style={{ borderWidth: 1.5, borderColor: colors.line, color: colors.ink }} />

              <Text className="mb-1 text-[12px] font-bold" style={{ color: colors.inkSoft }}>Sex</Text>
              <View className="mb-4 flex-row gap-3">
                {(["f", "m"] as const).map((s) => (
                  <Pressable key={s} onPress={() => setSex(s)} className="flex-1 items-center rounded-2xl py-3" style={{ borderWidth: 2, borderColor: sex === s ? colors.purple : colors.line, backgroundColor: sex === s ? colors.purpleSoft : "#fff" }}>
                    <Text className="text-[14px] font-bold" style={{ color: colors.ink }}>{s === "f" ? "Girl" : "Boy"}</Text>
                  </Pressable>
                ))}
              </View>

              <Pressable disabled={!canDetails} onPress={() => setStepN(1)} className="items-center rounded-2xl py-3.5" style={{ backgroundColor: canDetails ? colors.purple : colors.line }}>
                <Text className="text-[14px] font-black" style={{ color: canDetails ? "#fff" : colors.inkSoft }}>Next: choose secret pictures</Text>
              </Pressable>
            </View>
          )}

          {stepN === 1 && (
            <View>
              <Text className="mb-1 text-[13px] font-bold" style={{ color: colors.ink }}>Choose {name}'s 3 secret pictures (in order)</Text>
              <Text className="mb-3 text-[11px]" style={{ color: colors.inkSoft }}>This becomes the child's passcode.</Text>
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
                <Pressable onPress={() => { setSeq([]); setStepN(0); }} className="flex-1 items-center rounded-2xl py-3" style={{ borderWidth: 1.5, borderColor: colors.line }}>
                  <Text className="text-[13px] font-bold" style={{ color: colors.ink }}>Back</Text>
                </Pressable>
                <Pressable disabled={seq.length !== 3} onPress={finish} className="flex-1 items-center rounded-2xl py-3" style={{ backgroundColor: seq.length === 3 ? colors.green : colors.line }}>
                  <Text className="text-[13px] font-black" style={{ color: seq.length === 3 ? "#fff" : colors.inkSoft }}>Finish enrolment</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
