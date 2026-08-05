import { View, Text, Pressable, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { colors } from "@/constants/theme";
import { elevation, surface } from "@/constants/ui";
import { navIcons } from "@/constants/images";
import ChildPortrait from "@/components/ChildPortrait";
import { useState, useCallback } from "react";
import { getSessionChildId, getChild, getTotalStars, type Child } from "@/lib/data";
import { useNav } from "@/components/nav/NavContext";

export type Crumb = { label: string; color?: string; href?: string; active?: boolean };

export default function TopBar({ crumbs, showMenu }: { crumbs: Crumb[]; showMenu?: boolean }) {
  // The signed-in child — name, star total and portrait, all real.
  const [me, setMe] = useState<Child | null>(null);
  const [stars, setStars] = useState(0);
  useFocusEffect(useCallback(() => {
    let alive = true;
    (async () => {
      const id = await getSessionChildId();
      const c = id ? await getChild(id) : undefined;
      const total = await getTotalStars(id);
      if (!alive) return;
      setMe(c ?? null);
      setStars(total);
    })();
    return () => { alive = false; };
  }, []));
  const { setDrawerOpen } = useNav();
  return (
    <View className="flex-row items-center justify-between px-4 py-3">
      <View className="flex-1 flex-row items-center gap-2">
        {showMenu && (
          <Pressable onPress={() => setDrawerOpen(true)} className="h-10 w-10 items-center justify-center rounded-full bg-white" style={{ borderWidth: 1, borderColor: colors.line }}>
            <Ionicons name="menu" size={22} color={colors.ink} />
          </Pressable>
        )}
        <Pressable onPress={() => router.push("/home" as any)} className="h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white" style={{ borderWidth: 1, borderColor: surface.border, ...elevation.xs }}>
          {navIcons.home ? <Image source={navIcons.home} style={{ width: 30, height: 30 }} resizeMode="contain" /> : <Ionicons name="home" size={18} color={colors.ink} />}
        </Pressable>

        <View className="flex-1 flex-row items-center">
          {crumbs.map((c, i) => (
            <View key={i} className="flex-row items-center">
              <View
                className="flex-row items-center gap-1.5 rounded-full px-3 py-2"
                style={{ backgroundColor: c.active ? colors.purple : "#fff", borderWidth: c.active ? 0 : 1, borderColor: surface.border, ...(c.active ? elevation.xs : {}) }}
              >
                {c.color && !c.active && <View className="h-4 w-4 rounded-full" style={{ backgroundColor: c.color }} />}
                <Text className="text-[12px] font-bold" style={{ color: c.active ? "#fff" : colors.ink }} numberOfLines={1}>
                  {c.label}
                </Text>
              </View>
              {i < crumbs.length - 1 && <Ionicons name="chevron-forward" size={14} color={colors.inkSoft} style={{ marginHorizontal: 2 }} />}
            </View>
          ))}
        </View>
      </View>

      {/* profile chip — the real signed-in child, never a placeholder */}
      <Pressable onPress={() => router.push("/profile" as any)} className="ml-2 flex-row items-center gap-2 rounded-2xl bg-white px-2 py-1.5" style={{ borderWidth: 1, borderColor: surface.border, ...elevation.xs }}>
        <View className="items-end">
          <Text className="text-[12px] font-extrabold" style={{ color: colors.ink }}>{me?.name ?? "—"}</Text>
          <Text className="text-[10px]" style={{ color: colors.inkSoft }}>{stars} ⭐</Text>
        </View>
        <ChildPortrait child={me} size={40} ringColor={colors.purple} ringWidth={2} />
      </Pressable>
    </View>
  );
}
