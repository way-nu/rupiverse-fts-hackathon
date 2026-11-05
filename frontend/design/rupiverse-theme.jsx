// khata-theme.jsx — Theme tokens + Rupiverse logo (₹ orbital mark).

const THEMES = {
  calm: {
    name: 'Calm',
    // Banking-app neutral. Very subtle warm white, dark ink, a deep muted teal
    // accent. Sans-serif throughout.
    page:      '#FAFAF7',
    surface:   '#FFFFFF',
    sunken:    '#F1F0EC',
    elevated:  '#FFFFFF',
    ink:       '#0E0E0C',
    ink2:      '#5A5A55',
    ink3:      '#8E8E88',
    inkInverse:'#FFFFFF',
    accent:    '#1F5A50',          // deep teal
    accentInk: '#FFFFFF',
    accentSoft:'#E7EFEC',
    positive:  '#0E7A3F',
    positiveSoft: '#E8F3EC',
    negative:  '#A02528',
    negativeSoft: '#F6E9E7',
    border:    'rgba(14,14,12,0.08)',
    borderStrong: 'rgba(14,14,12,0.14)',
    chipBg:    '#F1F0EC',
    chipInk:   '#3A3A36',
    // Liquid-glass tokens for the floating tab bar + top pills.
    glassBg:    'rgba(255,255,255,0.62)',
    glassBorder:'rgba(255,255,255,0.7)',
    glassShadow:'0 1px 0 rgba(255,255,255,0.6) inset, 0 8px 28px rgba(14,14,12,0.10), 0 0 0 0.5px rgba(14,14,12,0.05)',
    fontDisplay: '"Geist", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
    fontBody:    '"Geist", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
    fontDeva:    '"Tiro Devanagari Hindi", "Noto Sans Devanagari", serif',
    fontMono:    '"Geist Mono", ui-monospace, "SF Mono", monospace',
    displayWeight: 600,
    displayTracking: '-0.02em',
    radiusS: 8, radiusM: 12, radiusL: 18, radiusXL: 24,
    // Status-bar / iOS-frame dark indicator override
    frameDark: false,
  },

  midnight: {
    name: 'Midnight',
    page:      '#0E0E10',
    surface:   '#18181B',
    sunken:    '#1E1E21',
    elevated:  '#222226',
    ink:       '#EDEDEA',
    ink2:      '#A0A09C',
    ink3:      '#6B6B67',
    inkInverse:'#0E0E10',
    accent:    '#5FB58A',           // sage green — cleaner, money-but-not-neon
    accentInk: '#0E0E10',
    accentSoft:'#15281F',
    positive:  '#5FB58A',
    positiveSoft: '#15281F',
    negative:  '#D77272',
    negativeSoft: '#2A1818',
    border:    'rgba(237,237,234,0.08)',
    borderStrong: 'rgba(237,237,234,0.18)',
    chipBg:    '#222226',
    chipInk:   '#DCDCD8',
    glassBg:    'rgba(36,36,40,0.62)',
    glassBorder:'rgba(237,237,234,0.12)',
    glassShadow:'0 1px 0 rgba(237,237,234,0.08) inset, 0 8px 28px rgba(0,0,0,0.45), 0 0 0 0.5px rgba(237,237,234,0.04)',
    fontDisplay: '"Geist", ui-sans-serif, system-ui, sans-serif',
    fontBody:    '"Geist", ui-sans-serif, system-ui, sans-serif',
    fontDeva:    '"Tiro Devanagari Hindi", "Noto Sans Devanagari", serif',
    fontMono:    '"Geist Mono", ui-monospace, "SF Mono", monospace',
    displayWeight: 600,
    displayTracking: '-0.02em',
    radiusS: 8, radiusM: 12, radiusL: 18, radiusXL: 24,
    frameDark: true,
  },
};

function useTheme(key) {
  return THEMES[key] || THEMES.calm;
}

// ─────────────────────────────────────────────────────────────
// Number formatting — Indian lakh/comma grouping.
//   12,34,567   not   1,234,567
// ─────────────────────────────────────────────────────────────
function fmtINR(n, { sign = false, compact = false } = {}) {
  const neg = n < 0; const abs = Math.abs(Math.round(n));
  let str;
  if (compact && abs >= 100000) str = '₹' + (abs / 100000).toFixed(abs >= 1000000 ? 1 : 2).replace(/\.0+$/, '') + 'L';
  else if (compact && abs >= 1000) str = '₹' + (abs / 1000).toFixed(1).replace(/\.0+$/, '') + 'k';
  else {
    const s = String(abs);
    const last3 = s.slice(-3), rest = s.slice(0, -3);
    const groupedRest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    str = '₹' + (rest ? groupedRest + ',' + last3 : last3);
  }
  return (neg ? '−' : (sign && abs > 0 ? '+' : '')) + str;
}

