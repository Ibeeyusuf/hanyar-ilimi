import { useEffect } from "react";
import Svg, { Circle, Path, Rect, G, Ellipse, Defs, LinearGradient, Stop } from "react-native-svg";
import Animated, { useAnimatedProps, useSharedValue, withRepeat, withTiming, Easing } from "react-native-reanimated";
import { colors } from "@/constants/theme";
import SmartImage from "@/components/SmartImage";
import { characters } from "@/constants/images";

const AG = Animated.createAnimatedComponent(G);

// Two children waving — the raised arms animate a friendly wave, done in code.
export default function KidsScene({ height = 200, animated = true }: { height?: number; animated?: boolean }) {
  if (characters.kids) return <SmartImage source={characters.kids} width={undefined} height={height} size={height} />;
  const wave = useSharedValue(0);
  useEffect(() => {
    if (!animated) return;
    wave.value = withRepeat(withTiming(1, { duration: 620, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [animated]);

  const boyArm = useAnimatedProps(() => ({ transform: [{ rotate: `${-12 + wave.value * 26}deg` }] } as any));
  const girlArm = useAnimatedProps(() => ({ transform: [{ rotate: `${12 - wave.value * 26}deg` }] } as any));

  return (
    <Svg viewBox="0 0 320 170" width="100%" height={height}>
      <Defs>
        <LinearGradient id="sky2" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#CDEBF7" /><Stop offset="1" stopColor="#EAF7FC" />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width="320" height="170" rx="14" fill="url(#sky2)" />
      <Path d="M0 130 Q80 110 160 128 T320 122 V170 H0 Z" fill="#BFE39A" />
      <Circle cx="280" cy="34" r="20" fill="#FCE38A" />

      {/* Boy (blue) */}
      <G transform="translate(40 12)">
        <Rect x="30" y="118" width="10" height="26" rx="4" fill="#3E5C8A" />
        <Rect x="46" y="118" width="10" height="26" rx="4" fill="#3E5C8A" />
        <Ellipse cx="33" cy="146" rx="8" ry="4" fill="#E24B4B" />
        <Ellipse cx="53" cy="146" rx="8" ry="4" fill="#E24B4B" />
        <Path d="M26 82 Q43 74 60 82 L58 120 Q43 126 28 120 Z" fill="#4AA3E0" />
        {/* animated waving arm, pivot at shoulder */}
        <AG animatedProps={animated ? boyArm : undefined} origin="58, 88">
          <Path d="M58 88 Q74 78 72 60" stroke="#4AA3E0" strokeWidth={9} fill="none" strokeLinecap="round" />
          <Circle cx="72" cy="56" r="6" fill="#8D5A3C" />
        </AG>
        <Path d="M28 88 Q20 100 24 114" stroke="#4AA3E0" strokeWidth={9} fill="none" strokeLinecap="round" />
        <Circle cx="24" cy="116" r="5.5" fill="#8D5A3C" />
        <Circle cx="43" cy="60" r="20" fill="#8D5A3C" />
        <Path d="M23 58 Q24 38 43 38 Q62 38 63 58 Q58 48 43 48 Q28 48 23 58 Z" fill="#2B1D12" />
        <Circle cx="37" cy="60" r="2.6" fill={colors.ink} /><Circle cx="49" cy="60" r="2.6" fill={colors.ink} />
        <Path d="M37 68 Q43 73 49 68" stroke={colors.ink} strokeWidth={2} fill="none" strokeLinecap="round" />
        <Circle cx="32" cy="66" r="3" fill="#FF8A8A" opacity={0.4} /><Circle cx="54" cy="66" r="3" fill="#FF8A8A" opacity={0.4} />
      </G>

      {/* Girl (yellow) */}
      <G transform="translate(190 12)">
        <Rect x="30" y="120" width="10" height="24" rx="4" fill="#8D5A3C" />
        <Rect x="46" y="120" width="10" height="24" rx="4" fill="#8D5A3C" />
        <Ellipse cx="33" cy="146" rx="8" ry="4" fill="#C0453B" />
        <Ellipse cx="53" cy="146" rx="8" ry="4" fill="#C0453B" />
        <Path d="M24 84 Q43 76 62 84 L68 122 Q43 132 18 122 Z" fill="#F4C542" />
        <AG animatedProps={animated ? girlArm : undefined} origin="60, 90">
          <Path d="M60 90 Q76 80 74 62" stroke="#F4C542" strokeWidth={9} fill="none" strokeLinecap="round" />
          <Circle cx="74" cy="58" r="6" fill="#8D5A3C" />
        </AG>
        <Path d="M26 90 Q18 102 22 116" stroke="#F4C542" strokeWidth={9} fill="none" strokeLinecap="round" />
        <Circle cx="22" cy="118" r="5.5" fill="#8D5A3C" />
        <Circle cx="43" cy="60" r="20" fill="#8D5A3C" />
        <Circle cx="43" cy="42" r="12" fill="#2B1D12" /><Circle cx="24" cy="52" r="9" fill="#2B1D12" /><Circle cx="62" cy="52" r="9" fill="#2B1D12" />
        <Path d="M25 56 Q26 40 43 40 Q60 40 61 56 Q54 48 43 48 Q32 48 25 56 Z" fill="#2B1D12" />
        <Circle cx="37" cy="60" r="2.6" fill={colors.ink} /><Circle cx="49" cy="60" r="2.6" fill={colors.ink} />
        <Path d="M37 68 Q43 73 49 68" stroke={colors.ink} strokeWidth={2} fill="none" strokeLinecap="round" />
        <Circle cx="32" cy="66" r="3" fill="#FF8A8A" opacity={0.5} /><Circle cx="54" cy="66" r="3" fill="#FF8A8A" opacity={0.5} />
      </G>
    </Svg>
  );
}
