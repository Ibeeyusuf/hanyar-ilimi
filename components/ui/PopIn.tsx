import { ReactNode, useEffect } from "react";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withDelay } from "react-native-reanimated";

// Springy entrance for rewards, badges, feedback banners.
export default function PopIn({ children, delay = 0, style }: { children: ReactNode; delay?: number; style?: any }) {
  const s = useSharedValue(0);
  useEffect(() => { s.value = withDelay(delay, withSpring(1, { damping: 10, stiffness: 180 })); }, [delay, s]);
  const a = useAnimatedStyle(() => ({ opacity: s.value, transform: [{ scale: 0.6 + s.value * 0.4 }] }));
  return <Animated.View style={[a, style]}>{children}</Animated.View>;
}
