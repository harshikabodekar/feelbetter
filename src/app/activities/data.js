// Shared activity definitions — imported by both /activities and /dashboard

export const ACTIVITIES = [
  {
    id: "spill",
    name: "Spill",
    desc: "let it all out, unfiltered",
    accent: "#a8c5cc",     // soft teal
    glow: "rgba(122,171,180,.3)",
    route: "/activities/spill",
  },
  {
    id: "pages",
    name: "Pages",
    desc: "a guided journal prompt",
    accent: "#dcc9a8",     // warm sand
    glow: "rgba(196,168,122,.3)",
    route: "/activities/pages",
  },
  {
    id: "compass",
    name: "Compass",
    desc: "find your next small step",
    accent: "#b0bba0",     // sage green
    glow: "rgba(138,152,120,.3)",
    route: "/activities/compass",
  },
  {
    id: "canvas",
    name: "Canvas",
    desc: "draw how you feel",
    accent: "#c4bad6",     // dusty lavender
    glow: "rgba(159,143,196,.3)",
    route: "/activities/canvas",
  },
  {
    id: "echo",
    name: "Echo",
    desc: "hear from someone who felt this too",
    accent: "#c2c9d0",     // cool grey-blue
    glow: "rgba(157,170,180,.3)",
    route: "/activities/echo",
    comingSoon: true,
  },
]

// Which 2 activities to surface on each mood's state-2 overlay
export const MOOD_ACTIVITIES = {
  empty:       ["spill",   "canvas"],
  overwhelmed: ["compass", "spill"],
  okayish:     ["pages",   "compass"],
  heavy:       ["spill",   "pages"],
  full:        ["canvas",  "pages"],
}

// Quick lookup by id
export const ACTIVITY_MAP = Object.fromEntries(ACTIVITIES.map(a => [a.id, a]))
