import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { characters } from "@/constants/images";
import { colors } from "@/constants/theme";

// The app's single guide character. Uses the designer's caterpillar art when
// present; until then shows a clean, minimal placeholder (no busy vectors).
export default function Mascot({ size = 72 }: { size?: number; pose?: string }) {
  if (characters.mascot) {
    return <Image source={characters.mascot} style={{ width: size, height: size }} contentFit="contain" transition={200} />;
  }
  // clean placeholder — a soft rounded tile with a friendly face icon
  return (
    <View style={{ width: size, height: size, borderRadius: size * 0.28, backgroundColor: colors.greenSoft ?? "#E7F4DC", alignItems: "center", justifyContent: "center" }}>
      <Ionicons name="happy" size={size * 0.55} color={colors.green ?? "#7CC242"} />
    </View>
  );
}
