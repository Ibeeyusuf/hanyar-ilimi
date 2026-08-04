import { useEffect, useState } from "react";
import { View, Text } from "react-native";
import Svg, { Circle } from "react-native-svg";
import Animated, { useAnimatedProps, useSharedValue, withTiming, Easing } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/theme";
import { elevation, radius, surface } from "@/constants/ui";
import Bounce from "@/components/ui/Bounce";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function Ring({ pct, size = 76 }: { pct: number; size?: number }) {
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const progress = useSharedValue(0);
  useEffect(() => { progress.value = withTiming(pct / 100, { duration: 900, easing: Easing.out(Easing.cubic) }); }, [pct]);
  const animatedProps = useAnimatedProps(() => ({ strokeDashoffset: c * (1 - progress.value) }));
  return (
    <View className="items-center justify-center">
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.line} strokeWidth={stroke} fill="none" />
        <AnimatedCircle cx={size / 2} cy={size / 2} r={r} stroke={colors.purple} strokeWidth={stroke} fill="none"
          strokeDasharray={`${c} ${c}`} animatedProps={animatedProps} strokeLinecap="round"
          rotation={-90} origin={`${size / 2}, ${size / 2}`} />
      </Svg>
      <Text className="absolute text-[17px] font-black" style={{ color: colors.purple }}>{pct}%</Text>
    </View>
  );
}

const cardStyle = { borderWidth: 1, borderColor: surface.border, ...elevation.sm };

export default function RightRail({
  ciGaba, ciGabaLabel, maki, star, starTotal, hint, startSeconds = 270,
}: {
  ciGaba?: number; ciGabaLabel?: string; maki?: string; star?: number; starTotal?: number; hint?: string; startSeconds?: number;
}) {
  const [seconds, setSeconds] = useState(startSeconds);
  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  const low = seconds <= 10;

  return (
    <View className="w-[190px] gap-3 px-3 py-3">
      {ciGaba !== undefined && (
        <View className="rounded-3xl bg-white p-4" style={cardStyle}>
          <Text className="mb-2 text-[11px] font-black tracking-wider" style={{ color: colors.inkSoft }}>CI GABA</Text>
          <View className="items-center"><Ring pct={ciGaba} /></View>
          {ciGabaLabel && <Text className="mt-2 text-center text-[11px]" style={{ color: colors.inkSoft }}>{ciGabaLabel}</Text>}
        </View>
      )}
      {maki !== undefined && (
        <View className="rounded-3xl bg-white p-4" style={cardStyle}>
          <Text className="mb-2 text-[11px] font-black tracking-wider" style={{ color: colors.inkSoft }}>MAKI</Text>
          <View className="flex-row items-center gap-2">
            <Ionicons name="star" size={20} color={colors.gold} />
            <Text className="text-[17px] font-black" style={{ color: colors.ink }}>{maki}</Text>
          </View>
        </View>
      )}
      {star !== undefined && (
        <View className="rounded-3xl bg-white p-4" style={cardStyle}>
          <Text className="mb-2 text-[11px] font-black tracking-wider" style={{ color: colors.inkSoft }}>CI GABA</Text>
          <View className="flex-row items-center gap-1">
            {Array.from({ length: starTotal ?? 3 }).map((_, i) => (
              <Ionicons key={i} name={i < star ? "star" : "star-outline"} size={20} color={colors.gold} />
            ))}
          </View>
          <Text className="mt-1 text-[12px] font-bold" style={{ color: colors.inkSoft }}>{star} / {starTotal ?? 3}</Text>
        </View>
      )}
      <View className="rounded-3xl bg-white p-4" style={cardStyle}>
        <Text className="mb-2 text-[11px] font-black tracking-wider" style={{ color: colors.inkSoft }}>LOKACI</Text>
        <View className="flex-row items-center gap-2">
          <Ionicons name="time-outline" size={18} color={low ? colors.red : colors.purple} />
          <Text className="text-[17px] font-black" style={{ color: low ? colors.red : colors.purple }}>{mm}:{ss}</Text>
        </View>
      </View>
      {hint && (
        <View className="rounded-3xl bg-white p-4" style={cardStyle}>
          <Text className="mb-2 text-[11px] font-black tracking-wider" style={{ color: colors.inkSoft }}>TAIMAKO</Text>
          <View className="flex-row gap-2">
            <Ionicons name="bulb-outline" size={16} color={colors.gold} />
            <Text className="flex-1 text-[11px]" style={{ color: colors.inkSoft }}>{hint}</Text>
          </View>
          <Bounce className="mt-2 flex-row items-center justify-center gap-1.5 rounded-full py-1.5" style={{ backgroundColor: colors.purple }}>
            <Ionicons name="volume-medium" size={14} color="#fff" />
            <Text className="text-[11px] font-bold text-white">Saurari</Text>
          </Bounce>
        </View>
      )}
    </View>
  );
}
