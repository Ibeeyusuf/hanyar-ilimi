/**
 * Data layer entry point. Import from "@/lib/data" everywhere.
 */
import { getDevice } from "./session";
import { seedIfEmpty } from "./children";

export * from "./types";
export * from "./rules";
export * from "./children";
export * from "./progress";
export * from "./events";
export * from "./session";
export * from "./lessonState";
export * from "./sync";

// Call once on app boot: ensures a device record + demo roster exist.
export async function initData(): Promise<void> {
  const device = await getDevice();
  await seedIfEmpty(device.id);
}
