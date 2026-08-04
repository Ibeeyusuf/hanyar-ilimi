import { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useVideoPlayer, VideoView } from "expo-video";
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming, Easing, withSequence } from "react-native-reanimated";
import { colors } from "@/constants/theme";
import { speak, stopSpeaking } from "@/lib/speech";
import { feedback } from "@/lib/feedback";

/**
 * Lesson media player (PRD S5 / FR-5.2).
 *
 * The PRD specifies each lesson has a teaching clip — "animations as Lottie or
 * short MP4" — plus narrated audio. This renders the full player UI from the
 * approved design: poster frame, play/pause, scrub bar, elapsed time and a
 * fullscreen control.
 *
 * Until the recorded media is produced (PRD §8, ~700 clips), pressing play
 * narrates the lesson with device speech and runs the progress bar in step, so
 * the lesson still teaches. Dropping a real MP4 in later needs no UI change.
 */
export default function LessonMedia({
  video, poster, word, sentence, durationSec = 80, onReplay,
}: {
  video?: any; poster?: any; word: string; sentence?: string; durationSec?: number; onReplay?: () => void;
}) {
  const hasVideo = !!video;
  // Hooks can't be conditional, so the player is always created; with no
  // source it simply stays idle.
  const player = useVideoPlayer(video ?? null, (p) => { p.loop = false; });
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = () => {
    if (timer.current) { clearInterval(timer.current); timer.current = null; }
    stopSpeaking();
    try { player?.pause(); } catch {}
    setPlaying(false);
  };

  // With a real clip, follow its actual playback position.
  useEffect(() => {
    if (!hasVideo || !playing) return;
    const id = setInterval(() => {
      try {
        const t = Math.floor(player.currentTime ?? 0);
        setElapsed(t);
        const dur = player.duration ?? durationSec;
        if (dur && t >= dur - 0.4) stop();
      } catch {}
    }, 400);
    return () => clearInterval(id);
  }, [hasVideo, playing]);

  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  const toggle = () => {
    feedback.tap();
    if (playing) { stop(); return; }
    setPlaying(true);
    setElapsed(0);
    onReplay?.();                                   // FR-5.3: replay count logged
    if (hasVideo) {
      try { player.currentTime = 0; player.play(); } catch {}
      return;
    }
    speak(sentence ? `${word}. ${sentence}` : word);
    timer.current = setInterval(() => {
      setElapsed((e) => {
        if (e + 1 >= durationSec) { stop(); return 0; }
        return e + 1;
      });
    }, 1000);
  };

  const mmss = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const total = hasVideo ? Math.max(1, Math.floor(player?.duration || durationSec)) : durationSec;
  const pct = Math.min(100, (elapsed / total) * 100);

  return (
    <View className="overflow-hidden rounded-2xl" style={{ backgroundColor: "#0E1524" }}>
      {/* poster / stage */}
      <View className="items-center justify-center" style={{ height: 208, backgroundColor: colors.purpleSoft }}>
        {hasVideo ? (
          <VideoView player={player} style={{ width: "100%", height: "100%" }} contentFit="contain" nativeControls={false} />
        ) : poster ? (
          <Image source={poster} style={{ width: 168, height: 168 }} resizeMode="contain" />
        ) : (
          <Text style={{ fontSize: 84 }}>{word}</Text>
        )}
        {!playing && (
          <Pressable onPress={toggle} className="absolute items-center justify-center rounded-full"
            style={{ height: 66, width: 66, backgroundColor: "rgba(255,255,255,0.94)", shadowColor: "#000", shadowOpacity: 0.22, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 6 }}>
            <Ionicons name="play" size={30} color={colors.purple} style={{ marginLeft: 4 }} />
          </Pressable>
        )}
      </View>

      {/* transport bar */}
      <View className="flex-row items-center gap-3 px-3 py-2.5">
        <Pressable onPress={toggle} hitSlop={8}>
          <Ionicons name={playing ? "pause" : "play"} size={20} color="#fff" />
        </Pressable>
        <View className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.25)" }}>
          <View style={{ width: `${pct}%`, height: "100%", backgroundColor: colors.purple, borderRadius: 99 }} />
        </View>
        <Text className="text-[11px] font-bold" style={{ color: "rgba(255,255,255,0.85)" }}>
          {mmss(elapsed)} / {mmss(total)}
        </Text>
        <Ionicons name="scan-outline" size={17} color="rgba(255,255,255,0.85)" />
      </View>
    </View>
  );
}

/** Narrated-word player with an animated waveform (PRD S5 "Ka saurari kalmar"). */
export function AudioBar({ word, onReplay }: { word: string; onReplay?: () => void }) {
  const [playing, setPlaying] = useState(false);
  const t = useSharedValue(0);

  useEffect(() => {
    if (playing) {
      t.value = withRepeat(withTiming(1, { duration: 620, easing: Easing.inOut(Easing.ease) }), -1, true);
    } else {
      t.value = withTiming(0, { duration: 200 });
    }
  }, [playing]);

  const play = () => {
    feedback.tap();
    onReplay?.();
    speak(word);
    setPlaying(true);
    setTimeout(() => setPlaying(false), 1800);
  };

  return (
    <Pressable onPress={play} className="flex-row items-center gap-3 rounded-2xl px-4 py-3"
      style={{ backgroundColor: "#F4F0FE", borderWidth: 1, borderColor: "#E4DBFA" }}>
      <View className="h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: colors.purple }}>
        <Ionicons name={playing ? "volume-high" : "volume-medium"} size={19} color="#fff" />
      </View>
      <View className="flex-1">
        <Text className="text-[13px] font-black" style={{ color: colors.purpleDeep }}>Ka saurari kalmar</Text>
        <Text className="text-[12px]" style={{ color: colors.ink }}>{word}</Text>
      </View>
      {/* waveform */}
      <View className="flex-row items-end gap-[3px]" style={{ height: 26 }}>
        {[10, 18, 8, 24, 14, 20, 9, 16, 22, 12, 19, 7].map((h, i) => (
          <Bar key={i} base={h} index={i} t={t} />
        ))}
      </View>
    </Pressable>
  );
}

function Bar({ base, index, t }: { base: number; index: number; t: any }) {
  const style = useAnimatedStyle(() => {
    const wobble = Math.sin((t.value * Math.PI * 2) + index * 0.7);
    const h = base + wobble * (t.value * 7);
    return { height: Math.max(4, h) };
  });
  return <Animated.View style={[{ width: 3, borderRadius: 2, backgroundColor: colors.purple, opacity: 0.75 }, style]} />;
}
