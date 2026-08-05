/**
 * Facilitator reporting (PRD §9, §10).
 *
 * A facilitator has to account for a group to whoever funds it, usually from a
 * tablet with no connection and no printer in the room. This module turns the
 * on-device record into a report they can read on screen, print, or hand off
 * as a PDF.
 *
 * The one rule this file exists to enforce: every number is derived from a
 * recorded event or a stored progress row. Where a figure does not exist —
 * most importantly the month-6 and month-12 follow-up assessments, which no
 * child will have until those months arrive — the report says so rather than
 * estimating, extrapolating or quietly omitting the column. A report that
 * invents a trend is worse than no report, because someone will act on it.
 */
import { SUBJECTS } from "@/constants/content";
import {
  getChildren, getDevice, getEvents, getProgress, getMastery, getAssessments,
  getSubjectSummary, pendingCount, getLastSyncAt,
  type Child, type Assessment,
} from "@/lib/data";

export type ReportPeriod = "7" | "30" | "all";

export const PERIOD_LABEL: Record<ReportPeriod, string> = {
  "7": "Last 7 days",
  "30": "Last 30 days",
  all: "Since enrolment",
};

export type ChildRow = {
  child: Child;
  ageYears: number | null;
  daysAttended: number;
  lastSeen: number | null;
  lessonsCompleted: number;
  stars: number;
  mastery: number | null;      // null when the child has attempted nothing
  baseline: number | null;     // placement level, if a baseline was recorded
  followUps: Assessment[];     // month-6 / month-12, usually empty
  needsHelp: string[];
  bySubject: { id: string; en: string; done: number; total: number }[];
};

export type Report = {
  generatedAt: number;
  period: ReportPeriod;
  periodStart: number | null;  // null for "all"
  deviceName: string;
  appVersion: string;
  contentVersion: string;
  children: ChildRow[];
  totals: {
    enrolled: number;
    activeInPeriod: number;
    lessonsCompleted: number;
    stars: number;
    averageMastery: number | null;
    flagged: number;
    sessionDays: number;
  };
  provenance: {
    events: number;
    pendingSync: number;
    lastSyncAt: number | null;
  };
};

function startOf(period: ReportPeriod): number | null {
  if (period === "all") return null;
  const days = Number(period);
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime() - (days - 1) * 86_400_000;
}

export async function buildReport(period: ReportPeriod = "30"): Promise<Report> {
  const periodStart = startOf(period);
  const inPeriod = (ts: number) => periodStart === null || ts >= periodStart;

  const [children, device, events] = await Promise.all([getChildren(), getDevice(), getEvents()]);

  const rows: ChildRow[] = [];
  const allDays = new Set<string>();

  for (const child of children) {
    const logins = events.filter((e) => e.type === "login" && e.childId === child.id && inPeriod(e.ts));
    const days = new Set(logins.map((e) => new Date(e.ts).toDateString()));
    days.forEach((d) => allDays.add(d));

    const progress = await getProgress(child.id);
    const completed = progress.filter((p) => p.completedAt && inPeriod(p.completedAt));

    const mastery = await getMastery(child.id);
    const correct = mastery.reduce((a, m) => a + m.correct, 0);
    const attempts = mastery.reduce((a, m) => a + m.total, 0);

    const assessments = await getAssessments(child.id);
    const baselines = assessments.filter((a) => a.kind === "baseline");

    const bySubject: ChildRow["bySubject"] = [];
    for (const s of SUBJECTS) {
      const sum = await getSubjectSummary(child.id, s.id);
      bySubject.push({ id: s.id, en: s.en, done: sum.done, total: sum.total });
    }

    rows.push({
      child,
      ageYears: child.dobEst ? new Date().getFullYear() - child.dobEst : null,
      daysAttended: days.size,
      lastSeen: logins.length ? Math.max(...logins.map((e) => e.ts)) : null,
      lessonsCompleted: completed.length,
      stars: progress.reduce((a, p) => a + p.stars, 0),
      mastery: attempts ? Math.round((correct / attempts) * 100) : null,
      // The placement game writes one baseline per strand; they share a level,
      // so the highest recorded value is the child's starting level.
      baseline: baselines.length ? Math.max(...baselines.map((a) => a.levelResult)) : null,
      followUps: assessments.filter((a) => a.kind !== "baseline"),
      needsHelp: mastery.filter((m) => m.needsHelp).map((m) => m.skillId),
      bySubject,
    });
  }

  const scored = rows.filter((r) => r.mastery !== null);

  return {
    generatedAt: Date.now(),
    period,
    periodStart,
    deviceName: device.name,
    appVersion: device.appVersion,
    contentVersion: device.contentVersion,
    children: rows,
    totals: {
      enrolled: rows.length,
      activeInPeriod: rows.filter((r) => r.daysAttended > 0).length,
      lessonsCompleted: rows.reduce((a, r) => a + r.lessonsCompleted, 0),
      stars: rows.reduce((a, r) => a + r.stars, 0),
      averageMastery: scored.length
        ? Math.round(scored.reduce((a, r) => a + (r.mastery ?? 0), 0) / scored.length)
        : null,
      flagged: rows.filter((r) => r.needsHelp.length > 0).length,
      sessionDays: allDays.size,
    },
    provenance: {
      events: events.length,
      pendingSync: await pendingCount(),
      lastSyncAt: await getLastSyncAt(),
    },
  };
}

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

const date = (ts: number) => new Date(ts).toLocaleDateString();

