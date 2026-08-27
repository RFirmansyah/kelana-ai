// ─── Budget ───────────────────────────────────────────────────────────────────

/** Format a number as USD with commas: 2500 → "USD 2,500" */
export function formatUSD(amount: number): string {
  return `USD ${amount.toLocaleString("en-US")}`
}

// ─── Category ─────────────────────────────────────────────────────────────────

type CategoryMeta = { icon: string; colorClass: string }

const CATEGORY_MAP: Record<string, CategoryMeta> = {
  backpacker: { icon: "🎒", colorClass: "text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-500/10 dark:border-amber-500/30" },
  standard:   { icon: "🏨", colorClass: "text-sky-700 bg-sky-50 border-sky-200 dark:text-sky-300 dark:bg-sky-500/10 dark:border-sky-500/30" },
  luxury:     { icon: "💎", colorClass: "text-violet-700 bg-violet-50 border-violet-200 dark:text-violet-300 dark:bg-violet-500/10 dark:border-violet-500/30" },
}

export function getCategoryMeta(category: string): CategoryMeta {
  return CATEGORY_MAP[category.toLowerCase()] ?? { icon: "🏷️", colorClass: "text-gray-700 bg-gray-50 border-gray-200 dark:text-gray-300 dark:bg-white/5 dark:border-white/10" }
}

// ─── Travel Style ─────────────────────────────────────────────────────────────

const STYLE_ICON_MAP: Record<string, string> = {
  family:      "👨‍👩‍👧‍👦",
  solo:        "🧍",
  couple:      "👫",
  honeymoon:   "💑",
  adventure:   "🧗",
  backpacker:  "🎒",
  luxury:      "🥂",
  business:    "💼",
  group:       "👥",
  friends:     "🙌",
}

export function getTravelStyleIcon(style: string): string {
  const key = style.toLowerCase()
  // Try exact match first, then partial
  if (STYLE_ICON_MAP[key]) return STYLE_ICON_MAP[key]
  for (const [k, v] of Object.entries(STYLE_ICON_MAP)) {
    if (key.includes(k)) return v
  }
  return "✈️"
}

// ─── Destination ──────────────────────────────────────────────────────────────

/** Best-effort landmark emoji for well-known cities/countries. Falls back to 📍 */
const LANDMARK_MAP: Record<string, string> = {
  // Cities
  paris:          "🗼",
  tokyo:          "🗾",
  "new york":     "🗽",
  london:         "💂",
  rome:           "🏛️",
  bali:           "🌴",
  dubai:          "🏙️",
  sydney:         "🦘",
  bangkok:        "🛕",
  singapore:      "🦁",
  barcelona:      "🏖️",
  amsterdam:      "🚲",
  istanbul:       "🕌",
  cairo:          "🐫",
  kyoto:          "⛩️",
  osaka:          "🏯",
  seoul:          "🇰🇷",
  beijing:        "🏮",
  shanghai:       "🌆",
  hongkong:       "🌃",
  "hong kong":    "🌃",
  jakarta:        "🇮🇩",
  "kuala lumpur": "🗼",
  manila:         "🇵🇭",
  hanoi:          "🇻🇳",
  "ho chi minh":  "🇻🇳",
  prague:         "🏰",
  vienna:         "🎭",
  athens:         "🏛️",
  lisbon:         "🇵🇹",
  madrid:         "🇪🇸",
  // Countries
  japan:          "🗾",
  france:         "🇫🇷",
  italy:          "🇮🇹",
  usa:            "🗽",
  "united states":"🗽",
  australia:      "🦘",
  indonesia:      "🌴",
  thailand:       "🐘",
  vietnam:        "🇻🇳",
  india:          "🕌",
  china:          "🏮",
  korea:          "🇰🇷",
  spain:          "💃",
  germany:        "🍺",
  netherlands:    "🌷",
  greece:         "🏛️",
  turkey:         "🕌",
  egypt:          "🐫",
  morocco:        "🕌",
  brazil:         "🌴",
  mexico:         "🌮",
  canada:         "🍁",
  "new zealand":  "🥝",
  switzerland:    "🏔️",
  portugal:       "🇵🇹",
  malaysia:       "🌺",
  philippines:    "🏝️",
  cambodia:       "🛕",
  nepal:          "🏔️",
  peru:           "🦙",
  argentina:      "🥩",
  colombia:       "☕",
  maldives:       "🏝️",
  iceland:        "🌋",
  norway:         "🌊",
  sweden:         "🌲",
}

export function getDestinationIcon(destination: string): string {
  const lower = destination.toLowerCase()
  // Try each key as a substring match
  for (const [key, emoji] of Object.entries(LANDMARK_MAP)) {
    if (lower.includes(key)) return emoji
  }
  return "📍"
}
