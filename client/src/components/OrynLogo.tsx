export function OrynLogo({ className }: { className?: string }) {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 200 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* ── Cookie body ── */}
      <circle cx="100" cy="150" r="68" stroke="currentColor" strokeWidth="5.5" fill="none" />

      {/* ── Chocolate chips ── */}
      <ellipse cx="80"  cy="135" rx="8" ry="7"  fill="currentColor" />
      <ellipse cx="118" cy="132" rx="8" ry="7"  fill="currentColor" />
      <ellipse cx="86"  cy="168" rx="8" ry="7"  fill="currentColor" />
      <ellipse cx="124" cy="165" rx="7" ry="6"  fill="currentColor" />
      <ellipse cx="68"  cy="162" rx="6.5" ry="5.5" fill="currentColor" />
      <ellipse cx="108" cy="152" rx="5.5" ry="5" fill="currentColor" />
      <ellipse cx="100" cy="178" rx="6"  ry="5.5" fill="currentColor" />

      {/* ── Eyes ── */}
      <ellipse cx="85"  cy="144" rx="5.5" ry="7" fill="currentColor" />
      <ellipse cx="115" cy="144" rx="5.5" ry="7" fill="currentColor" />

      {/* ── Smile ── */}
      <path
        d="M 83 162 Q 100 178 117 162"
        stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" fill="none"
      />

      {/* ── Arms ── */}
      <path
        d="M 33 158 C 22 150 20 140 30 135"
        stroke="currentColor" strokeWidth="5" strokeLinecap="round" fill="none"
      />
      <path
        d="M 167 158 C 178 150 180 140 170 135"
        stroke="currentColor" strokeWidth="5" strokeLinecap="round" fill="none"
      />

      {/* ── Legs ── */}
      <line x1="87"  y1="216" x2="82"  y2="233" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
      <line x1="113" y1="216" x2="118" y2="233" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />

      {/* ── Feet ── */}
      <path
        d="M 68 236 Q 82 244 94 236"
        stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" fill="none"
      />
      <path
        d="M 106 236 Q 118 244 132 236"
        stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" fill="none"
      />

      {/* ── Chef hat band ── */}
      <rect x="67" y="80" width="66" height="13" rx="6"
        stroke="currentColor" strokeWidth="4.5" fill="none" />

      {/* ── Chef hat puff ── */}
      <path
        d="M 70 80
           C 66 58 72 34 100 30
           C 128 34 134 58 130 80"
        stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none"
      />
      {/* inner hat crease */}
      <path
        d="M 86 80 C 84 62 88 42 100 38 C 112 42 116 62 114 80"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.35"
      />
    </svg>
  );
}
