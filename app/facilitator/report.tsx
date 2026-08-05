import { useCallback, useState } from "react";
import { View, Text, Pressable, ScrollView, Platform, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { colors } from "@/constants/theme";
import { elevation, surface } from "@/constants/ui";
import SceneBackdrop from "@/components/SceneBackdrop";
import ChildPortrait from "@/components/ChildPortrait";
import { feedback } from "@/lib/feedback";
import { buildReport, reportHtml, PERIOD_LABEL, type Report, type ReportPeriod } from "@/lib/report";

/**
 * Group report (PRD §9).
 *
 * The screen and the printed document are generated from the same `Report`
 * object, so what a facilitator reads here is exactly what a funder receives —
 * there is no second, prettier set of numbers.
 */
export default function ReportScreen() {
  // Three metric cards across leaves about 108px each on a phone, which
  // clips the longer labels. Two across below 600px, three above.
  const { width } = useWindowDimensions();
  const metricWidth = width < 600 ? "47%" : "31%";

  const [period, setPeriod] = useState<ReportPeriod>("30");
  const [report, setReport] = useState<Report | null>(null);
  const [busy, setBusy] = useState<null | "pdf" | "print">(null);
  const [note, setNote] = useState<string | null>(null);

  useFocusEffect(useCallback(() => {
    let alive = true;
    buildReport(period).then((r) => { if (alive) setReport(r); });
    return () => { alive = false; };
  }, [period]));

  const sharePdf = async () => {
    if (!report || busy) return;
    feedback.tap();
    setBusy("pdf");
    setNote(null);
    try {
      const { uri } = await Print.printToFileAsync({ html: reportHtml(report) });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: "application/pdf", dialogTitle: "Group report", UTI: "com.adobe.pdf" });
      } else {
        setNote(`Saved to ${uri}. This tablet has no app to share it with — copy it off over USB.`);
      }
    } catch {
      setNote("The PDF could not be created. Try again, or use Print.");
    } finally {
      setBusy(null);
    }
  };

  const print = async () => {
    if (!report || busy) return;
    feedback.tap();
    setBusy("print");
    setNote(null);
    try {
      await Print.printAsync({ html: reportHtml(report) });
    } catch {
      setNote("No printer was reachable. Save a PDF instead and print it elsewhere.");
    } finally {
      setBusy(null);
    }
  };

  const t = report?.totals;

  return (
    <View className="flex-1" style={{ backgroundColor: colors.skyMid }}>
      <SceneBackdrop />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View className="mb-4 flex-row items-center gap-3">
          <Pressable onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-full bg-white" style={{ borderWidth: 1, borderColor: surface.border, ...elevation.xs }}>
            <Ionicons name="arrow-back" size={19} color={colors.ink} />
          </Pressable>
          <View className="flex-1">
            <Text className="text-[19px] font-black" style={{ color: colors.ink }}>Group report</Text>
            <Text className="text-[11.5px]" style={{ color: colors.inkSoft }}>
              {report ? `${report.deviceName} · generated ${new Date(report.generatedAt).toLocaleDateString()}` : "Building…"}
            </Text>
          </View>
        </View>

        {/* period */}
        <View className="mb-4 flex-row gap-2">
          {(["7", "30", "all"] as ReportPeriod[]).map((p) => {
            const on = period === p;
            return (
              <Pressable key={p} onPress={() => { feedback.tap(); setPeriod(p); setReport(null); }}
                className="flex-1 items-center rounded-2xl py-2.5"
                style={{ backgroundColor: on ? colors.purple : "#fff", borderWidth: 1, borderColor: on ? colors.purple : surface.border }}>
                <Text className="text-[12px] font-bold" style={{ color: on ? "#fff" : colors.ink }}>{PERIOD_LABEL[p]}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* export */}
        <View className="mb-4 flex-row gap-3">
          <Pressable onPress={sharePdf} disabled={!report || !!busy} className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl py-3.5"
            style={{ backgroundColor: report && !busy ? colors.purple : colors.line, ...elevation.xs }}>
            <Ionicons name="document-text" size={17} color={report && !busy ? "#fff" : colors.inkSoft} />
            <Text className="text-[13px] font-black" style={{ color: report && !busy ? "#fff" : colors.inkSoft }}>
              {busy === "pdf" ? "Preparing…" : "Save as PDF"}
            </Text>
          </Pressable>
          {Platform.OS !== "web" && (
            <Pressable onPress={print} disabled={!report || !!busy} className="flex-row items-center justify-center gap-2 rounded-2xl px-5 py-3.5"
              style={{ backgroundColor: "#fff", borderWidth: 1, borderColor: surface.border, ...elevation.xs }}>
              <Ionicons name="print-outline" size={17} color={colors.ink} />
              <Text className="text-[13px] font-bold" style={{ color: colors.ink }}>{busy === "print" ? "Sending…" : "Print"}</Text>
            </Pressable>
          )}
        </View>

        {note && (
          <View className="mb-4 flex-row items-start gap-2 rounded-2xl px-4 py-3" style={{ backgroundColor: "#FFF6E5", borderWidth: 1, borderColor: "#F0D9A8" }}>
            <Ionicons name="information-circle" size={16} color={colors.goldDark} />
            <Text className="flex-1 text-[12px]" style={{ color: colors.ink }}>{note}</Text>
          </View>
        )}

        {!report && (
          <Text className="p-6 text-center text-[13px]" style={{ color: colors.inkSoft }}>Counting the records…</Text>
        )}

        {report && t && (
          <>
            {/* headline numbers */}
            <View className="mb-4 flex-row flex-wrap gap-3">
              {[
                { label: "ENROLLED", value: `${t.enrolled}`, color: colors.purple, icon: "people" as const },
                { label: "ATTENDED", value: `${t.activeInPeriod}`, color: colors.green, icon: "checkmark-done" as const },
                { label: "SESSION DAYS", value: `${t.sessionDays}`, color: colors.blue, icon: "calendar" as const },
                { label: "LESSONS", value: `${t.lessonsCompleted}`, color: colors.gold, icon: "book" as const },
                { label: "AVG MASTERY", value: t.averageMastery === null ? "—" : `${t.averageMastery}%`, color: colors.purple, icon: "trending-up" as const },
                { label: "NEEDS HELP", value: `${t.flagged}`, color: t.flagged ? colors.red : colors.inkSoft, icon: "alert-circle" as const },
              ].map((m) => (
                <View key={m.label} className="overflow-hidden rounded-2xl bg-white" style={{ width: metricWidth, borderWidth: 1, borderColor: surface.border, ...elevation.sm }}>
                  <View style={{ height: 3, backgroundColor: m.color }} />
                  <View className="p-3">
                    <View className="mb-1 flex-row items-center justify-between">
                      <Text className="text-[9.5px] font-black tracking-wider" style={{ color: colors.inkSoft }}>{m.label}</Text>
                      <Ionicons name={m.icon} size={13} color={m.color} />
                    </View>
                    <Text className="text-[22px] font-black" style={{ color: m.color }}>{m.value}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* per child */}
            <View className="overflow-hidden rounded-2xl bg-white" style={{ borderWidth: 1, borderColor: surface.border, ...elevation.sm }}>
              <View className="px-4 py-2.5" style={{ backgroundColor: surface.cardAlt, borderBottomWidth: 1, borderBottomColor: surface.border }}>
                <Text className="text-[10.5px] font-black tracking-wider" style={{ color: colors.inkSoft }}>BY CHILD</Text>
              </View>
              {report.children.length === 0 && (
                <Text className="p-5 text-center text-[13px]" style={{ color: colors.inkSoft }}>No children are enrolled on this tablet yet.</Text>
              )}
              {report.children.map((c, i) => (
                <View key={c.child.id} className="px-4 py-3" style={{ borderTopWidth: i === 0 ? 0 : 1, borderTopColor: surface.border }}>
                  <View className="flex-row items-center gap-3">
                    <ChildPortrait child={c.child} size={40} />
                    <View className="flex-1">
                      <Text className="text-[14px] font-bold" style={{ color: colors.ink }}>{c.child.name}</Text>
                      <Text className="text-[11px]" style={{ color: colors.inkSoft }}>
                        {c.ageYears ? `age ~${c.ageYears}` : "age not recorded"} · start level {c.baseline ?? "not placed"}
                      </Text>
                    </View>
                    {c.needsHelp.length > 0 && (
                      <View className="flex-row items-center gap-1 rounded-full px-2.5 py-1" style={{ backgroundColor: "#FCEBEA" }}>
                        <Ionicons name="alert-circle" size={12} color={colors.red} />
                        <Text className="text-[10px] font-bold" style={{ color: colors.red }}>needs help</Text>
                      </View>
                    )}
                  </View>
                  <View className="mt-2 flex-row flex-wrap gap-x-5 gap-y-1">
                    {[
                      ["Days", `${c.daysAttended}`],
                      ["Lessons", `${c.lessonsCompleted}`],
                      ["Stars", `${c.stars}`],
                      ["Mastery", c.mastery === null ? "not attempted" : `${c.mastery}%`],
                      ["Last seen", c.lastSeen ? new Date(c.lastSeen).toLocaleDateString() : "not in this period"],
                    ].map(([k, v]) => (
                      <Text key={k} className="text-[11.5px]" style={{ color: colors.inkSoft }}>
                        {k} <Text className="font-bold" style={{ color: colors.ink }}>{v}</Text>
                      </Text>
                    ))}
                  </View>
                  <View className="mt-1.5 flex-row flex-wrap gap-x-4">
                    {c.bySubject.map((s) => (
                      <Text key={s.id} className="text-[11px]" style={{ color: colors.inkSoft }}>
                        {s.en[0] + s.en.slice(1).toLowerCase()} {s.done}/{s.total}
                      </Text>
                    ))}
                  </View>
                </View>
              ))}
            </View>

            {/* where the numbers come from */}
            <View className="mt-4 rounded-2xl bg-white p-4" style={{ borderWidth: 1, borderColor: surface.border }}>
              <Text className="mb-1 text-[10.5px] font-black tracking-wider" style={{ color: colors.inkSoft }}>WHERE THESE NUMBERS COME FROM</Text>
              <Text className="text-[11.5px]" style={{ color: colors.ink }}>
                Counted from this tablet’s own record of what children did — {report.provenance.events} entries.
                {report.provenance.pendingSync > 0
                  ? ` ${report.provenance.pendingSync} have not been uploaded yet, so a central total may currently be lower than this one.`
                  : " All entries have been uploaded."}
              </Text>
              <Text className="mt-1.5 text-[11.5px]" style={{ color: colors.inkSoft }}>
                {report.children.some((c) => c.followUps.length > 0)
                  ? "Follow-up assessments are included in each child’s record."
                  : "No month-6 or month-12 assessment has been recorded yet, so change against baseline cannot be reported."}
                {" "}Names and photographs stay on this tablet and are not included in the PDF.
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
