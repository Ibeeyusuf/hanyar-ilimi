import { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming, Easing } from "react-native-reanimated";
import Svg, { Ellipse, G } from "react-native-svg";

// Subtle slow-drifting clouds layered over the backdrop. Kept separate from
// SceneBackdrop so the static scene stays rock-solid. Very gentle — adds life
// without distracting from lessons.
function Cloud({ delay, duration, top, scale, opacity }: { delay: number; duration: number; top: number; scale: number; opacity: number }) {
  const x = useSharedValue(-120);
  useEffect(() => {
    x.value = withRepeat(withTiming(1, { duration, easing: Easing.linear }), -1, false);
  }, []);
  const style = useAnimatedStyle(() => ({ transform: [{ translateX: -120 + x.value * 700 }, { scale }] }));
  return (
    <Animated.View style={[{ position: "absolute", top, opacity }, style]}>
      <Svg width={90} height={44} viewBox="0 0 90 44">
        <G>
          <Ellipse cx="30" cy="26" rx="26" ry="15" fill="#fff" />
          <Ellipse cx="52" cy="20" rx="22" ry="16" fill="#fff" />
          <Ellipse cx="45" cy="30" rx="30" ry="12" fill="#fff" />
        </G>
      </Svg>
    </Animated.View>
  );
}

export default function DriftingClouds() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Cloud delay={0} duration={38000} top={40} scale={1} opacity={0.85} />
      <Cloud delay={6000} duration={52000} top={90} scale={0.7} opacity={0.65} />
      <Cloud delay={3000} duration={45000} top={150} scale={0.85} opacity={0.5} />
    </View>
  );
}
