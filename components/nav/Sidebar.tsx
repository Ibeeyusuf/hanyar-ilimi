import { View, Text, Pressable, ScrollView, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import { colors } from "@/constants/theme";
import { navIcons } from "@/constants/images";
import { logout } from "@/lib/data";
import Logo from "@/components/brand/Logo";
import Mascot from "@/components/Mascot";

type Item = { id: string; label: string; icon: keyof typeof Ionicons.glyphMap; color: string; href: string };

const SUBJECTS: Item[] = [
  { id: "home", label: "HOME", icon: "home", color: colors.purple, href: "/home" },
  { id: "literacy", label: "LITERACY", icon: "book", color: colors.literacy, href: "/subject/literacy" },
  { id: "numeracy", label: "NUMERACY", icon: "calculator", color: colors.numeracy, href: "/subject/numeracy" },
  { id: "hygiene", label: "HYGIENE", icon: "water", color: colors.hygiene, href: "/subject/hygiene" },
];
const GENERAL: Item[] = [
  { id: "profile", label: "MY PROFILE", icon: "happy-outline", color: colors.inkSoft, href: "/profile" },
  { id: "progress", label: "MY PROGRESS", icon: "star-outline", color: colors.inkSoft, href: "/progress" },
  { id: "rewards", label: "REWARDS", icon: "trophy-outline", color: colors.inkSoft, href: "/rewards" },
  { id: "settings", label: "SETTINGS", icon: "settings-outline", color: colors.inkSoft, href: "/settings" },
  { id: "logout", label: "LOG OUT", icon: "log-out-outline", color: colors.inkSoft, href: "/(auth)/login" },
];

export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  const go = async (href: string) => {
    onNavigate?.();
    // LOG OUT must actually end the session — otherwise the next child's work
    // would be recorded against the previous one on a shared tablet.
    if (href.includes("(auth)/login")) {
      await logout();
      router.replace(href as any);
      return;
    }
    router.push(href as any);
  };

  const Row = ({ item, filled }: { item: Item; filled?: boolean }) => {
    const active = pathname.includes(item.id);
    return (
      <Pressable
        onPress={() => go(item.href)}
        className="mb-1.5 flex-row items-center gap-3 rounded-2xl px-3 py-2.5"
        style={{ backgroundColor: active ? colors.sidebarActive : "transparent" }}
      >
        {navIcons[item.id] ? (
          <Image source={navIcons[item.id]!} style={{ width: 34, height: 34 }} resizeMode="contain" />
        ) : (
          <View
            className="h-8 w-8 items-center justify-center rounded-xl"
            style={{ backgroundColor: filled ? item.color : "transparent" }}
          >
            <Ionicons name={item.icon} size={filled ? 18 : 20} color={filled ? "#fff" : item.color} />
          </View>
        )}
        <Text className="text-[13px] font-extrabold tracking-wide" style={{ color: active ? colors.purpleDeep : colors.ink }}>
          {item.label}
        </Text>
      </Pressable>
    );
  };

  return (
    <View className="h-full w-[240px] bg-white" style={{ borderRightWidth: 1, borderRightColor: colors.line, shadowColor: "#1E2A3B", shadowOpacity: 0.06, shadowRadius: 16, shadowOffset: { width: 6, height: 0 }, elevation: 4 }}>
      <View className="px-5 pb-2 pt-6">
        <Logo />
      </View>
      <ScrollView className="flex-1 px-3 pt-4" showsVerticalScrollIndicator={false}>
        {SUBJECTS.map((it) => <Row key={it.id} item={it} filled />)}
        <View className="my-3 h-px" style={{ backgroundColor: colors.line }} />
        {GENERAL.map((it) => <Row key={it.id} item={it} />)}
      </ScrollView>
      <View className="items-start px-4 pb-4">
        <Mascot size={70} />
      </View>
    </View>
  );
}