// Bare-number variant for keypad display etc.
function fmtAmount(n) {
  const s = String(Math.abs(Math.round(n)));
  if (s.length <= 3) return s;
  const last3 = s.slice(-3), rest = s.slice(0, -3);
  return rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + last3;
}

// ─────────────────────────────────────────────────────────────
// Logo — "Rupiverse" = ₹ (rupee) at the centre of an orbital ring
// (a multiverse of finances). The mark is an SVG so the orbit + the
// small orbiting body render crisply at any size.
//
// Variants:
//   <Logo theme={t} variant="mark"     />   →  just the ₹-orbit tile
//   <Logo theme={t} variant="wordmark" />   →  mark + "Rupiverse" stacked
//   <Logo theme={t} variant="inline"   />   →  mark + "Rupiverse" (top-bar use)
// ─────────────────────────────────────────────────────────────

// The orbital ₹ mark, drawn as SVG. fg = glyph/orbit colour, bg = tile fill
// (null = transparent, for mono use).
function RupeeOrbit({ size = 32, fg, bg, radius }) {
  const r = radius != null ? radius : size * 0.28;
  return (
    <div style={{
      width: size, height: size, borderRadius: r,
      background: bg || 'transparent',
      position: 'relative', flexShrink: 0, overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <svg viewBox="0 0 100 100" width={size} height={size}
        style={{ position: 'absolute', inset: 0 }} aria-hidden="true">
        {/* orbit ring — a tilted ellipse */}
        <ellipse cx="50" cy="50" rx="44" ry="19"
          transform="rotate(-26 50 50)"
          fill="none" stroke={fg} strokeOpacity="0.5" strokeWidth="3.5" />
        {/* orbiting body — sits on the ring, upper-right */}
        <circle cx="85.5" cy="31" r="6" fill={fg} />
      </svg>
      {/* ₹ glyph, centred above the orbit */}
      <span style={{
        position: 'relative', zIndex: 1,
        fontFamily: '"Geist", ui-sans-serif, system-ui, sans-serif',
        fontWeight: 700, fontSize: size * 0.5, lineHeight: 1, color: fg,
        letterSpacing: '-0.02em',
      }}>₹</span>
    </div>
  );
}

function Logo({ theme: t, variant = 'inline', size = 32, mono = false, color }) {
  const accent = color || t.accent;
  const fg = mono ? t.ink : t.accentInk;
  const bg = mono ? 'transparent' : accent;

  if (variant === 'mark') {
    return <RupeeOrbit size={size} fg={fg} bg={bg} radius={size * 0.28} />;
  }

  if (variant === 'wordmark') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        <RupeeOrbit size={size * 1.6} fg={fg} bg={bg} radius={size * 0.45} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <span style={{ fontFamily: t.fontDisplay, fontSize: size * 0.9, color: t.ink, lineHeight: 1, fontWeight: t.displayWeight, letterSpacing: t.displayTracking }}>Rupiverse</span>
          <span style={{ fontFamily: t.fontBody, fontSize: size * 0.3, color: t.ink3, letterSpacing: '0.32em', textTransform: 'uppercase', fontWeight: 500, paddingLeft: '0.32em' }}>finances, charted</span>
        </div>
      </div>
    );
  }

  // inline
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
      <RupeeOrbit size={size} fg={fg} bg={bg} radius={size * 0.28} />
      <span style={{
        fontFamily: t.fontDisplay, fontSize: size * 0.56,
        color: t.ink, fontWeight: t.displayWeight, letterSpacing: t.displayTracking,
      }}>Rupiverse</span>
    </div>
  );
}

// Decorative ₹ watermark — large, low-opacity, used behind hero numbers.
// (Name kept as DevaGlyph for call-site compatibility; the `char` arg is
// ignored now that the brand mark is the rupee symbol.)
function DevaGlyph({ char, theme: t, size = 80, opacity = 0.06, color }) {
  return (
    <span aria-hidden="true" style={{
      fontFamily: '"Geist", ui-sans-serif, system-ui, sans-serif', fontSize: size, lineHeight: 1,
      color: color || t.ink, opacity, fontWeight: 700, userSelect: 'none',
      letterSpacing: '-0.02em',
    }}>₹</span>
  );
}

Object.assign(window, { THEMES, useTheme, fmtINR, fmtAmount, Logo, RupeeOrbit, DevaGlyph });
