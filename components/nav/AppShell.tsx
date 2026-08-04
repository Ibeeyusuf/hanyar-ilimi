import { View, Pressable, useWindowDimensions, Modal } from "react-native";
import { ReactNode } from "react";
import { colors, NAV } from "@/constants/theme";
import SceneBackdrop from "@/components/SceneBackdrop";
import { useIdleTimeout } from "@/lib/useIdleTimeout";
import DriftingClouds from "@/components/DriftingClouds";
import Sidebar from "@/components/nav/Sidebar";
import TopBar, { Crumb } from "@/components/nav/TopBar";
import { useNav } from "@/components/nav/NavContext";
import Mascot from "@/components/Mascot";

export default function AppShell({ crumbs, children, showBee = true }: { crumbs: Crumb[]; children: ReactNode; showBee?: boolean }) {
  const resetIdle = useIdleTimeout();
  const { width } = useWindowDimensions();
  const isTablet = width >= NAV.breakpoint;
  const { drawerOpen, setDrawerOpen } = useNav();

  return (
    <View className="flex-1 flex-row" style={{ backgroundColor: colors.skyMid }} onTouchStart={resetIdle}>
      {isTablet && <Sidebar />}

      {/* phone drawer */}
      {!isTablet && (
        <Modal visible={drawerOpen} transparent animationType="slide" onRequestClose={() => setDrawerOpen(false)}>
          <View className="flex-1 flex-row">
            <Sidebar onNavigate={() => setDrawerOpen(false)} />
            <Pressable className="flex-1" style={{ backgroundColor: "rgba(0,0,0,0.35)" }} onPress={() => setDrawerOpen(false)} />
          </View>
        </Modal>
      )}

      <View className="flex-1">
        <SceneBackdrop />
        <DriftingClouds />
        <TopBar crumbs={crumbs} showMenu={!isTablet} />
        <View className="flex-1">{children}</View>
        {showBee && (
          <View className="absolute bottom-3 right-3" pointerEvents="none">
            <Mascot size={72} pose="thumbsup" />
          </View>
        )}
      </View>
    </View>
  );
}
