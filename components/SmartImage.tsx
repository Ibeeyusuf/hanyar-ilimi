import { Image } from "expo-image";
import { ImageSource } from "@/constants/images";

// If `source` is a required PNG, render it; otherwise return null so the
// caller shows its built-in vector art instead. This is what makes the app
// "prefer real images, fall back to vectors" with no other code changes.
export default function SmartImage({ source, size, width, height }: { source: ImageSource; size?: number; width?: number; height?: number }) {
  if (!source) return null;
  return (
    <Image
      source={source}
      style={{ width: width ?? size ?? 72, height: height ?? size ?? 72 }}
      contentFit="contain"
      transition={200}
    />
  );
}
