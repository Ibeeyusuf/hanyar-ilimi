import { View, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/theme";
import { girlAvatars, boyAvatars } from "@/constants/images";
import type { Child } from "@/lib/data";

/**
 * A child's face, wherever one is shown.
 *
 * Prefers the portrait taken at enrolment. When there isn't one, it falls back
 * to a stock avatar picked from the child's sex and ID — sex so a girl is not
 * shown a boy's face, and ID rather than roster position because position
 * shifts the moment a child is removed, silently reassigning every face below
 * them on the screen where children identify themselves.
 */
function fallbackFor(childId: string, sex: "f" | "m") {
  const set = sex === "m" ? boyAvatars : girlAvatars;
  let h = 0;
  for (let i = 0; i < childId.length; i++) h = (h * 31 + childId.charCodeAt(i)) >>> 0;
  return set[h % set.length];
}

export default function ChildPortrait({
  child, size = 96, ringColor, ringWidth,
}: {
  child: Pick<Child, "id" | "photoUri" | "sex"> | null;
  size?: number;
  ringColor?: string;
  ringWidth?: number;
}) {
  const border = ringWidth ?? (ringColor ? 4 : 0);

  if (!child) {
    return (
      <View
        className="items-center justify-center overflow-hidden rounded-full"
        style={{ height: size, width: size, backgroundColor: colors.purpleSoft, borderWidth: border, borderColor: ringColor }}
      >
        <Ionicons name="happy" size={size * 0.55} color={colors.purple} />
      </View>
    );
  }

  return (
    <View
      className="items-center justify-center overflow-hidden rounded-full"
      style={{ height: size, width: size, backgroundColor: "#fff", borderWidth: border, borderColor: ringColor }}
    >
      <Image
        source={child.photoUri ? { uri: child.photoUri } : fallbackFor(child.id, child.sex)}
        style={{ width: size, height: size }}
        resizeMode="cover"
      />
    </View>
  );
}
