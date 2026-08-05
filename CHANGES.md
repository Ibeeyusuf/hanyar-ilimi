# Fixes applied

## Blocking

**The app did not build.** `lib/feedback.ts` called
`require("@/assets/sounds/tap.mp3")` for four files that were not in the
repository. The `try/catch` around them could not help: Metro resolves
`require()` at bundle time, so a missing asset is a build failure, not a
runtime no-op. The four cues are now synthesised from pure tones (no
third-party licence), shipped as WAV, and regenerable with
`tools/gen_sounds.py`.

**`expo lint` failed on every run.** ESLint 9 needs a flat config and there
wasn't one. Added `eslint.config.js`; the project now lints clean.

## Correctness

**The quiz never graded anything.** `finishAndSave` passed a hardcoded
`score = 1` to `completeLesson`, so every lesson awarded three stars whatever
the child answered, and `failStreak` / `needsHelp` — and therefore the
facilitator dashboard's "needs help" column — could never fire. Scoring is now
built from the child's *first* answer on each markable step. Writing and
tracing are explicitly not marked: the app cannot judge a traced letter or a
free-typed sentence, and inventing a number for them would put fiction into a
child's record.

**Wrong answers had no consequence anywhere.** On the teaching screen any tap
unlocked "NA GABA" with no signal about correctness. Both the teaching screen
and the quiz now confirm the right answer before moving on — no dead ends, but
no advancing on a wrong tap either.

**Two competing sources of progress.** Module cards read a `progress` number
hardcoded in `content.ts`, so a brand-new child was shown "GRAMMAR 75%", and
the lesson rail read static `done`/`locked` flags that contradicted the module
screen beside it. The fabricated fields are deleted; `getModuleStates()` in
`lib/data/lessonState.ts` derives percentage, stars and lock state from
recorded progress, and every screen reads from it.

**Placement repeated forever.** A child was sent to the placement game
whenever they had no lesson progress — but placement writes an assessment, not
progress, so a child who was placed and had not yet finished a lesson was
re-placed on every single login. It now checks `hasBaseline()`.

**Log Out on the Settings screen did not log out.** It called
`router.replace` without clearing the session, so on a shared tablet the next
child's work was recorded against the previous one. (The sidebar version was
correct; the two now match.)

**Settings toggles did not persist.** Sound was held in component state and
came back on the next visit. Preferences now live in `lib/settings.ts` and are
re-applied on boot.

**Confetti re-randomised on every render** while the animation was started
once, so a piece's motion and its stored parameters could disagree. Frozen
with `useMemo`.

**`DriftingClouds` accepted a `delay` prop and ignored it**, so all three
clouds started drifting on the same frame. Now applied with `withDelay`.

## Honesty

- The dashboard chip always read "Offline — will sync" while
  `getUnsyncedEvents` / `markSynced` were never called by anything.
  `lib/data/sync.ts` implements the flush: batched POSTs, marked synced only
  after the server acknowledges each batch. With no server configured it
  reports the real backlog instead of claiming everything is fine.
- The lesson rail showed a fixed score of "2 / 5" and a countdown timer that
  did nothing at zero. It now shows the child's real first-try score, and the
  clock counts **up** — a countdown puts a struggling child under time
  pressure in an app whose whole premise is that there are no fail states.
- The module screen had a pager with five fixed dots and a "GABA" button with
  no handler. Replaced with a real completion count.
- Settings linked to "Profile Information", "Account & Security" and
  "Parental Controls", none of which existed. Replaced with rows that go
  somewhere real, plus a working narration toggle.
- The "Saurari" (listen) button in the hint card did nothing. It speaks now.

## Security

- Child passcodes and the facilitator PIN were plain text in AsyncStorage.
  Both moved to the device keychain/keystore via `expo-secure-store`
  (`lib/data/secure.ts`). They are encrypted rather than hashed deliberately:
  FR-3.3 requires a facilitator to re-show a child their own pictures, which a
  one-way hash would make impossible.
- The PIN screen advertised "demo: 1234" permanently. It now says so only
  while the PIN really is the default, and the dashboard and Settings both nag
  until it is changed. Added a Change PIN flow.

