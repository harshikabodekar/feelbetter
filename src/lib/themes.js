export const themes = {

  default: {
    background: "linear-gradient(180deg, #03214a 0%, #06527a 35%, #0e8fa3 65%, #a8e6e8 100%)", // deep ocean blue to light aqua
    primary: "#0e8fa3",           // teal — main accent
    text: "#e8f8f9",              // soft white — readable on dark
    textMuted: "rgba(232,248,249,0.6)", // faded white — secondary text
    cardBg: "rgba(255,255,255,0.08)",   // barely visible glass
    cardBorder: "rgba(168,230,232,0.2)", // soft teal border
    sidebarBg: "rgba(3,33,74,0.6)",     // deep navy — sidebar
  },

  empty: {
    state1: {
      // I see you — mirrors numbness. Grey, washed out, quiet.
      background: "linear-gradient(180deg, #b0bec5 0%, #cfd8dc 50%, #eceff1 100%)", // grey-blue fog
      primary: "#78909c",               // muted slate
      text: "#37474f",                  // dark grey — grounded
      textMuted: "rgba(55,71,79,0.6)",  // faded dark grey
      cardBg: "rgba(255,255,255,0.3)",  // soft white glass
      cardBorder: "rgba(120,144,156,0.3)", // muted border
      sidebarBg: "rgba(176,190,197,0.4)", // foggy sidebar
    },
    state2: {
      // I've got you — warmth seeps in. Ivory and cream.
      background: "linear-gradient(180deg, #d7ccc8 0%, #efebe9 50%, #fdf6f0 100%)", // warm ivory
      primary: "#a1887f",               // warm brown-rose
      text: "#4e342e",                  // deep warm brown
      textMuted: "rgba(78,52,46,0.6)",  // faded warm brown
      cardBg: "rgba(255,255,255,0.4)",  // warm white glass
      cardBorder: "rgba(161,136,127,0.3)", // warm border
      sidebarBg: "rgba(215,204,200,0.4)", // warm misty sidebar
    }
  },

  overwhelmed: {
    state1: {
      // I see you — deep urgent teal. Heavy and pressing.
      background: "linear-gradient(180deg, #0a2a3a 0%, #0e5f75 50%, #1a8a9a 100%)", // deep dark teal
      primary: "#0e8fa3",               // teal accent
      text: "#e0f7fa",                  // very light cyan
      textMuted: "rgba(224,247,250,0.6)", // faded light cyan
      cardBg: "rgba(255,255,255,0.07)", // dark glass
      cardBorder: "rgba(14,143,163,0.3)", // teal border
      sidebarBg: "rgba(10,42,58,0.7)",  // very deep teal sidebar
    },
    state2: {
      // I've got you — space opens up. Lighter, breathy seafoam.
      background: "linear-gradient(180deg, #1a8a9a 0%, #4dd0e1 50%, #b2ebf2 100%)", // seafoam light
      primary: "#00838f",               // medium teal
      text: "#004d52",                  // deep teal text
      textMuted: "rgba(0,77,82,0.6)",   // faded deep teal
      cardBg: "rgba(255,255,255,0.25)", // lighter glass
      cardBorder: "rgba(0,131,143,0.3)", // clear teal border
      sidebarBg: "rgba(26,138,154,0.4)", // medium teal sidebar
    }
  },

  okayish: {
    state1: {
      // I see you — muted grey-sage. Overcast afternoon energy.
      background: "linear-gradient(180deg, #78909c 0%, #90a4ae 50%, #b0bec5 100%)", // grey-blue overcast
      primary: "#546e7a",               // slate grey-blue
      text: "#eceff1",                  // light grey-white
      textMuted: "rgba(236,239,241,0.6)", // faded light grey
      cardBg: "rgba(255,255,255,0.12)", // subtle glass
      cardBorder: "rgba(84,110,122,0.3)", // grey border
      sidebarBg: "rgba(120,144,156,0.4)", // grey sidebar
    },
    state2: {
      // I've got you — golden hour peeks through. Amber and peach.
      background: "linear-gradient(180deg, #ffe082 0%, #ffcc80 50%, #ffab40 100%)", // warm amber golden
      primary: "#ff8f00",               // deep amber
      text: "#3e2723",                  // deep warm brown
      textMuted: "rgba(62,39,35,0.6)",  // faded warm brown
      cardBg: "rgba(255,255,255,0.3)",  // warm glass
      cardBorder: "rgba(255,143,0,0.3)", // amber border
      sidebarBg: "rgba(255,224,130,0.4)", // golden sidebar
    }
  },

  heavy: {
    state1: {
      // I see you — deep blue-purple. Cold, still, underwater.
      background: "linear-gradient(180deg, #1a1035 0%, #2d1b5e 50%, #3d2070 100%)", // deep blue-purple night
      primary: "#9b7fbd",               // soft purple
      text: "#e8d5f5",                  // pale lavender white
      textMuted: "rgba(232,213,245,0.6)", // faded lavender
      cardBg: "rgba(255,255,255,0.06)", // very dark glass
      cardBorder: "rgba(155,127,189,0.2)", // faint purple border
      sidebarBg: "rgba(26,16,53,0.7)",  // deep purple-black sidebar
    },
    state2: {
      // I've got you — dawn breaking. Violet shifting to warm rose.
      background: "linear-gradient(180deg, #6b3fa0 0%, #ad5f8a 50%, #c9829a 100%)", // violet to rose
      primary: "#f0c0d0",               // soft blush pink
      text: "#fff0f5",                  // warm white-pink
      textMuted: "rgba(255,240,245,0.6)", // faded warm white
      cardBg: "rgba(255,255,255,0.12)", // rose glass
      cardBorder: "rgba(240,192,208,0.3)", // blush border
      sidebarBg: "rgba(107,63,160,0.4)", // purple sidebar
    }
  },

  full: {
    state1: {
      // I see you — bright aqua and sky. Light and alive.
      background: "linear-gradient(180deg, #00bcd4 0%, #4dd0e1 50%, #a8e6e8 100%)", // bright aqua sky
      primary: "#00838f",               // deep teal
      text: "#002b30",                  // very deep teal-black
      textMuted: "rgba(0,43,48,0.6)",   // faded deep teal
      cardBg: "rgba(255,255,255,0.2)",  // bright glass
      cardBorder: "rgba(0,131,143,0.3)", // teal border
      sidebarBg: "rgba(0,188,212,0.3)", // bright teal sidebar
    },
    state2: {
      // I've got you — golden hour explosion. Sunshine yellow to coral.
      background: "linear-gradient(180deg, #FFD93D 0%, #FFA45B 50%, #FF6B6B 100%)", // sunshine to coral
      primary: "#e65100",               // deep orange
      text: "#1a0a00",                  // very deep warm brown
      textMuted: "rgba(26,10,0,0.6)",   // faded deep brown
      cardBg: "rgba(255,255,255,0.25)", // warm bright glass
      cardBorder: "rgba(230,81,0,0.3)", // orange border
      sidebarBg: "rgba(255,217,61,0.3)", // golden yellow sidebar
    }
  },

}