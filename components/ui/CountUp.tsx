import { useEffect, useState } from "react";
import { Text, TextProps } from "react-native";

// Simple number count-up animation for XP / percentages.
export default function CountUp({ to, duration = 800, suffix = "", ...rest }: TextProps & { to: number; duration?: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = Date.now();
    const tick = () => {
      const t = Math.min(1, (Date.now() - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setVal(Math.round(eased * to));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, duration]);
  return <Text {...rest}>{val}{suffix}</Text>;
}
