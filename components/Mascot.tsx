import { Image } from "expo-image";
import { characters } from "@/constants/images";

/**
 * The app's guide character. `pose` was previously accepted and ignored, so
 * every call site rendered the same caterpillar; it now selects from the
 * artwork that actually ships with the app.
 */
export type MascotPose = "default" | "trophy" | "thumbsup";

const ART: Record<MascotPose, any> = {
  default: characters.caterpillar,
  trophy: characters.ladybug,
  thumbsup: characters.bee,
};

export default function Mascot({ size = 72, pose = "default" }: { size?: number; pose?: MascotPose }) {
  return (
    <Image
      source={ART[pose] ?? ART.default}
      style={{ width: size, height: size }}
      contentFit="contain"
      transition={200}
    />
  );
}
