/**
 * Data layer entry point. Import from "@/lib/data" everywhere.
 */
export * from "./types";
export * from "./children";
export * from "./progress";
export * from "./events";
export * from "./session";
export * from "./lessonState";

import { getDevice } from "./session";
import { seedIfEmpty } from "./children";

// Call once on app boot: ensures a device record + demo roster exist.
export async function initData(): Promise<void> {
  const device = await getDevice();
  await seedIfEmpty(device.id);
}