/**
 * Print-ready HTML. Deliberately plain: this is printed on whatever printer
 * an office has, often in black and white, and photocopied after that. No
 * background fills, no colour-carried meaning, no web fonts.
 *
 * Child portraits are not included. They are photographs of children's faces
 * and the whole point of keeping them on the device is that they do not end up
 * in a document that gets emailed onward.
 */
export function reportHtml(r: Report): string {
  const rows = r.children
    .map((c) => {
      const subjects = c.bySubject.map((s) => `${escapeHtml(s.en[0] + s.en.slice(1).toLowerCase())} ${s.done}/${s.total}`).join("<br/>");
      return `<tr>
        <td><strong>${escapeHtml(c.child.name)}</strong><br/><span class="muted">${c.ageYears ? `age ~${c.ageYears}` : "age not recorded"} · ${c.child.sex === "f" ? "girl" : "boy"}</span></td>
        <td class="num">${c.daysAttended}</td>
        <td class="num">${c.lessonsCompleted}</td>
        <td class="num">${c.stars}</td>
        <td class="num">${c.mastery === null ? "—" : `${c.mastery}%`}</td>
        <td class="num">${c.baseline ?? "—"}</td>
        <td>${subjects}</td>
        <td>${c.needsHelp.length ? `<strong>Yes</strong><br/><span class="muted">${escapeHtml(c.needsHelp.join(", "))}</span>` : "No"}</td>
      </tr>`;
    })
    .join("");

  const followUpsRecorded = r.children.some((c) => c.followUps.length > 0);

  return `<!doctype html>
<html><head><meta charset="utf-8"/><title>Hanyar Ilimi — group report</title>
<style>
  @page { margin: 16mm; }
  body { font-family: -apple-system, "Helvetica Neue", Helvetica, Arial, sans-serif; color: #1f2430; font-size: 11pt; line-height: 1.45; }
  h1 { font-size: 17pt; margin: 0 0 2pt; }
  h2 { font-size: 12pt; margin: 20pt 0 6pt; border-bottom: 1px solid #cfd3dd; padding-bottom: 3pt; }
  .muted { color: #6b7180; font-size: 9pt; }
  .meta { margin-bottom: 4pt; }
  table { width: 100%; border-collapse: collapse; margin-top: 6pt; }
  th, td { border: 1px solid #cfd3dd; padding: 5pt 6pt; text-align: left; vertical-align: top; font-size: 9.5pt; }
  th { background: #f2f3f7; font-size: 8.5pt; text-transform: uppercase; letter-spacing: .04em; }
  td.num, th.num { text-align: right; }
  .totals { display: flex; flex-wrap: wrap; gap: 6pt 22pt; margin-top: 6pt; }
  .totals div { min-width: 90pt; }
  .totals .v { font-size: 15pt; font-weight: 700; }
  .note { margin-top: 6pt; padding: 6pt 8pt; border-left: 3px solid #cfd3dd; font-size: 9pt; color: #4a505f; }
  tr { page-break-inside: avoid; }
</style></head>
<body>
  <h1>Hanyar Ilimi — group report</h1>
  <div class="meta muted">
    ${escapeHtml(r.deviceName)} · ${escapeHtml(PERIOD_LABEL[r.period])}${r.periodStart ? ` (from ${date(r.periodStart)})` : ""} · generated ${date(r.generatedAt)}
  </div>

  <h2>Summary</h2>
  <div class="totals">
    <div><div class="v">${r.totals.enrolled}</div><div class="muted">Children enrolled</div></div>
    <div><div class="v">${r.totals.activeInPeriod}</div><div class="muted">Attended in period</div></div>
    <div><div class="v">${r.totals.sessionDays}</div><div class="muted">Days with a session</div></div>
    <div><div class="v">${r.totals.lessonsCompleted}</div><div class="muted">Lessons completed</div></div>
    <div><div class="v">${r.totals.averageMastery === null ? "—" : `${r.totals.averageMastery}%`}</div><div class="muted">Average mastery</div></div>
    <div><div class="v">${r.totals.flagged}</div><div class="muted">Children needing help</div></div>
  </div>

  <h2>By child</h2>
  <table>
    <thead><tr>
      <th>Child</th><th class="num">Days</th><th class="num">Lessons</th><th class="num">Stars</th>
      <th class="num">Mastery</th><th class="num">Start level</th><th>Progress by subject</th><th>Needs help</th>
    </tr></thead>
    <tbody>${rows || `<tr><td colspan="8">No children enrolled on this tablet yet.</td></tr>`}</tbody>
  </table>

  <h2>Assessment</h2>
  <p class="muted">
    “Start level” is the result of the placement game a child plays at first login, recorded as their baseline.
    ${followUpsRecorded
      ? "Follow-up assessments recorded so far are included in the per-child records."
      : "No month-6 or month-12 follow-up assessment has been recorded on this tablet, so no change against baseline can be reported yet."}
  </p>

  <div class="note">
    Every figure above is counted from this tablet's own record of what children did — ${r.provenance.events} entries.
    ${r.provenance.pendingSync > 0
      ? `${r.provenance.pendingSync} of them have not yet been uploaded to a server, so a central total may currently be lower than this one.`
      : "All entries have been uploaded."}
    ${r.provenance.lastSyncAt ? ` Last upload ${date(r.provenance.lastSyncAt)}.` : ""}
    App ${escapeHtml(r.appVersion)} · content ${escapeHtml(r.contentVersion)}.
    Children's names and photographs stay on this tablet and are not part of any upload.
  </div>
</body></html>`;
}
