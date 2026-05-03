import { motion } from "framer-motion";

/**
 * Subtle animated smoke + ember backdrop. Pure CSS/SVG — fast & GPU friendly.
 * Drop inside a relatively-positioned section.
 */
export function SmokeBackground({ density = "md" }: { density?: "sm" | "md" | "lg" }) {
  const blobs = density === "lg" ? 6 : density === "sm" ? 3 : 4;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Ember glows */}
      {Array.from({ length: blobs }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-3xl"
          style={{
            width: 280 + i * 60,
            height: 280 + i * 60,
            left: `${(i * 23) % 90}%`,
            top: `${(i * 37) % 80}%`,
            background:
              i % 2 === 0
                ? "radial-gradient(circle, hsl(var(--bbq-crimson) / 0.25), transparent 70%)"
                : "radial-gradient(circle, hsl(var(--bbq-ember) / 0.18), transparent 70%)",
          }}
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -20, 25, 0],
            opacity: [0.4, 0.7, 0.5, 0.4],
          }}
          transition={{
            duration: 14 + i * 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 1.2,
          }}
        />
      ))}
      {/* Floating ember sparks */}
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.span
          key={`s-${i}`}
          className="absolute h-1 w-1 rounded-full bg-primary/70 shadow-[0_0_8px_hsl(var(--bbq-ember))]"
          style={{ left: `${(i * 8.3) % 100}%`, bottom: -10 }}
          animate={{ y: [-10, -600 - (i % 4) * 80], opacity: [0, 1, 0] }}
          transition={{
            duration: 8 + (i % 5),
            repeat: Infinity,
            delay: i * 0.7,
            ease: "easeOut",
          }}
        />
      ))}
      {/* Smoke vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/0 to-background pointer-events-none" />
    </div>
  );
}
