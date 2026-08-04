# Lesson videos (PRD FR-5.2)

Drop short teaching clips here, then register them in
`constants/images.ts` under `lessonVideo`, keyed "<module>/<lesson>".

Spec from the PRD:
  - MP4, <= 3 MB per clip
  - target <= 8 MB total media per lesson
  - bundled on device (no streaming — FR-5.1)

Example:
  assets/videos/grammar-people.mp4

  export const lessonVideo = {
    "grammar/people": require("@/assets/videos/grammar-people.mp4"),
  };

Any lesson without a clip narrates with device speech instead, so the app
works fully before the media is produced.
