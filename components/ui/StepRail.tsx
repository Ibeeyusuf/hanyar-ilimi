import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/theme";

/** Enrolment / login step indicator. Shared by the two auth screens, which
 *  previously each carried their own identical copy. */
export default function StepRail({ step, total = 6 }: { step: number; total?: number }) {
  return (
    <View className="mb-5 flex-row items-center justify-center">
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} className="flex-row items-center">
          <View className="h-6 w-6 items-center justify-center rounded-full"
            style={{ backgroundColor: i <= step ? colors.green : "#fff", borderWidth: 2, borderColor: i <= step ? colors.green : colors.line }}>
            {i < step
              ? <Ionicons name="checkmark" size={12} color="#fff" />
              : <Text className="text-[10px] font-bold" style={{ color: i === step ? "#fff" : colors.inkSoft }}>{i + 1}</Text>}
          </View>
          {i < total - 1 && <View className="h-0.5 w-6" style={{ backgroundColor: i < step ? colors.green : colors.line }} />}
        </View>
      ))}
    </View>
  );
}
