import { ReactNode } from "react";
import { Pressable, PressableProps } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { feedback } from "@/lib/feedback";

const AP = Animated.createAnimatedComponent(Pressable);

type Props = PressableProps & {
  children: ReactNode;
  sound?: boolean;
  scaleTo?: number;
  className?: string;
};

// Springy press feedback + tap sound/haptic. Use anywhere you'd use Pressable
// for a button, card, or option.
export default function Bounce({ children, sound = true, scaleTo = 0.94, onPress, disabled, ...rest }: Props) {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AP
      {...rest}
      disabled={disabled}
      onPressIn={() => { scale.value = withTiming(scaleTo, { duration: 90 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 12, stiffness: 220 }); }}
      onPress={(e) => { if (!disabled) { if (sound) feedback.tap(); onPress?.(e); } }}
      style={style}
    >
      {children}
    </AP>
  );
}
