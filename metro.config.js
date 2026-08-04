const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Make sure lesson video/audio files are bundled as assets (PRD FR-5.1:
// all media ships on the device, nothing streams).
const media = ["mp4", "m4v", "mov", "mp3", "m4a", "wav", "aac"];
config.resolver.assetExts = Array.from(new Set([...config.resolver.assetExts, ...media]));

module.exports = withNativeWind(config, { input: "./global.css" });
