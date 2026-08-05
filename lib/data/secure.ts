/**
 * Encrypted-at-rest storage for the only two secrets on the device: each
 * child's picture passcode and the facilitator PIN (PRD §7).
 *
 * These are stored here rather than hashed because both must be RECOVERABLE:
 * FR-3.3 requires a facilitator to be able to re-show a child their own
 * pictures after the PIN check, which a one-way hash would make impossible.
 * The correct trade-off is therefore encrypted storage, not hashing.
 *
 * expo-secure-store is backed by the iOS keychain / Android keystore. It has
 * no web implementation, so on web we fall back to AsyncStorage and are
 * explicit that this is unencrypted — web is a development target only.
 */
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

const web = Platform.OS === "web";

/** SecureStore keys allow only [A-Za-z0-9._-], so ids are sanitised. */
function safeKey(key: string): string {
  return key.replace(/[^A-Za-z0-9._-]/g, "_");
}

export async function secureGet(key: string): Promise<string | null> {
  const k = safeKey(key);
  try {
    return web ? await AsyncStorage.getItem(k) : await SecureStore.getItemAsync(k);
  } catch {
    return null;
  }
}

export async function secureSet(key: string, value: string): Promise<void> {
  const k = safeKey(key);
  try {
    if (web) await AsyncStorage.setItem(k, value);
    else await SecureStore.setItemAsync(k, value);
  } catch {
    // An offline device must never crash on a write failure.
  }
}

export async function secureDelete(key: string): Promise<void> {
  const k = safeKey(key);
  try {
    if (web) await AsyncStorage.removeItem(k);
    else await SecureStore.deleteItemAsync(k);
  } catch {}
}

export const SECURE_KEYS = {
  passcode: (childId: string) => `hi.pc.${childId}`,
  facilitatorPin: "hi.pin",
};
