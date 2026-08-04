// Shared design system — one source of truth for shadows, radii, spacing,
// and type scale. Applied consistently across every screen so the app reads
// as one crafted product rather than a set of separately-styled screens.

export const elevation = {
  // Barely-there lift for nested/secondary surfaces.
  xs: { shadowColor: "#1E2A3B", shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  // Standard card lift — the default for content cards.
  sm: { shadowColor: "#1E2A3B", shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 3 },
  // Primary surfaces (main lesson card, modals).
  md: { shadowColor: "#1E2A3B", shadowOpacity: 0.09, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 6 },
  // Floating / overlay surfaces (celebration modal, popovers).
  lg: { shadowColor: "#1E2A3B", shadowOpacity: 0.14, shadowRadius: 32, shadowOffset: { width: 0, height: 16 }, elevation: 10 },
};

export const radius = {
  sm: 12,
  md: 18,
  card: 22,
  lg: 28,
  pill: 999,
};

// PRD FR-1.3: child-facing touch targets >= 64px.
export const touch = { min: 64, answerTile: 88, iconButton: 56 };

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

// Consistent type scale — replaces ad-hoc text-[Npx] sizing.
export const type = {
  display: 28,  // page hero titles
  h1: 22,       // section titles
  h2: 17,       // card titles
  body: 14,     // primary body text
  label: 12,    // labels, captions, meta
  micro: 10.5,  // fine print
};

// Neutral surface + border tones used everywhere for consistency.
export const surface = {
  card: "#FFFFFF",
  cardAlt: "#FAFAFC",
  border: "#EDEBF4",
  borderStrong: "#DDD9EC",
};
