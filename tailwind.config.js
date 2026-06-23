/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/app/**/*.{js,jsx}", "./src/components/**/*.{js,jsx}"],
  theme: {
    extend: {
      // Map the next/font CSS variables to Tailwind's font families
      fontFamily: {
        sans: ["var(--font-dm-sans)", "ui-sans-serif", "system-ui"],
        serif: ["var(--font-dm-serif)", "ui-serif", "Georgia"],
      },
      // Custom animations used by the breathe circle, the entry fade, and particles
      keyframes: {
        fbIdle: { "0%,100%": { transform: "scale(.82)" }, "50%": { transform: "scale(.92)" } },
        fbRise: { from: { opacity: "0", transform: "translateY(16px)" }, to: { opacity: "1", transform: "none" } },
        fbFloat: {
          "0%": { transform: "translateY(12px)", opacity: "0" },
          "25%": { opacity: ".85" },
          "100%": { transform: "translateY(-70px)", opacity: "0" },
        },
      },
      animation: {
        fbIdle: "fbIdle 6s ease-in-out infinite",
        fbRise: "fbRise .7s ease both",
        fbFloat: "fbFloat 8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
