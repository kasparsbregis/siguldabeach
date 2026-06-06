"use client";

export function AnimatedBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10"
      aria-hidden
      style={{
        background: `
          radial-gradient(ellipse 140% 90% at 15% -10%, rgba(6, 182, 212, 0.14) 0%, transparent 55%),
          radial-gradient(ellipse 120% 80% at 85% 5%, rgba(245, 158, 11, 0.09) 0%, transparent 55%),
          radial-gradient(ellipse 100% 70% at 50% 110%, rgba(249, 115, 22, 0.07) 0%, transparent 50%),
          #0a0e1a
        `,
      }}
    />
  );
}