## Content

- Every one of the thirty numeracy lessons asked the child to count the same
  four mangoes and answer the same 2 + 1. Questions are now derived from the
  lesson id, so each lesson differs — deterministically, so returning to a
  lesson gives the same question rather than a fresh random one.
- The tracing step always traced the word "Sannu" regardless of the lesson.
  It traces the lesson's own word now.
- `avatarSet` held five faces for six seeded children, so two children shared
  a portrait on the "who are you?" screen. `avatar6.png` was sitting unused in
  the repo; it is now included.
- `Mascot` accepted a `pose` prop and ignored it. Poses now map to the
  artwork that ships with the app.

## Tidying

- Deleted `components/KidsScene.tsx` and `components/ui/BigButton.tsx`
  (unreferenced), and the unused `AVATARS` table and `getLessonProgress`.
- `hasBaseline`, `getOverallSummary` and `resetPasscode` were dead; each is
  now wired to the thing it was written for.
- The `visual → artwork` table was duplicated in the lesson and quiz screens,
  so a new illustration had to be registered twice. Centralised as
  `artForVisual()`.
- The identical `StepRail` component was copy-pasted into both auth screens.
- Wrote a real README (the old one was a UTF-16 stub).

## Verification

`npx tsc --noEmit` and `npx eslint .` both pass clean, and
`npx expo export --platform web` builds the full route graph, which confirms
every `require()`d asset resolves.

---

# Second pass

## Content

**79 of the 90 lessons were not teaching anything.** Only 11 had a written
card; the rest fell through to a generated question built from *sibling lesson
titles* — "Wanne ne 'Tsabtar Ƙafa'?" with two other lesson names as the wrong
answers. It renders, it is answerable, and a child can pass it without knowing
any of the material. All 90 lessons now have a hand-written card: the word
being taught, an illustration, a Hausa prompt with a blank, a hint, and three
real answers.

The generated fallback is kept, but only as a safety net for a lesson id added
before its card is written. `npm run check:content` fails if any lesson is
relying on it, and also catches cards with the wrong number of answers,
duplicate or placeholder answers, a missing blank, or a missing hint. That
check exists because this specific failure is invisible in the running app —
nothing looks broken, so nobody notices until a child has been through it.

Four illustrations (`ball`, `clock`, `globe`, `tree`) were sitting unused in
`assets/images/objects/`; they are registered now, and the shape-matching
lesson that talks about a ball shows one.

## Enrolment photos

The "who are you?" screen is the entire login mechanism, and it was showing
stock avatars — fine for six seeded children whose drawn faces happen to differ,
useless for a real class of twenty. Enrolment now starts with the camera.

- `lib/photos.ts` handles capture, permissions, and storage. The picker writes
  into the **cache** directory, which Android empties when storage runs low; a
  portrait that vanishes takes a child's login with it, so the file is copied
  into the document directory before the path is recorded.
- Photographs of children's faces stay on the device: they are not in the event
  log, so `syncNow()` cannot upload them; they are not in the report PDF; and
  `removeChild` now deletes the file rather than just dropping the reference.
- The photo step can be skipped — a missing portrait should not block an
  enrolment — and the fallback avatar is chosen by hashing the child's ID
  rather than by roster position, which shifts for everyone below a child who
  is removed.
- Portraits now appear on the login picker, top bar, profile, dashboard and
  report, all through one `ChildPortrait` component.

## Reports

There was no way to get anything out of the app. `lib/report.ts` builds a group
report — attendance, session days, lessons completed, stars, mastery, placement
level, needs-help flags — over 7 days, 30 days or since enrolment, and
`/facilitator/report` prints it or saves it as a PDF.

The screen and the PDF render from the same object, so there is only one set of
numbers. Two deliberate refusals: the report does not estimate month-6 or
month-12 change when no follow-up assessment has been recorded, it says none
exists; and it states how many records are still waiting to upload, so a
central total that disagrees with it can be explained rather than argued about.
The print stylesheet carries no meaning in colour, because these get
photocopied.

## Dependencies

