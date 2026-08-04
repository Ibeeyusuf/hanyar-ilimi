import { View, Text } from "react-native";
import Svg, { Ellipse, Path, Defs, LinearGradient, Stop, Circle } from "react-native-svg";
import { colors } from "@/constants/theme";
import SmartImage from "@/components/SmartImage";
import { brand } from "@/constants/images";

// Hanyar Ilimi wordmark. Uses the real logo artwork when present (rendered at
// its true aspect ratio so it never looks squashed), otherwise a vector mark.
export default function Logo({ compact = false, scale = 1 }: { compact?: boolean; scale?: number }) {
  if (brand.logo) {
    // artwork is ~716x619 (1.157:1) — size by height and derive the width
    const h = (compact ? 42 : 74) * scale;
    return <SmartImage source={brand.logo} width={h * 1.157} height={h} />;
  }
  const s = scale;
  return (
    <View className="flex-row items-center" style={{ gap: 8 * s }}>
      <Svg width={46 * s} height={40 * s} viewBox="0 0 46 40">
        <Defs>
          <LinearGradient id="cloud" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#EAF7FC" />
            <Stop offset="1" stopColor="#C7E9F7" />
          </LinearGradient>
          <LinearGradient id="book" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.purple} />
            <Stop offset="1" stopColor={colors.purpleDeep} />
          </LinearGradient>
        </Defs>
        {/* cloud */}
        <Ellipse cx="16" cy="24" rx="14" ry="10" fill="url(#cloud)" />
        <Ellipse cx="30" cy="20" rx="13" ry="11" fill="url(#cloud)" />
        <Ellipse cx="23" cy="27" rx="16" ry="9" fill="url(#cloud)" />
        {/* open book */}
        <Path d="M13 18 Q23 14 23 17 L23 28 Q23 25 13 29 Z" fill="url(#book)" />
        <Path d="M33 18 Q23 14 23 17 L23 28 Q23 25 33 29 Z" fill={colors.purple} />
        <Path d="M23 17 L23 28" stroke="#fff" strokeWidth="1" opacity={0.6} />
        {/* little sparkle */}
        <Circle cx="38" cy="10" r="2" fill={colors.gold} />
      </Svg>
      {!compact && (
        <View>
          <Text style={{ fontSize: 16 * s, fontWeight: "900", color: colors.green, lineHeight: 17 * s, letterSpacing: 0.5 }}>HANYAR</Text>
          <Text style={{ fontSize: 16 * s, fontWeight: "900", color: colors.purple, lineHeight: 17 * s, letterSpacing: 2 }}>ILIMI</Text>
        </View>
      )}
    </View>
  );
}
