/**
 * Child portraits (PRD S2, §7).
 *
 * The "who are you?" screen is the whole identity mechanism in this app — a
 * child who cannot read finds themselves by face. Stock avatars only work
 * while the roster is small and the faces happen to look different from each
 * other; with a real class of twenty they stop being identifying at all. So a
 * portrait is taken at enrolment.
 *
 * Two things matter about where the file goes:
 *
 *  1. ImagePicker writes into the CACHE directory, which Android is free to
 *     empty when storage runs low. A portrait that vanishes takes a child's
 *     login with it, so the file is copied into the document directory, which
 *     the system does not reclaim.
 *
 *  2. The photo is of a child's face. It never leaves the device: it is not in
 *     the event log, so `syncNow()` cannot upload it, and `Child.photoUri` is
 *     a local `file://` path that would be meaningless on a server anyway.
 *     Deleting the child deletes the file (see `removeChild`).
 *
 * On web there is no document directory to copy into and the picker returns a
 * blob URL, so the URL is used directly and does not survive a reload — the
 * same "web is a development target only" caveat that applies to secure.ts.
 */
import { Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Directory, File, Paths } from "expo-file-system";

const web = Platform.OS === "web";
const FOLDER = "portraits";

export type PickOutcome =
  | { ok: true; uri: string }
  | { ok: false; reason: "cancelled" | "no-camera-permission" | "no-library-permission" | "failed" };

const PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ["images"],
  // A square crop the facilitator confirms — a portrait that is mostly wall
  // is not recognisable at the 96px the login screen renders it at.
  allowsEditing: true,
  aspect: [1, 1],
  // Small on purpose. These are 96px avatars on a low-end tablet; a 4MP
  // original costs storage and decode time for no visible gain.
  quality: 0.6,
};

/** Take a new portrait with the camera. */
export async function capturePortrait(): Promise<PickOutcome> {
  // The web picker has no real camera flow, so fall back to a file chooser.
  if (web) return choosePortrait();
  try {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return { ok: false, reason: "no-camera-permission" };
    const res = await ImagePicker.launchCameraAsync(PICKER_OPTIONS);
    if (res.canceled || !res.assets?.length) return { ok: false, reason: "cancelled" };
    return { ok: true, uri: res.assets[0].uri };
  } catch {
    return { ok: false, reason: "failed" };
  }
}

/** Choose an existing photo instead — useful when the camera is unavailable. */
export async function choosePortrait(): Promise<PickOutcome> {
  try {
    if (!web) {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) return { ok: false, reason: "no-library-permission" };
    }
    const res = await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS);
    if (res.canceled || !res.assets?.length) return { ok: false, reason: "cancelled" };
    return { ok: true, uri: res.assets[0].uri };
  } catch {
    return { ok: false, reason: "failed" };
  }
}

function portraitsDir(): Directory {
  const dir = new Directory(Paths.document, FOLDER);
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
  return dir;
}

/**
 * Copy a just-picked photo out of the cache and into permanent storage,
 * returning the URI to record on the child. Safe to call repeatedly: an
 * existing portrait for the same child is replaced.
 */
export async function savePortrait(childId: string, sourceUri: string): Promise<string | null> {
  if (web) return sourceUri;
  try {
    const target = new File(portraitsDir(), `${childId}.jpg`);
    if (target.exists) target.delete();
    new File(sourceUri).copy(target);
    return target.uri;
  } catch {
    // A portrait is a nice-to-have, not a reason to fail an enrolment.
    return null;
  }
}

/** Remove a child's portrait from disk. Called when the child is removed. */
export async function deletePortrait(childId: string): Promise<void> {
  if (web) return;
  try {
    const target = new File(portraitsDir(), `${childId}.jpg`);
    if (target.exists) target.delete();
  } catch {}
}

/** Human-readable explanation for a failed pick, shown to the facilitator. */
export function explainPickFailure(reason: Exclude<PickOutcome, { ok: true }>["reason"]): string | null {
  switch (reason) {
    case "cancelled":
      return null; // the facilitator backed out on purpose; say nothing
    case "no-camera-permission":
      return "This tablet has not granted camera access. Enable it in Settings, or choose a photo instead.";
    case "no-library-permission":
      return "This tablet has not granted photo access. Enable it in Settings to choose a photo.";
    default:
      return "The photo could not be taken. Try again, or continue without one.";
  }
}
