import { View, Text, Pressable, ScrollView, useWindowDimensions } from "react-native";
import { useCallback, useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { speak } from "@/lib/speech";
import { PHRASES } from "@/constants/phrases";
import { colors, NAV } from "@/constants/theme";
import { elevation, surface } from "@/constants/ui";
import { SUBJECTS } from "@/constants/content";
import { moduleArt } from "@/constants/images";
import SmartImage from "@/components/SmartImage";
import AppShell from "@/components/nav/AppShell";
import { isDownloaded, setDownloaded } from "@/lib/offline";
import { getSessionChildId, getModuleStates, type ModuleState } from "@/lib/data";
import { feedback } from "@/lib/feedback";

export default function ModulesScreen() {
  // FR-1.2: speak the screen instruction on load
  useEffect(() => { speak(PHRASES.chooseAModule); }, []);
  const { subject } = useLocalSearchParams<{ subject: string }>();
  const meta = SUBJECTS.find((s) => s.id === subject) ?? SUBJECTS[0];
  const { width } = useWindowDimensions();
  const cardW = width >= NAV.breakpoint ? "31%" : width >= 560 ? "47%" : "100%";

  /**
   * Module cards used to render a `progress` number hardcoded in content.ts —
   * a brand-new child was shown "GRAMMAR 75%". Both the bar and the lock now
   * come from what this child has actually completed.
   */
  const [modules, setModules] = useState<ModuleState[]>([]);
  useFocusEffect(useCallback(() => {
    let alive = true;
    (async () => {
      const childId = await getSessionChildId();
      const states = await getModuleStates(childId, meta.id);
      if (alive) setModules(states);
    })();
    return () => { alive = false; };
  }, [meta.id]));

  const [downloaded, setDl] = useState(false);
  useEffect(() => { isDownloaded(meta.id).then(setDl); }, [meta.id]);
  const toggleDownload = async () => {
    feedback.tap();
    const next = !downloaded;
    setDl(next);
    await setDownloaded(meta.id, next);
  };

  return (
    <AppShell crumbs={[{ label: meta.en, color: meta.color }, { label: "MODULES", active: true }]}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <Text className="text-center text-[26px] font-black" style={{ color: colors.purple }}>{meta.en} MODULES</Text>
        <Text className="mb-3 text-center text-[13px] font-bold" style={{ color: colors.purpleDeep }}>{meta.ha}</Text>

        <Pressable onPress={toggleDownload} className="mb-5 flex-row items-center justify-center gap-2 self-center rounded-full px-4 py-2"
          style={{ backgroundColor: downloaded ? "#E7F4DC" : "#fff", borderWidth: 1.5, borderColor: downloaded ? colors.green : colors.line }}>
          <Ionicons name={downloaded ? "checkmark-circle" : "cloud-download-outline"} size={16} color={downloaded ? colors.green : colors.inkSoft} />
          <Text className="text-[12px] font-bold" style={{ color: downloaded ? colors.greenDark : colors.inkSoft }}>
            {downloaded ? "An sauke · Available offline" : "Sauke don amfani ba tare da intanet ba · Download"}
          </Text>
        </Pressable>

        <View className="flex-row flex-wrap justify-center" style={{ gap: 16 }}>
          {modules.map((m) => (
            <Pressable key={m.id} disabled={m.locked}
              onPress={() => { feedback.tap(); router.push(`/subject/${meta.id}/${m.id}`); }}
              style={{ width: cardW as any, opacity: m.locked ? 0.6 : 1 }}>
              <View className="rounded-3xl p-4" style={{ backgroundColor: "#fff", borderWidth: 1, borderColor: surface.border, ...elevation.sm }}>
                <View className="h-24 items-center justify-center">
                  {moduleArt[m.id] ? (
                    <SmartImage source={moduleArt[m.id]} size={72} />
                  ) : (
                    <View className="h-[68px] w-[68px] items-center justify-center rounded-2xl" style={{ backgroundColor: (meta.color ?? colors.purple) + "22" }}>
                      <Ionicons name={(m.icon as any) ?? "ellipse"} size={34} color={meta.color ?? colors.purple} />
                    </View>
                  )}
                </View>
              </View>
              {/* label bar */}
              <View className="mt-2 rounded-2xl px-3 py-2" style={{ backgroundColor: "#6E5836" }}>
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-[13px] font-black text-white">{m.num}. {m.en}</Text>
                    <Text className="text-[11px]" style={{ color: "#E7D9BC" }}>{m.ha}</Text>
                  </View>
                  <View className="h-7 w-7 items-center justify-center rounded-full" style={{ backgroundColor: m.locked ? colors.inkSoft : colors.purple }}>
                    <Ionicons name={m.locked ? "lock-closed" : "star"} size={14} color="#fff" />
                  </View>
                </View>
                <View className="mt-2 h-2 overflow-hidden rounded-full" style={{ backgroundColor: "#4E3F27" }}>
                  <View className="h-2 rounded-full" style={{ width: `${m.percent}%`, backgroundColor: colors.green }} />
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-[10px]" style={{ color: "#E7D9BC" }}>
                    {m.locked ? "Kammala darasin baya tukuna" : `${m.stars} ⭐`}
                  </Text>
                  <Text className="text-[10px]" style={{ color: "#E7D9BC" }}>{m.percent}%</Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </AppShell>
  );
}