Eleven packages were declared and never imported: `expo-clipboard`,
`expo-device`, `expo-linear-gradient`, `expo-local-authentication`,
`expo-media-library`, `expo-notifications`, `expo-symbols`, `expo-web-browser`,
`react-native-view-shot`, `react-native-webview`, and
`@react-navigation/bottom-tabs`. Removed — this is APK weight on tablets that
are storage-constrained by definition.

Kept despite showing up as unreferenced, because they are reached through
config or as peers rather than by import: `expo-updates` (app.json enables OTA),
`expo-constants` / `expo-linking` / `@react-navigation/native` /
`@react-navigation/elements` / `react-native-screens` (expo-router),
`react-dom` / `react-native-web` (the web export used as a build check), and
`expo-system-ui`.

Added: `expo-file-system` (pinned to `~19.0.23`, the version SDK 54 pairs with)
for permanent portrait storage. `expo-image-picker`, `expo-print` and
`expo-sharing` were already declared and are now actually used.

## Verification

`npx tsc --noEmit`, `npx eslint .` and `npm run check:content` all pass, and
`npx expo export --platform web` builds the full route graph — 23 routes
including the new `/facilitator/report` — which confirms every `require()`d
asset still resolves after the dependency removal.

---

# Third pass

## A promise the app did not keep

The enrolment screen added in the last pass told facilitators "you can add a
real one later" about a skipped photo. There was nowhere to do it — and
`removeChild` and `resetPasscode` had been written, wired to nothing, and left
that way through two passes.

`app/facilitator/child/[childId].tsx` is the record that makes the sentence
true. Dashboard rows open it. From there a facilitator can correct a name
spelled wrong on a busy morning, an age guessed and later confirmed, a portrait
taken against a window, and — the only one of these that actually locks a child
out of the app — a set of secret pictures the child cannot remember. Removal
deletes the profile, photo and passcode but leaves the completed work in the
record, so group totals do not silently drop when a child leaves.

One subtlety worth knowing about: a retaken portrait is written to the same
path, so React Native's image cache keeps showing the old face. The stored URI
carries a cache-busting suffix in state to force the reload.

## Tests

There were none, on a codebase whose star, unlock and mastery rules are exactly
what a funder is shown.

The obstacle was that those rules were inlined among AsyncStorage calls, so
testing them meant standing up a React Native runtime. They are now extracted
into `lib/data/rules.ts` as pure functions — pass mark, stars, attempt merging,
mastery counters, lesson and module locks — with `progress.ts` and
`lessonState.ts` reduced to persistence around them. Behaviour is unchanged;
there is now one place a threshold lives and one place to read to find out what
it is.

`npm test` compiles that one file with the project's own TypeScript and runs
`node --test` against it. No Jest, no react-native preset, no new dependency to
keep in step with the Expo SDK. 23 tests cover the cases that matter:

- a completed attempt always earns a star, because there are no fail states
- a **worse retry never takes stars away** — the rule most likely to be broken
  by a well-meaning refactor, and the one a child would feel
- completion is stamped once and neither moved by a later pass nor cleared by a
  later failure
- the needs-help flag raises on *consecutive* failures, and alternating
  pass/fail never raises it
- a pass clears the flag without a facilitator dismissing it
- the first lesson is always open; passing one opens exactly the next
- a module opens after one lesson of the previous module, not the whole module
- hygiene is open throughout
- percentages answer 0 for nothing attempted rather than dividing by zero

I checked the suite can actually fail: replacing `Math.max(previous.stars, …)`
with the new score makes exactly one test fail, the retry one. A gate that
cannot fail is not a gate.

One behaviour change fell out of the extraction. `updateMastery` previously
logged a `flag` event on *every* failed attempt once the streak was reached, so
a struggling child generated a fresh flag each time. It now fires only on the
transition into the flagged state.

## Verification

`npx tsc --noEmit`, `npx eslint .`, `npm test` and `npm run check:content` all
pass, and `npx expo export --platform web` builds 24 routes including
`/facilitator/child/[childId]`.

---

# Fourth pass — Hausa audio (YarnGPT)

You were right: nothing in the app was speaking Hausa. Every line went through
`expo-speech`, and almost no Android tablet ships a Hausa voice, so the engine
fell back to an English one reading Hausa words with English phonology. For a
child learning to decode words that is not a degraded experience — it is
teaching the wrong pronunciation, in the one part of the app that *is* the
lesson.

