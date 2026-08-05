import { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { colors } from "@/constants/theme";
import { elevation, surface } from "@/constants/ui";
import SceneBackdrop from "@/components/SceneBackdrop";
import ChildPortrait from "@/components/ChildPortrait";
import { feedback } from "@/lib/feedback";
import {
  getChildren, hasLoggedInToday, masteryPercent, childrenNeedingHelp, getProgress,
  pendingCount, syncNow, getSyncEndpoint, setSyncEndpoint, getLastSyncAt,
  setFacilitatorPin, pinIsDefault, type Child,
} from "@/lib/data";

type Row = { child: Child; present: boolean; mastery: number; lessons: number; needsHelp: string[] };

export default function Dashboard() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [flags, setFlags] = useState<Record<string, string[]>>({});

  // sync state
  const [pending, setPending] = useState(0);
  const [lastSync, setLastSync] = useState<number | null>(null);
  const [endpoint, setEndpoint] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncNote, setSyncNote] = useState<string | null>(null);
  const [showSync, setShowSync] = useState(false);
  const [endpointDraft, setEndpointDraft] = useState("");

  // PIN state
  const [defaultPin, setDefaultPin] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinNote, setPinNote] = useState<string | null>(null);

  const load = async () => {
    const children = await getChildren();
    const help = await childrenNeedingHelp();
    setFlags(help);
    const built: Row[] = [];
    for (const c of children) {
      const present = await hasLoggedInToday(c.id);
      const mastery = await masteryPercent(c.id);
      const prog = await getProgress(c.id);
      built.push({ child: c, present, mastery, lessons: prog.filter((p) => p.completedAt).length, needsHelp: help[c.id] ?? [] });
    }
    setRows(built);
    setPending(await pendingCount());
    setLastSync(await getLastSyncAt());
    const ep = await getSyncEndpoint();
    setEndpoint(ep);
    setEndpointDraft(ep ?? "");
    setDefaultPin(await pinIsDefault());
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const runSync = async () => {
    setSyncing(true);
    setSyncNote(null);
    const res = await syncNow();
    setSyncing(false);
    setPending(res.pending);
    setLastSync(res.lastSyncAt ?? null);
    if (res.reason === "no-endpoint") { setShowSync(true); setSyncNote("No sync server is configured on this tablet yet."); }
    else if (res.reason === "network") setSyncNote(`No connection. ${res.sent} sent, ${res.pending} still waiting.`);
    else if (res.reason === "server") setSyncNote(`The server rejected the upload. ${res.pending} still waiting.`);
    else setSyncNote(res.sent ? `Uploaded ${res.sent} records.` : "Everything is already up to date.");
  };

  const savePin = async () => {
    if (!/^\d{4}$/.test(newPin)) { setPinNote("The PIN must be exactly 4 digits."); return; }
    if (newPin !== confirmPin) { setPinNote("The two PINs do not match."); return; }
    if (newPin === "1234") { setPinNote("Please choose something other than 1234."); return; }
    await setFacilitatorPin(newPin);
    feedback.success();
    setDefaultPin(false);
    setShowPin(false);
    setNewPin(""); setConfirmPin(""); setPinNote(null);
  };

  const presentCount = rows.filter((r) => r.present).length;
  const avgMastery = rows.length ? Math.round(rows.reduce((s, r) => s + r.mastery, 0) / rows.length) : 0;
  const flaggedCount = Object.keys(flags).length;

  const syncLabel = pending === 0
    ? (lastSync ? "All records synced" : "Nothing to sync yet")
    : `${pending} record${pending === 1 ? "" : "s"} waiting`;

  return (
    <View className="flex-1" style={{ backgroundColor: colors.skyMid }}>
      <SceneBackdrop />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* header */}
        <View className="mb-4 flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <Pressable onPress={() => router.replace("/(auth)/login")} className="h-10 w-10 items-center justify-center rounded-full bg-white" style={{ borderWidth: 1, borderColor: surface.border, ...elevation.xs }}>
              <Ionicons name="arrow-back" size={19} color={colors.ink} />
            </Pressable>
            <View>
              <Text className="text-[19px] font-black" style={{ color: colors.ink }}>Morning Shift · Group A</Text>
              <Text className="text-[11.5px]" style={{ color: colors.inkSoft }}>{new Date().toDateString()}</Text>
            </View>
          </View>
          {/* the chip now reports the real backlog rather than always claiming
              everything will sync */}
          <Pressable onPress={runSync} disabled={syncing}
            className="flex-row items-center gap-1.5 rounded-full px-3 py-1.5"
            style={{ backgroundColor: pending ? "#FFF6E5" : "#E7F4DC", ...elevation.xs }}>
            <Ionicons name={syncing ? "sync" : pending ? "cloud-upload-outline" : "cloud-done-outline"} size={13} color={pending ? colors.goldDark : colors.greenDark} />
            <Text className="text-[11px] font-bold" style={{ color: pending ? colors.goldDark : colors.greenDark }}>
              {syncing ? "Syncing…" : syncLabel}
            </Text>
          </Pressable>
        </View>

        {syncNote && (
          <View className="mb-3 flex-row items-center gap-2 rounded-2xl px-4 py-2.5" style={{ backgroundColor: "#fff", borderWidth: 1, borderColor: surface.border }}>
            <Ionicons name="information-circle-outline" size={16} color={colors.inkSoft} />
            <Text className="flex-1 text-[12px]" style={{ color: colors.ink }}>{syncNote}</Text>
            <Pressable onPress={() => setShowSync(true)} hitSlop={8}>
              <Text className="text-[12px] font-bold" style={{ color: colors.purple }}>Settings</Text>
            </Pressable>
          </View>
        )}

        {defaultPin && (
          <Pressable onPress={() => setShowPin(true)} className="mb-3 flex-row items-center gap-2 rounded-2xl px-4 py-3" style={{ backgroundColor: "#FCEBEA", borderWidth: 1, borderColor: "#F3C9C9" }}>
            <Ionicons name="warning" size={16} color={colors.red} />
            <Text className="flex-1 text-[12px] font-bold" style={{ color: colors.ink }}>This tablet still uses the default PIN 1234. Tap to change it.</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.inkSoft} />
          </Pressable>
        )}

        {/* metric cards */}
        <View className="mb-5 flex-row gap-3">
          {[
            { label: "PRESENT TODAY", value: presentCount, suffix: ` / ${rows.length}`, color: colors.green, icon: "checkmark-done" as const },
            { label: "AVG MASTERY", value: `${avgMastery}%`, suffix: "", color: colors.purple, icon: "trending-up" as const },
            { label: "NEEDS HELP", value: flaggedCount, suffix: "", color: flaggedCount ? colors.red : colors.inkSoft, icon: "alert-circle" as const },
          ].map((m, i) => (
            <View key={i} className="flex-1 overflow-hidden rounded-2xl bg-white" style={{ borderWidth: 1, borderColor: surface.border, ...elevation.sm }}>
              <View style={{ height: 3, backgroundColor: m.color }} />
              <View className="p-4">
                <View className="mb-2 flex-row items-center justify-between">
                  <Text className="text-[10.5px] font-black tracking-wider" style={{ color: colors.inkSoft }}>{m.label}</Text>
                  <Ionicons name={m.icon} size={14} color={m.color} />
                </View>
                <Text className="text-[26px] font-black" style={{ color: m.color }}>{m.value}<Text className="text-[15px]" style={{ color: colors.inkSoft }}>{m.suffix}</Text></Text>
              </View>
            </View>
          ))}
        </View>

        {/* actions */}
        <View className="mb-4 flex-row gap-3">
          <Pressable onPress={() => router.push("/facilitator/enrol")} className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl py-3.5" style={{ backgroundColor: colors.purple, ...elevation.xs }}>
            <Ionicons name="person-add" size={17} color="#fff" />
            <Text className="text-[13px] font-black text-white">Enrol Child</Text>
          </Pressable>
          <Pressable onPress={() => router.push("/facilitator/report")} className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl py-3.5" style={{ backgroundColor: "#fff", borderWidth: 1, borderColor: surface.border, ...elevation.xs }}>
            <Ionicons name="document-text-outline" size={17} color={colors.ink} />
            <Text className="text-[13px] font-bold" style={{ color: colors.ink }}>Report</Text>
          </Pressable>
          <Pressable onPress={() => setShowPin(true)} className="flex-row items-center justify-center gap-2 rounded-2xl px-5 py-3.5" style={{ backgroundColor: "#fff", borderWidth: 1, borderColor: surface.border, ...elevation.xs }}>
            <Ionicons name="key-outline" size={17} color={colors.ink} />
            <Text className="text-[13px] font-bold" style={{ color: colors.ink }}>PIN</Text>
          </Pressable>
          <Pressable onPress={load} className="flex-row items-center justify-center gap-2 rounded-2xl px-5 py-3.5" style={{ backgroundColor: "#fff", borderWidth: 1, borderColor: surface.border, ...elevation.xs }}>
            <Ionicons name="refresh" size={17} color={colors.ink} />
            <Text className="text-[13px] font-bold" style={{ color: colors.ink }}>Refresh</Text>
          </Pressable>
        </View>

        {/* child list */}
        <View className="overflow-hidden rounded-2xl bg-white" style={{ borderWidth: 1, borderColor: surface.border, ...elevation.sm }}>
          <View className="flex-row items-center px-4 py-2.5" style={{ backgroundColor: surface.cardAlt, borderBottomWidth: 1, borderBottomColor: surface.border }}>
            <Text className="flex-1 text-[10.5px] font-black tracking-wider" style={{ color: colors.inkSoft }}>CHILD</Text>
            <Text className="text-[10.5px] font-black tracking-wider" style={{ color: colors.inkSoft }}>STATUS · TAP TO EDIT</Text>
          </View>
          {loading && <Text className="p-5 text-center text-[13px]" style={{ color: colors.inkSoft }}>Loading…</Text>}
          {!loading && rows.map((r, i) => (
            <Pressable key={r.child.id} onPress={() => router.push(`/facilitator/child/${r.child.id}`)}
              className="flex-row items-center gap-3 px-4 py-3" style={{ borderTopWidth: i === 0 ? 0 : 1, borderTopColor: surface.border }}>
              <ChildPortrait child={r.child} size={44} />
              <View className="flex-1">
                <Text className="text-[14px] font-bold" style={{ color: colors.ink }}>{r.child.name}</Text>
                <Text className="text-[11.5px]" style={{ color: colors.inkSoft }}>{r.lessons} lessons completed · {r.mastery}% mastery</Text>
              </View>
              <View className="flex-row items-center gap-2">
                {r.needsHelp.length > 0 && (
                  <View className="flex-row items-center gap-1 rounded-full px-2.5 py-1" style={{ backgroundColor: "#FCEBEA" }}>
                    <Ionicons name="alert-circle" size={12} color={colors.red} />
                    <Text className="text-[10px] font-bold" style={{ color: colors.red }}>needs help</Text>
                  </View>
                )}
                <View className="flex-row items-center gap-1 rounded-full px-2.5 py-1" style={{ backgroundColor: r.present ? "#E7F4DC" : surface.cardAlt }}>
                  <Ionicons name={r.present ? "checkmark-circle" : "ellipse-outline"} size={12} color={r.present ? colors.greenDark : colors.inkSoft} />
                  <Text className="text-[10px] font-bold" style={{ color: r.present ? colors.greenDark : colors.inkSoft }}>{r.present ? "present" : "absent"}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.inkSoft} />
              </View>
            </Pressable>
          ))}
        </View>

        <Text className="mt-3 px-1 text-[11px]" style={{ color: colors.inkSoft }}>
          {endpoint ? `Sync server: ${endpoint}` : "No sync server configured — records are kept safely on this tablet."}
          {lastSync ? ` · Last sync ${new Date(lastSync).toLocaleString()}` : ""}
        </Text>
      </ScrollView>

      {/* sync settings */}
      <Modal visible={showSync} transparent animationType="fade" onRequestClose={() => setShowSync(false)}>
        <View className="flex-1 items-center justify-center p-6" style={{ backgroundColor: "rgba(30,30,50,0.45)" }}>
          <View className="w-full rounded-3xl bg-white p-5" style={{ maxWidth: 420 }}>
            <Text className="text-[16px] font-black" style={{ color: colors.ink }}>Sync server</Text>
            <Text className="mb-3 mt-1 text-[12px]" style={{ color: colors.inkSoft }}>
              Records are uploaded as an append-only log. Nothing is deleted from this tablet until the server confirms it.
            </Text>
            <TextInput value={endpointDraft} onChangeText={setEndpointDraft} autoCapitalize="none" keyboardType="url"
              placeholder="https://example.org/events" placeholderTextColor={colors.inkSoft}
              className="rounded-2xl px-4 py-3" style={{ borderWidth: 1.5, borderColor: colors.line, color: colors.ink }} />
            <View className="mt-4 flex-row gap-3">
              <Pressable onPress={() => setShowSync(false)} className="flex-1 items-center rounded-2xl py-3" style={{ borderWidth: 1.5, borderColor: colors.line }}>
                <Text className="text-[13px] font-bold" style={{ color: colors.ink }}>Cancel</Text>
              </Pressable>
              <Pressable onPress={async () => { const v = endpointDraft.trim(); await setSyncEndpoint(v || null); setEndpoint(v || null); setShowSync(false); setSyncNote(null); }}
                className="flex-1 items-center rounded-2xl py-3" style={{ backgroundColor: colors.purple }}>
                <Text className="text-[13px] font-black text-white">Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* change PIN */}
      <Modal visible={showPin} transparent animationType="fade" onRequestClose={() => setShowPin(false)}>
        <View className="flex-1 items-center justify-center p-6" style={{ backgroundColor: "rgba(30,30,50,0.45)" }}>
          <View className="w-full rounded-3xl bg-white p-5" style={{ maxWidth: 380 }}>
            <Text className="text-[16px] font-black" style={{ color: colors.ink }}>Change facilitator PIN</Text>
            <Text className="mb-3 mt-1 text-[12px]" style={{ color: colors.inkSoft }}>Four digits. Keep it away from the children.</Text>
            <TextInput value={newPin} onChangeText={(t) => setNewPin(t.replace(/\D/g, "").slice(0, 4))} keyboardType="number-pad" secureTextEntry maxLength={4}
              placeholder="New PIN" placeholderTextColor={colors.inkSoft}
              className="mb-2 rounded-2xl px-4 py-3" style={{ borderWidth: 1.5, borderColor: colors.line, color: colors.ink, letterSpacing: 6 }} />
            <TextInput value={confirmPin} onChangeText={(t) => setConfirmPin(t.replace(/\D/g, "").slice(0, 4))} keyboardType="number-pad" secureTextEntry maxLength={4}
              placeholder="Repeat PIN" placeholderTextColor={colors.inkSoft}
              className="rounded-2xl px-4 py-3" style={{ borderWidth: 1.5, borderColor: colors.line, color: colors.ink, letterSpacing: 6 }} />
            {pinNote && <Text className="mt-2 text-[12px] font-bold" style={{ color: colors.red }}>{pinNote}</Text>}
            <View className="mt-4 flex-row gap-3">
              <Pressable onPress={() => { setShowPin(false); setPinNote(null); setNewPin(""); setConfirmPin(""); }} className="flex-1 items-center rounded-2xl py-3" style={{ borderWidth: 1.5, borderColor: colors.line }}>
                <Text className="text-[13px] font-bold" style={{ color: colors.ink }}>Cancel</Text>
              </Pressable>
              <Pressable onPress={savePin} className="flex-1 items-center rounded-2xl py-3" style={{ backgroundColor: colors.green }}>
                <Text className="text-[13px] font-black text-white">Save PIN</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