## The architectural decision

YarnGPT-local is a 0.4B-parameter transformer (a SmolLM2-360M finetune) with a
WavTokenizer decoder. It needs a GPU. The tablets this app targets are low-end
Android devices whose first requirement (FR-5.1) is working with no connection
at all.

So it is **not** called at runtime and does not ship in the app. It runs once
on a GPU machine and the output is bundled — which is what the PRD always
described as "the recorded Hausa audio library", and means narration costs a
file read instead of a network round trip a rural classroom cannot make.

## What was built

- **`constants/phrases.ts`** — every fixed Hausa line, in one place. They were
  string literals scattered across screens, which meant the app's speech could
  not be enumerated, which meant no clip could be generated for it.
- **`tools/extract_strings.mjs`** → `assets/audio/manifest.json`. **558 lines**:
  every lesson's word, prompt, hint and three options, plus screen
  instructions, Hausa number words and every addition the numeracy quiz can
  generate. Ids are `sha1(normalised text)`, so one sentence used twice shares
  a clip, and editing a lesson orphans its old recording loudly instead of
  playing it against new text.
- **`tools/generate_audio.py`** — the YarnGPT-local run. Resumable, per-line
  failures do not lose the batch, and every clip is slowed via `atempo`
  (the model card notes output "is sometimes very fast"), normalised, silence-
  trimmed and encoded to 48k mono AAC.
- **`tools/build_clip_registry.mjs`** → `constants/audioClips.ts`. Metro
  resolves `require()` at build time, so the registry has to be generated from
  the files actually on disk.
- **`lib/speech.ts`** rewritten: recording first, device voice only so a line
  is not silent.

## Details that will bite otherwise

- **The child's name is no longer spoken.** The home screen said
  `Sannu ${name}. …`. A Hausa name read by an English engine is worse than not
  saying it, and a name can never have a recording. The greeting is now a fixed
  line; the name is on screen where it always was.
- **Numerals are spoken as words.** The numeracy quiz called `speak("3")`,
  which a device voice reads as the English "three". A child counting in Hausa
  has to hear "uku".
- **Normalisation parity is now tested.** If the app's normalisation drifts
  from the extractor's, *every* lookup misses and narration silently reverts to
  English with nothing on screen to say so. `lib/clipKey.ts` holds it, has no
  imports at all — TypeScript does not rewrite the `@/` alias on emit — and 8
  new tests check it, including that Hausa hooked letters (ɓ ɗ ƙ ƴ) survive and
  that `ƙasa` and `kasa` never collapse onto one clip.
- **Settings reports coverage honestly** — "Hausa narration: 41% recorded",
  with what the remaining lines actually sound like on this tablet — rather
  than the old binary "Hausa voice available".

## Two things needing a human, not a commit

1. **Licence.** YarnGPT-local is CC BY-NC-SA 4.0. Non-commercial is probably
   fine for donor-funded distribution and definitely not fine if the app is
   ever sold or bundled with a paid device; whether generated audio inherits
   share-alike is genuinely unsettled. Decide before shipping. YarnGPT was also
   acquired by Bluechip Technologies in June 2026, so check the current terms.
   The pipeline works identically on recordings by a human Hausa speaker.
2. **Tone.** The model card states it "doesn't take intonations into account".
   Hausa is tonal. `--review` writes a checklist; no clip should reach a child
   before a Hausa speaker has heard it.

## Verification

The pipeline was proved end to end here without a GPU: stand-in clips were
generated with ffmpeg, keyed, bundled, and confirmed present in the web export
at `dist/assets/assets/audio/ha/`. Orphan detection was confirmed by feeding it
mismatched filenames. The stand-ins were then deleted — they were sine tones,
and shipping them would be worse than shipping nothing.

`tsc`, `eslint`, `npm test` (31 tests) and `npm run check:content` all pass;
`expo export --platform web` builds 24 routes. `constants/audioClips.ts`
currently reports **0 of 558** recorded, which is the honest state until
someone runs the generator on a GPU.
