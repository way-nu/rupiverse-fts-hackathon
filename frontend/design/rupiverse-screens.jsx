// rupiverse-screens.jsx — All app screens + shared atoms.
// Depends on globals from rupiverse-theme.jsx and rupiverse-data.jsx.

// ─────────────────────────────────────────────────────────────
// Shared atoms
// ─────────────────────────────────────────────────────────────

// Uniform top bar — same shape across every tab.
//   left:   small Rupiverse logo mark + screen title
//   right:  caller-supplied action icons (search, filter, +, month, etc.)
// No back button anywhere — global navigation is the bottom tab bar.
function TopBar({ t, title, trailing, sticky = true }) {
  return (
    <div style={{
      position: sticky ? 'sticky' : 'relative', top: 0, zIndex: 2,
      background: t.page,
      padding: '14px 16px 12px',
      display: 'flex', alignItems: 'center', gap: 10,
      borderBottom: `1px solid ${t.border}`,
    }}>
      <Logo theme={t} variant="mark" size={28} />
      <div style={{
        fontFamily: t.fontDisplay, fontSize: 18, color: t.ink,
        fontWeight: t.displayWeight, letterSpacing: t.displayTracking, lineHeight: 1.1,
      }}>{title}</div>
      <div style={{ flex: 1 }} />
      {trailing && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>{trailing}</div>
      )}
    </div>
  );
}

function IconBtn({ t, onClick, children, size = 36 }) {
  return (
    <button onClick={onClick} style={{
      width: size, height: size, borderRadius: 999,
      border: 'none', background: 'transparent', color: t.ink,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', padding: 0,
    }}>{children}</button>
  );
}

function Chip({ t, children, color, active, onClick, soft, glyph }) {
  const bg = active ? t.accent : (soft ? t.chipBg : 'transparent');
  const ink = active ? t.accentInk : (soft ? t.chipInk : t.ink2);
  const border = active ? 'transparent' : t.border;
  return (
    <button onClick={onClick} style={{
      height: 30, padding: '0 12px', borderRadius: 999,
      background: bg, color: ink, border: `1px solid ${border}`,
      display: 'inline-flex', alignItems: 'center', gap: 6,
      fontFamily: t.fontBody, fontSize: 13, fontWeight: 500,
      cursor: 'pointer', whiteSpace: 'nowrap',
    }}>
      {color && <span style={{ width: 8, height: 8, borderRadius: 2, background: color }} />}
      {glyph && <span style={{ fontFamily: t.fontDeva, fontSize: 12, marginRight: -2 }}>{glyph}</span>}
      {children}
    </button>
  );
}

// Category swatch: rounded tile with a language-neutral 2-letter abbreviation.
function CatBadge({ cat, t, size = 36 }) {
  if (!cat) return <div style={{ width: size, height: size, borderRadius: size * 0.28, background: t.chipBg }} />;
  const root = catRoot(cat.id) || cat;
  const abbr = root.abbr || (root.name || '').slice(0, 2);
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.28,
      background: root.swatch + '24',
      border: `1px solid ${root.swatch}40`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: root.swatch, flexShrink: 0,
      fontFamily: t.fontDisplay, fontSize: size * 0.34, lineHeight: 1,
      fontWeight: 600, letterSpacing: '-0.01em',
    }}>{abbr}</div>
  );
}

// Big tabular currency display. Splits ₹/integer/decimal so the rupee sign and
// any decimals can be visually de-emphasized.
function BigAmount({ t, value, color, size = 48 }) {
  const neg = value < 0;
  const abs = Math.abs(value);
  const intPart = fmtAmount(Math.floor(abs));
  const dec = (abs % 1).toFixed(2).slice(2);
  return (
    <div style={{
      fontFamily: t.fontDisplay, color: color || t.ink,
      fontSize: size, lineHeight: 1, fontWeight: t.displayWeight,
      letterSpacing: t.displayTracking,
      display: 'inline-flex', alignItems: 'baseline', gap: 2,
      fontVariantNumeric: 'tabular-nums',
    }}>
      {neg && <span>−</span>}
      <span style={{ fontSize: size * 0.55, opacity: 0.55, marginRight: 2 }}>₹</span>
      <span>{intPart}</span>
      {dec !== '00' && <span style={{ fontSize: size * 0.5, opacity: 0.5 }}>.{dec}</span>}
    </div>
  );
}

// Donut chart — segments rendered via stroke-dasharray on circles.
function Donut({ t, segments, size = 168, thickness = 18, centerLabel, centerValue, activeIndex = -1 }) {
  const r = (size - thickness) / 2;
  const C = 2 * Math.PI * r;
  const total = segments.reduce((s, x) => s + x.amount, 0);
  let acc = 0;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={t.border} strokeWidth={thickness * 0.5} />
        {segments.map((s, i) => {
          const frac = s.amount / total;
          const len = frac * C;
          const dash = `${len} ${C - len}`;
          const offset = -acc;
          acc += len;
          const active = i === activeIndex;
          return (
            <circle key={s.id} cx={size/2} cy={size/2} r={r}
              fill="none" stroke={s.color} strokeWidth={active ? thickness + 4 : thickness}
              strokeDasharray={dash} strokeDashoffset={offset} strokeLinecap="butt"
              opacity={activeIndex < 0 || active ? 1 : 0.55}
            />
          );
        })}
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', pointerEvents: 'none',
      }}>
        <div style={{ fontFamily: t.fontBody, fontSize: 11, color: t.ink3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{activeIndex >= 0 ? segments[activeIndex].name : centerLabel}</div>
        <div style={{ fontFamily: t.fontDisplay, fontSize: 26, color: t.ink, fontWeight: t.displayWeight, lineHeight: 1.2, fontVariantNumeric: 'tabular-nums' }}>{activeIndex >= 0 ? fmtINR(segments[activeIndex].amount, { compact: true }) : centerValue}</div>
        {activeIndex >= 0 && (
          <div style={{ fontFamily: t.fontBody, fontSize: 10.5, color: t.ink3, marginTop: 2 }}>{Math.round(segments[activeIndex].amount / total * 100)}% of spend</div>
        )}
      </div>
    </div>
  );
}

// Mini bar pair: income/expense per month for the trend.
function TrendBars({ t, data, max, activeIndex = -1 }) {
  const cap = max ?? Math.max(...data.flatMap((d) => [d.inK, d.outK]));
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, height: 110 }}>
      {data.map((d, i) => {
        const active = i === activeIndex;
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, position: 'relative' }}>
            {active && (
              <div style={{
                position: 'absolute', top: -2, left: '50%', transform: 'translateX(-50%)',
                padding: '4px 8px', borderRadius: 6,
                background: t.ink, color: t.inkInverse,
                fontFamily: t.fontBody, fontSize: 10.5, fontWeight: 600,
                whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums',
              }}>
                +₹{d.inK}k / −₹{d.outK}k
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 70, width: '100%', justifyContent: 'center', marginTop: active ? 20 : 0 }}>
              <div style={{ width: '38%', height: `${(d.inK / cap) * 100}%`, background: t.positive, borderRadius: '2px 2px 0 0', minHeight: 2, opacity: activeIndex < 0 || active ? 1 : 0.7 }} />
              <div style={{ width: '38%', height: `${(d.outK / cap) * 100}%`, background: t.accent, borderRadius: '2px 2px 0 0', minHeight: 2, opacity: activeIndex < 0 || active ? 0.9 : 0.55 }} />
            </div>
            <div style={{ fontFamily: t.fontBody, fontSize: 10, color: active ? t.ink : t.ink3, letterSpacing: '0.04em', fontWeight: active ? 600 : 500 }}>{d.m}</div>
          </div>
        );
      })}
    </div>
  );
}

// Reusable liquid-glass pill — used for the floating tab bar and any top
// chrome that benefits from a frosted, semi-transparent surface. Matches
// the iOS frame's IOSGlassPill recipe (blur + saturate + inset shine).
function GlassPill({ t, children, style, onClick, height = 44, padding = '0 14px', radius = 999 }) {
  return (
    <button onClick={onClick} style={{
      appearance: 'none', border: 'none',
      height, padding, borderRadius: radius,
      background: t.glassBg,
      WebkitBackdropFilter: 'blur(22px) saturate(180%)',
      backdropFilter: 'blur(22px) saturate(180%)',
      boxShadow: t.glassShadow,
      color: t.ink, cursor: 'pointer',
      display: 'inline-flex', alignItems: 'center', gap: 8,
      fontFamily: 'inherit', fontSize: 13, fontWeight: 500,
      ...style,
    }}>{children}</button>
  );
}

// Bottom tab bar — floating liquid-glass pill with 5 equal tabs. No FAB,
// no center elevation. The Add tab is highlighted with the accent ink colour
// when inactive (still language-neutral, just a primary affordance) so it
// reads as the primary action without breaking the row's rhythm.
function TabBar({ t, active, onChange, bottomInset = 8 }) {
  const stroke = (p) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{p}</svg>;
  const tabs = [
    { id: 'home',  label: 'Home',     icon: stroke(<path d="M3 11l9-7 9 7v9a2 2 0 0 1-2 2h-3v-7H10v7H6a2 2 0 0 1-2-2v-9z"/>) },
    { id: 'txns',  label: 'Ledger',   icon: stroke(<><path d="M5 4h12a2 2 0 0 1 2 2v14l-3-2-3 2-3-2-3 2-3-2V6a2 2 0 0 1 2-2z"/><path d="M9 9h6 M9 13h4"/></>) },
    { id: 'add',   label: 'Add',      icon: stroke(<path d="M12 5v14M5 12h14"/>), primary: true },
    { id: 'accts', label: 'Accounts', icon: stroke(<><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18 M7 15h4"/></>) },
    { id: 'cats',  label: 'Categories', icon: stroke(<><rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/></>) },
  ];
  return (
    <div style={{
      flexShrink: 0,
      padding: `8px 12px ${4 + bottomInset}px`,
    }}>
      <div style={{
        position: 'relative',
        background: t.glassBg,
        WebkitBackdropFilter: 'blur(28px) saturate(180%)',
        backdropFilter: 'blur(28px) saturate(180%)',
        borderRadius: 28,
        padding: 4,
        border: `0.5px solid ${t.glassBorder}`,
        boxShadow: t.glassShadow,
        display: 'flex', alignItems: 'center', gap: 2,
      }}>
        {tabs.map((tab) => {
          const on = active === tab.id;
          const isPrimary = tab.primary;
          return (
            <button key={tab.id} onClick={() => onChange?.(tab.id)} style={{
              flex: 1, height: 50, borderRadius: 22, border: 'none',
              background: on ? t.surface : 'transparent',
              boxShadow: on ? '0 1px 2px rgba(0,0,0,0.08), 0 0 0 0.5px rgba(0,0,0,0.04)' : 'none',
              color: on ? (isPrimary ? t.accent : t.ink) : (isPrimary ? t.accent : t.ink2),
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 1, cursor: 'pointer', padding: 0,
              transition: 'background .15s, color .15s',
            }}>
              {tab.icon}
              <span style={{
                fontFamily: t.fontBody, fontSize: 10, lineHeight: 1.1,
                fontWeight: on ? 600 : 500, letterSpacing: '0.01em',
              }}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Surface card primitive.
function Card({ t, children, style, pad = 16, soft = false }) {
  return (
    <div style={{
      background: soft ? t.sunken : t.surface,
      borderRadius: t.radiusL,
      border: `1px solid ${t.border}`,
      padding: pad,
      ...style,
    }}>{children}</div>
  );
}

// ─────────────────────────────────────────────────────────────
// Screen 1 — Dashboard
// ─────────────────────────────────────────────────────────────
function ScreenDashboard({ t, state }) {
  const m = MONTH_SUMMARY;
  const delta = m.out - PREV_MONTH.out;
  const monthOpen = state === 'month-picker';
  return (
    <div style={{ background: t.page, minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <TopBar t={t} title="Rupiverse" trailing={
        <div style={{ position: 'relative' }}>
          <button style={{
            background: monthOpen ? t.accent : t.surface,
            border: `1px solid ${monthOpen ? t.accent : t.border}`,
            color: monthOpen ? t.accentInk : t.ink,
            borderRadius: 999, padding: '6px 10px 6px 12px',
            display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
            fontFamily: t.fontBody, fontSize: 13, fontWeight: 500,
          }}>
            May 2026
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" style={{ transform: monthOpen ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }}><path d="M2 4l3 3 3-3"/></svg>
          </button>
          {monthOpen && <MonthPickerDropdown t={t} />}
        </div>
      } />

      <div style={{ padding: '14px 16px 24px', display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>

        {/* Headline numbers card with subtle Deva accent in background */}
        <Card t={t} pad={20} style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: -14, top: -32, pointerEvents: 'none' }}>
            <DevaGlyph char="ख" theme={t} size={150} opacity={0.05} />
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{ fontFamily: t.fontBody, fontSize: 11.5, color: t.ink3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Net this month</div>
            <BigAmount t={t} value={m.net} size={42} color={t.positive} />
            <div style={{ display: 'flex', gap: 18, marginTop: 18, paddingTop: 16, borderTop: `1px solid ${t.border}` }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: t.fontBody, fontSize: 10.5, color: t.ink3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>In</div>
                <div style={{ fontFamily: t.fontDisplay, fontSize: 18, color: t.ink, fontWeight: t.displayWeight, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>{fmtINR(m.in)}</div>
              </div>
              <div style={{ width: 1, background: t.border }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: t.fontBody, fontSize: 10.5, color: t.ink3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Out</div>
                <div style={{ fontFamily: t.fontDisplay, fontSize: 18, color: t.ink, fontWeight: t.displayWeight, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>{fmtINR(m.out)}</div>
                <div style={{ fontFamily: t.fontBody, fontSize: 11, color: delta < 0 ? t.positive : t.negative, marginTop: 2 }}>
                  {delta < 0 ? '↓' : '↑'} {fmtINR(Math.abs(delta), { compact: true })} vs apr
                </div>
              </div>
            </div>
            <div style={{ fontFamily: t.fontBody, fontSize: 10.5, color: t.ink3, marginTop: 10, fontStyle: 'italic' }}>
              Transfers between your accounts (₹{fmtAmount(m.transfersExcluded)}) excluded.
            </div>
          </div>
        </Card>

        {/* Spend by category donut — the whole card is clickable, opens Graph Detail */}
        <Card t={t} pad={18} style={{ cursor: 'pointer', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <div style={{ fontFamily: t.fontDisplay, fontSize: 15, color: t.ink, fontWeight: t.displayWeight }}>Where it went</div>
              <div style={{ fontFamily: t.fontBody, fontSize: 11.5, color: t.ink3, marginTop: 2 }}>Tap to compare across timeframes</div>
            </div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: t.accent, fontFamily: t.fontBody, fontSize: 12, fontWeight: 600 }}>
              Breakdown
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 2l4 4-4 4"/></svg>
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <Donut t={t} segments={SPEND_BY_CATEGORY} size={150} thickness={16}
              activeIndex={2}
              centerLabel="Spent" centerValue={fmtINR(m.out, { compact: true })} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
              {SPEND_BY_CATEGORY.slice(0, 5).map((s, i) => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: s.color, flexShrink: 0, opacity: i === 2 ? 1 : 0.55 }} />
                  <span style={{ flex: 1, fontFamily: t.fontBody, fontSize: 12, color: i === 2 ? t.ink : t.ink, fontWeight: i === 2 ? 600 : 500 }}>{s.name}</span>
                  <span style={{ fontFamily: t.fontBody, fontSize: 11.5, color: t.ink2, fontVariantNumeric: 'tabular-nums' }}>{Math.round(s.amount / m.out * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Trend — card-tappable: opens Graph Detail with the same data. */}
        <Card t={t} pad={18} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <div style={{ fontFamily: t.fontDisplay, fontSize: 15, color: t.ink, fontWeight: t.displayWeight }}>6-month flow</div>
              <div style={{ fontFamily: t.fontBody, fontSize: 11.5, color: t.ink3, marginTop: 2 }}>Tap a bar for the daily breakdown</div>
            </div>
            <div style={{ display: 'flex', gap: 12, fontFamily: t.fontBody, fontSize: 11, color: t.ink2 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: t.positive }}/>In</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: t.accent }}/>Out</span>
            </div>
          </div>
          <TrendBars t={t} data={TREND} activeIndex={5} />
        </Card>

        {/* Top merchants */}
        <Card t={t} pad={0}>
          <div style={{ padding: '16px 18px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontFamily: t.fontDisplay, fontSize: 15, color: t.ink, fontWeight: t.displayWeight }}>Top this month</div>
            <span style={{ fontFamily: t.fontBody, fontSize: 11, color: t.ink3 }}>by amount</span>
          </div>
          {TOP_MERCHANTS.slice(0, 4).map((m, i) => {
            const cat = CAT_BY_ID[m.cat];
            const root = catRoot(m.cat);
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 18px',
                borderTop: i === 0 ? `1px solid ${t.border}` : `1px solid ${t.border}`,
              }}>
                <CatBadge cat={cat} t={t} size={32} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: t.fontBody, fontSize: 14, color: t.ink, fontWeight: 500 }}>{m.name}</div>
                  <div style={{ fontFamily: t.fontBody, fontSize: 11.5, color: t.ink3, marginTop: 1 }}>
                    {m.count}× · {root?.name || ''}
                  </div>
                </div>
                <div style={{ fontFamily: t.fontDisplay, fontSize: 14, color: t.ink, fontWeight: t.displayWeight, fontVariantNumeric: 'tabular-nums' }}>{fmtINR(m.amount, { compact: true })}</div>
              </div>
            );
          })}
        </Card>

        {/* Accounts strip — horizontal scroll */}
        <div>
          <div style={{ padding: '0 4px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ fontFamily: t.fontDisplay, fontSize: 15, color: t.ink, fontWeight: t.displayWeight }}>Accounts</div>
            <span style={{ fontFamily: t.fontBody, fontSize: 11, color: t.ink3 }}>5 linked</span>
          </div>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
            {ACCOUNTS.map((a) => {
              const isCard = a.type === 'credit_card';
              return (
                <div key={a.id} style={{
                  minWidth: 168, padding: '14px 14px 12px',
                  borderRadius: t.radiusM,
                  background: isCard ? t.ink : t.surface,
                  color: isCard ? t.inkInverse : t.ink,
                  border: `1px solid ${isCard ? 'transparent' : t.border}`,
                  display: 'flex', flexDirection: 'column', gap: 4,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: t.fontBody, fontSize: 11, opacity: isCard ? 0.7 : 1, color: isCard ? t.inkInverse : t.ink3, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{a.short}</span>
                    <span style={{ fontFamily: t.fontMono, fontSize: 10, opacity: 0.55 }}>•• {a.last4}</span>
                  </div>
                  <div style={{ fontFamily: t.fontBody, fontSize: 12, opacity: 0.85 }}>{a.name.replace(a.short + ' ', '').replace('HDFC ', '')}</div>
                  <div style={{ fontFamily: t.fontDisplay, fontSize: 18, fontWeight: t.displayWeight, fontVariantNumeric: 'tabular-nums', marginTop: 4 }}>{fmtINR(a.balance)}</div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Screen 2 — Add Transaction
// The hero: amount-first entry with AI category chip below merchant.
// ─────────────────────────────────────────────────────────────
function ScreenAdd({ t, bottomInset = 0, initialType = 'expense', state }) {
  // Category-area sub-state, derived from the section's `state`:
  //   memory      → known merchant, category filled instantly (no AI call)
  //   autocomplete→ merchant field focused, suggestion dropdown open
  //   ai-idle     → new merchant, "Categorize with AI" button shown
  //   ai-loading  → AI call in flight
  //   ai-suggested→ editable suggestion chip returned by the model
  const aiState = ['autocomplete', 'ai-idle', 'ai-loading', 'ai-suggested'].includes(state) ? state : 'memory';
  const newMerchant = aiState === 'autocomplete' ? 'Swi' : (aiState === 'memory' ? null : 'Third Wave Coffee');

  const [amount, setAmount] = React.useState(initialType === 'transfer' ? '20000' : (aiState === 'autocomplete' ? '0' : aiState !== 'memory' ? '260' : '1280'));
  const [type, setType] = React.useState(initialType);
  const [merchant, setMerchant] = React.useState(
    newMerchant != null ? newMerchant : (initialType === 'income' ? 'Aishwarya' : 'Zomato'));
  const [note, setNote] = React.useState(initialType === 'income' ? 'her share, dinner' : (aiState !== 'memory' ? '' : 'paradise biryani x2'));
  const [tags, setTags] = React.useState(initialType === 'income' ? ['reimburse'] : (aiState !== 'memory' ? [] : ['weekend']));
  const [fromAcc, setFromAcc] = React.useState('a1');
  const [toAcc, setToAcc] = React.useState('a3');

  const press = (k) => {
    setAmount((a) => {
      if (k === 'del') return a.slice(0, -1) || '0';
      if (k === '.') return a.includes('.') ? a : a + '.';
      if (a === '0' && k !== '.') return k;
      if (a.length >= 8) return a;
      return a + k;
    });
  };
  const num = parseFloat(amount) || 0;

  return (
    <div style={{ background: t.page, minHeight: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Top bar — Cancel + centered logo+title. No top-right Save: the primary
          Save sits on the keypad as the source of truth. */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px 8px' }}>
        <button style={{ background: 'transparent', border: 'none', color: t.ink2, fontFamily: t.fontBody, fontSize: 15, cursor: 'pointer', padding: '4px 0', width: 70, textAlign: 'left' }}>Cancel</button>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
          <Logo theme={t} variant="mark" size={20} />
          <span style={{ fontFamily: t.fontDisplay, fontSize: 15.5, color: t.ink, fontWeight: t.displayWeight }}>New {type === 'transfer' ? 'transfer' : type === 'income' ? 'income' : 'expense'}</span>
        </div>
        <div style={{ width: 70 }} />
      </div>

      {/* Type segmented control */}
      <div style={{ padding: '6px 16px 0' }}>
        <div style={{ background: t.sunken, borderRadius: 999, padding: 3, display: 'flex' }}>
          {['expense', 'income', 'transfer'].map((k) => (
            <button key={k} onClick={() => setType(k)} style={{
              flex: 1, height: 32, borderRadius: 999, border: 'none',
              background: type === k ? t.surface : 'transparent',
              boxShadow: type === k ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              color: type === k ? t.ink : t.ink2,
              fontFamily: t.fontBody, fontSize: 13, fontWeight: type === k ? 600 : 500,
              textTransform: 'capitalize', cursor: 'pointer',
            }}>{k}</button>
          ))}
        </div>
      </div>

      {/* Big amount display */}
      <div style={{
        padding: '24px 20px 12px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>
        <BigAmount t={t} value={num} size={56} color={type === 'income' ? t.positive : type === 'transfer' ? t.ink2 : t.ink} />
        <div style={{ fontFamily: t.fontBody, fontSize: 11.5, color: t.ink3, marginTop: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{type === 'income' ? 'Money in' : type === 'transfer' ? 'Internal transfer · not income or spend' : 'Money out'}</div>
      </div>

      {/* Body — different for transfer vs expense/income */}
      {type === 'transfer' ? (
        <div style={{ padding: '8px 16px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* From / To selector pair */}
          <div style={{
            background: t.surface, border: `1px solid ${t.border}`,
            borderRadius: t.radiusM, overflow: 'hidden',
          }}>
            {[
              { label: 'From', value: fromAcc, set: setFromAcc, active: state === 'account-picker' },
              { label: 'To',   value: toAcc,   set: setToAcc, active: false },
            ].map((row, i) => {
              const a = ACCOUNTS.find((x) => x.id === row.value);
              return (
                <div key={row.label} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 14px',
                  borderTop: i > 0 ? `1px solid ${t.border}` : 'none',
                  background: row.active ? t.accentSoft : 'transparent',
                  position: 'relative',
                }}>
                  <span style={{
                    fontFamily: t.fontBody, fontSize: 11, color: t.ink3,
                    textTransform: 'uppercase', letterSpacing: '0.06em', width: 38,
                  }}>{row.label}</span>
                  <div style={{
                    width: 28, height: 28, borderRadius: 7,
                    background: a.color, color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: t.fontDisplay, fontSize: 11, fontWeight: 700,
                  }}>{a.short.slice(0, 2).toUpperCase()}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: t.fontBody, fontSize: 14, color: t.ink, fontWeight: 600 }}>{a.name}</div>
                    <div style={{ fontFamily: t.fontMono, fontSize: 11, color: t.ink3 }}>•••• {a.last4} · {fmtINR(a.balance, { compact: true })}</div>
                  </div>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke={t.ink3} strokeWidth="1.6" strokeLinecap="round" style={{ transform: row.active ? 'rotate(180deg)' : 'none' }}><path d="M3 5l3 3 3-3"/></svg>
                </div>
              );
            })}
          </div>

          {/* Microcopy */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 12px', borderRadius: t.radiusS,
            background: t.sunken, border: `1px solid ${t.border}`,
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={t.ink2} strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="5.5"/><path d="M7 4v3.5l2 1.5"/></svg>
            <span style={{ fontFamily: t.fontBody, fontSize: 12, color: t.ink2, flex: 1 }}>
              Transfers update both balances but stay out of your income & spending totals.
            </span>
          </div>

          {/* Note + tags — same shape as expense */}
          <NoteField t={t} value={"IMPS transfer"} placeholder="Add a note…" />
          <TagRow t={t} tags={['recurring']} highlighted={state === 'tag-dialog'} />
          <ContextChips t={t} hideAccount />
        </div>
      ) : (
        <div style={{ padding: '8px 16px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ position: 'relative' }}>
            <div style={{ fontFamily: t.fontBody, fontSize: 11, color: t.ink3, marginBottom: 4, marginLeft: 14, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Merchant</div>
            <input value={merchant} onChange={(e) => setMerchant(e.target.value)} style={{
              width: '100%', height: 44, padding: '0 14px',
              background: t.surface, border: `1px solid ${aiState === 'autocomplete' ? t.accent : t.borderStrong}`,
              borderRadius: t.radiusM, color: t.ink, boxSizing: 'border-box',
              fontFamily: t.fontBody, fontSize: 15, outline: 'none',
              boxShadow: aiState === 'autocomplete' ? `0 0 0 3px ${t.accent}20` : 'none',
            }} />
            {/* Merchant autocomplete — always on, plain DB lookup, no model. */}
            {aiState === 'autocomplete' && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 12,
                background: t.surface, border: `1px solid ${t.border}`, borderRadius: t.radiusM,
                boxShadow: '0 10px 30px rgba(0,0,0,0.16)', overflow: 'hidden',
              }}>
                {[['Swiggy', 'Food → Food delivery'], ['Swiggy Instamart', 'Food → Groceries'], ['Swiggy Dineout', 'Food → Dining out']].map(([m, c], i) => (
                  <div key={m} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                    borderTop: i > 0 ? `1px solid ${t.border}` : 'none',
                  }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={t.ink3} strokeWidth="2" strokeLinecap="round"><path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4"/></svg>
                    <span style={{ flex: 1, fontFamily: t.fontBody, fontSize: 14, color: t.ink }}>
                      <HighlightedText text={m} query="Swi" t={t} />
                    </span>
                    <span style={{ fontFamily: t.fontBody, fontSize: 11, color: t.ink3 }}>{c}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Category — manual + on-demand AI. Known merchants fill instantly
              from merchant-memory; new ones offer a "Categorize with AI" button. */}
          <CategoryField t={t} type={type} aiState={aiState} />

          <NoteField t={t} value={note} onChange={setNote} placeholder="Add a note (optional)…" />
          <TagRow t={t} tags={tags} highlighted={state === 'tag-dialog'} />
          <ContextChips t={t} type={type} />
        </div>
      )}

      {/* Numeric keypad */}
      <div style={{ flex: 1 }} />
      <div style={{ padding: `12px 12px ${12 + bottomInset}px`, background: t.sunken, borderTop: `1px solid ${t.border}` }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {['1','2','3','4','5','6','7','8','9','.','0','del'].map((k) => (
            <button key={k} onClick={() => press(k)} style={{
              height: 48, borderRadius: t.radiusM, border: 'none',
              background: t.surface, color: t.ink,
              fontFamily: t.fontDisplay, fontSize: 22, fontWeight: t.displayWeight,
              cursor: 'pointer', boxShadow: '0 1px 0 rgba(0,0,0,0.04)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {k === 'del' ? (
                <svg width="20" height="16" viewBox="0 0 24 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M8 1h13a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H8L1 9zM12 5l6 8M18 5l-6 8"/></svg>
              ) : k}
            </button>
          ))}
        </div>
        <button style={{
          width: '100%', height: 50, marginTop: 10,
          background: t.accent, color: t.accentInk, border: 'none', borderRadius: t.radiusM,
          fontFamily: t.fontDisplay, fontSize: 16, fontWeight: 600, letterSpacing: '0.01em',
          cursor: 'pointer',
        }}>{type === 'transfer' ? 'Transfer' : 'Save'} · {fmtINR(num)}</button>
      </div>

      {/* Overlays */}
      {state === 'tag-dialog' && <TagDialog t={t} selected={tags} />}
      {state === 'account-picker' && <AccountPickerSheet t={t} selected={fromAcc} />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Screen 3 — Transactions list  (states: default | searching |
// filter-open | filter-applied | empty-first | empty-nomatch)
// ─────────────────────────────────────────────────────────────
function ScreenTransactions({ t, state = 'default' }) {
  const isSearching     = state === 'searching';
  const isFilterOpen    = state === 'filter-open';
  const isFilterApplied = state === 'filter-applied';
  const isEmptyFirst    = state === 'empty-first';
  const isEmptyNoMatch  = state === 'empty-nomatch';
  const isEmpty         = isEmptyFirst || isEmptyNoMatch;

  // When "searching", pretend the query is "swi" — filter the list.
  const query = isSearching ? 'swi' : '';
  // When "filter-applied", show only food sub-tree under Axis account.
  const filteredTxns = React.useMemo(() => {
    let xs = TRANSACTIONS;
    if (isSearching) xs = xs.filter((x) =>
      (x.merchant + ' ' + (x.note || '')).toLowerCase().includes(query));
    if (isFilterApplied) xs = xs.filter((x) =>
      catRoot(x.cat)?.id === 'food' && x.account === 'a3');
    return xs;
  }, [isSearching, isFilterApplied]);

  const groups = {};
  for (const tx of filteredTxns) (groups[tx.when] = groups[tx.when] || []).push(tx);
  const groupKeys = Object.keys(groups);
  const total = filteredTxns.filter((x) => x.type === 'expense').reduce((s, x) => s + x.amount, 0);

  // Trailing icons for the top bar.
  const trailing = !isSearching ? (
    <>
      <IconBtn t={t}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
      </IconBtn>
      <IconBtn t={t}>
        <span style={{ position: 'relative' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5h16l-6 8v6l-4-2v-4z"/></svg>
          {isFilterApplied && <span style={{
            position: 'absolute', top: -2, right: -3,
            width: 10, height: 10, borderRadius: 5, background: t.accent,
            border: `2px solid ${t.page}`,
          }} />}
        </span>
      </IconBtn>
    </>
  ) : null;

  return (
    <div style={{ background: t.page, minHeight: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {isSearching ? (
        <SearchTopBar t={t} query={query} />
      ) : (
        <TopBar t={t} title="Ledger" trailing={trailing} />
      )}

      {/* Active-filter chip row — only when filters are applied (no static
          "All categories" / "All accounts" decoy pills). */}
      {isFilterApplied && (
        <div style={{ padding: '12px 16px 0', display: 'flex', gap: 8, overflowX: 'auto' }}>
          <Chip t={t} active>This month</Chip>
          <Chip t={t} active>Food <span style={{ opacity: 0.7, marginLeft: 4 }}>×</span></Chip>
          <Chip t={t} active>Axis · 1102 <span style={{ opacity: 0.7, marginLeft: 4 }}>×</span></Chip>
          <button style={{
            background: 'transparent', border: 'none', color: t.ink3,
            fontFamily: t.fontBody, fontSize: 12, cursor: 'pointer', padding: '0 8px',
          }}>Clear</button>
        </div>
      )}

      {!isEmpty && (
        <div style={{ padding: '14px 20px 8px' }}>
          <div style={{ fontFamily: t.fontBody, fontSize: 11.5, color: t.ink3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {isSearching
              ? `${filteredTxns.length} match${filteredTxns.length === 1 ? '' : 'es'} for "${query}"`
              : isFilterApplied
                ? `${filteredTxns.length} of ${TRANSACTIONS.length} \u00b7 filtered`
                : `${filteredTxns.length} transactions \u00b7 this month`}
          </div>
          <BigAmount t={t} value={total} size={32} />
        </div>
      )}

      {/* Body — list, empty state, or nothing (when filter sheet is open). */}
      {isEmptyFirst && <EmptyState t={t} kind="first-time" />}
      {isEmptyNoMatch && <EmptyState t={t} kind="no-matches" />}

      {!isEmpty && (
        <div style={{ flex: 1, padding: '4px 0 20px' }}>
          {groupKeys.map((gk) => {
            const items = groups[gk];
            const dayTotal = items.filter((x) => x.type === 'expense').reduce((s, x) => s + x.amount, 0);
            return (
              <div key={gk}>
                <div style={{
                  padding: '14px 20px 6px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
                }}>
                  <span style={{ fontFamily: t.fontDisplay, fontSize: 12, color: t.ink2, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{gk}</span>
                  <span style={{ fontFamily: t.fontMono, fontSize: 11, color: t.ink3, fontVariantNumeric: 'tabular-nums' }}>−{fmtINR(dayTotal, { compact: true })}</span>
                </div>
                {items.map((tx) => <TxnRow key={tx.id} t={t} tx={tx} query={query} />)}
              </div>
            );
          })}
        </div>
      )}

      {/* Filter bottom sheet overlay */}
      {isFilterOpen && <FilterSheet t={t} />}
    </div>
  );
}

// Extracted transaction row so empty/search states can reuse it.
function TxnRow({ t, tx, query }) {
  const cat = CAT_BY_ID[tx.cat];
  const root = catRoot(tx.cat);
  const account = ACCOUNTS.find((a) => a.id === tx.account);
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px 20px', background: t.page,
    }}>
      <CatBadge cat={cat} t={t} size={38} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontFamily: t.fontBody, fontSize: 14.5, color: t.ink, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {query ? <HighlightedText text={tx.merchant} query={query} t={t} /> : tx.merchant}
          </span>
          {tx.ai && (
            <span title="AI categorized" style={{
              fontFamily: t.fontBody, fontSize: 9, color: t.accent,
              background: t.accentSoft, padding: '1px 5px', borderRadius: 4,
              fontWeight: 600, letterSpacing: '0.04em',
            }}>AI</span>
          )}
          {tx.recurring && (
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke={t.ink3} strokeWidth="1.4" strokeLinecap="round"><path d="M2 5v-1a1 1 0 0 1 1-1h6l-1.5-1.5 M10 7v1a1 1 0 0 1-1 1h-6l1.5 1.5"/></svg>
          )}
        </div>
        <div style={{ fontFamily: t.fontBody, fontSize: 11.5, color: t.ink3, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {(cat && cat.id !== root.id) ? `${root.name} › ${cat.name}` : root?.name} · {account?.short} · {tx.method.replace('_', ' ')}
        </div>
      </div>
      <div style={{
        fontFamily: t.fontDisplay, fontSize: 15, fontWeight: t.displayWeight,
        color: tx.type === 'income' ? t.positive : t.ink,
        fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap',
      }}>{(tx.type === 'income' ? '+' : '\u2212') + fmtINR(tx.amount)}</div>
    </div>
  );
}

// Highlight matched substring in a search result.
function HighlightedText({ text, query, t }) {
  const i = text.toLowerCase().indexOf(query.toLowerCase());
  if (i < 0) return text;
  return (
    <>
      {text.slice(0, i)}
      <span style={{ background: t.accent + '30', color: t.ink, borderRadius: 3, padding: '0 1px' }}>{text.slice(i, i + query.length)}</span>
      {text.slice(i + query.length)}
    </>
  );
}

// Top bar variant for the active-search state — replaces title with an input.
function SearchTopBar({ t, query }) {
  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 2,
      background: t.page,
      padding: '10px 12px 10px',
      display: 'flex', alignItems: 'center', gap: 8,
      borderBottom: `1px solid ${t.border}`,
    }}>
      <div style={{
        flex: 1, height: 36, padding: '0 12px',
        background: t.sunken, borderRadius: 999,
        display: 'flex', alignItems: 'center', gap: 8,
        border: `1px solid ${t.accent}`,
        boxShadow: `0 0 0 3px ${t.accent}20`,
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={t.ink2} strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
        <span style={{ flex: 1, fontFamily: t.fontBody, fontSize: 14, color: t.ink }}>
          {query}<span style={{ display: 'inline-block', width: 1.5, height: 16, background: t.accent, marginLeft: 1, verticalAlign: 'text-bottom', animation: 'none' }} />
        </span>
        <button style={{ background: 'transparent', border: 'none', color: t.ink3, padding: 0, cursor: 'pointer' }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="7" cy="7" r="6"/><path d="M5 5l4 4M9 5l-4 4"/></svg>
        </button>
      </div>
      <button style={{
        background: 'transparent', border: 'none', color: t.accent,
        fontFamily: t.fontBody, fontSize: 14, fontWeight: 500, cursor: 'pointer',
        padding: '4px 6px',
      }}>Cancel</button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Screen 4 — Accounts
// ─────────────────────────────────────────────────────────────
function ScreenAccounts({ t }) {
  const netWorth = ACCOUNTS.reduce((s, a) => s + a.balance, 0);
  return (
    <div style={{ background: t.page, minHeight: '100%' }}>
      <TopBar t={t} title="Accounts"
        leading={<IconBtn t={t}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 6l-6 6 6 6"/></svg></IconBtn>}
        trailing={<IconBtn t={t}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg></IconBtn>}
      />

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Net worth card */}
        <Card t={t} pad={20} style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: -20, bottom: -40, pointerEvents: 'none' }}>
            <DevaGlyph char="ता" theme={t} size={160} opacity={0.05} />
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{ fontFamily: t.fontBody, fontSize: 11.5, color: t.ink3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total balance</div>
            <BigAmount t={t} value={netWorth} size={38} />
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <button style={{
                flex: 1, height: 38, borderRadius: t.radiusM, border: `1px solid ${t.borderStrong}`,
                background: t.surface, color: t.ink, fontFamily: t.fontBody, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }} title="Opens Add → Transfer">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M2 5h10M9 2l3 3-3 3 M12 9H2M5 12L2 9l3-3"/></svg>
                Transfer between
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke={t.ink3} strokeWidth="1.6" strokeLinecap="round"><path d="M3 1l4 4-4 4"/></svg>
              </button>
              <button style={{
                flex: 1, height: 38, borderRadius: t.radiusM, border: `1px solid ${t.borderStrong}`,
                background: t.surface, color: t.ink, fontFamily: t.fontBody, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M3 8l-2 4h12l-2-4 M7 1v8M4 6l3 3 3-3"/></svg>
                Import
              </button>
            </div>
          </div>
        </Card>

        {/* Accounts list */}
        {ACCOUNTS.map((a) => {
          const isCard = a.type === 'credit_card';
          const flow = a.monthIn - a.monthOut;
          return (
            <div key={a.id} style={{
              background: t.surface,
              border: `1px solid ${t.border}`,
              borderRadius: t.radiusL,
              padding: 16,
              display: 'flex', flexDirection: 'column', gap: 12,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: a.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontFamily: t.fontDisplay, fontWeight: 700, fontSize: 13, letterSpacing: '0.02em',
                  flexShrink: 0,
                }}>{a.short.slice(0, 2).toUpperCase()}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: t.fontBody, fontSize: 14.5, color: t.ink, fontWeight: 600 }}>{a.name}</div>
                  <div style={{ fontFamily: t.fontMono, fontSize: 11, color: t.ink3, marginTop: 2 }}>•••• {a.last4} · <span style={{ textTransform: 'capitalize' }}>{a.type.replace('_', ' ')}</span></div>
                </div>
                <div style={{
                  fontFamily: t.fontDisplay, fontSize: 17, fontWeight: t.displayWeight,
                  color: a.balance < 0 ? t.negative : t.ink, fontVariantNumeric: 'tabular-nums',
                }}>{fmtINR(a.balance)}</div>
              </div>

              {(a.monthIn || a.monthOut) > 0 && (
                <div style={{ paddingTop: 10, borderTop: `1px solid ${t.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                    <span style={{ fontFamily: t.fontBody, fontSize: 10.5, color: t.ink3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>This month</span>
                    <div style={{ display: 'flex', gap: 10, fontFamily: t.fontMono, fontSize: 11, fontVariantNumeric: 'tabular-nums' }}>
                      {a.monthIn > 0 && <span style={{ color: t.positive }}>+{fmtINR(a.monthIn, { compact: true })}</span>}
                      {a.monthOut > 0 && <span style={{ color: t.ink2 }}>−{fmtINR(a.monthOut, { compact: true })}</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <div style={{ height: 4, background: t.sunken, borderRadius: 2, overflow: 'hidden' }}>
                      {a.monthIn > 0 && <div style={{ width: `${Math.min(100, a.monthIn / Math.max(a.monthIn, a.monthOut) * 100)}%`, height: '100%', background: t.positive }} />}
                    </div>
                    <div style={{ height: 4, background: t.sunken, borderRadius: 2, overflow: 'hidden' }}>
                      {a.monthOut > 0 && <div style={{ width: `${Math.min(100, a.monthOut / Math.max(a.monthIn, a.monthOut) * 100)}%`, height: '100%', background: isCard ? t.negative : t.accent }} />}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Screen 5 — Categories
// ─────────────────────────────────────────────────────────────
function ScreenCategories({ t }) {
  const [tab, setTab] = React.useState('expense');
  const [expanded, setExpanded] = React.useState({ food: true, subs: true });

  function renderNode(c, depth = 0) {
    const hasKids = c.children && c.children.length;
    const isOpen = expanded[c.id];
    const root = catRoot(c.id) || c;
    const spend = c.spend ?? (c.children ? c.children.reduce((s, x) => s + (x.spend || 0) + (x.children ? x.children.reduce((s2, y) => s2 + (y.spend || 0), 0) : 0), 0) : 0);
    const count = c.count ?? (c.children ? c.children.reduce((s, x) => s + (x.count || 0) + (x.children ? x.children.reduce((s2, y) => s2 + (y.count || 0), 0) : 0), 0) : 0);
    return (
      <div key={c.id}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '11px 20px',
          paddingLeft: 20 + depth * 22,
          background: t.page,
          borderBottom: `1px solid ${t.border}`,
        }}>
          {hasKids ? (
            <button onClick={() => setExpanded((e) => ({ ...e, [c.id]: !e[c.id] }))}
              style={{
                width: 18, height: 18, border: 'none', background: 'transparent', cursor: 'pointer',
                color: t.ink3, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
              <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform .15s' }}>
                <path d="M3 1l4 4-4 4"/>
              </svg>
            </button>
          ) : <div style={{ width: 18, flexShrink: 0 }} />}
          {depth === 0 ? (
            <CatBadge cat={c} t={t} size={32} />
          ) : (
            <div style={{ width: 18, height: 18, borderRadius: 5, background: root.swatch + '20', border: `1px solid ${root.swatch}40`, flexShrink: 0 }} />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: t.fontBody, fontSize: depth === 0 ? 14.5 : 13.5,
              color: t.ink, fontWeight: depth === 0 ? 600 : 500,
            }}>{c.name}</div>
            {depth === 0 && count > 0 && (
              <div style={{ fontFamily: t.fontBody, fontSize: 11, color: t.ink3, marginTop: 1 }}>{count} this month</div>
            )}
          </div>
          <div style={{
            fontFamily: t.fontDisplay, fontSize: 13.5, color: t.ink2,
            fontVariantNumeric: 'tabular-nums', fontWeight: depth === 0 ? t.displayWeight : 400,
          }}>{spend > 0 ? fmtINR(spend, { compact: true }) : '—'}</div>
        </div>
        {hasKids && isOpen && c.children.map((k) => renderNode(k, depth + 1))}
      </div>
    );
  }

  return (
    <div style={{ background: t.page, minHeight: '100%' }}>
      <TopBar t={t} title="Categories"
        leading={<IconBtn t={t}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 6l-6 6 6 6"/></svg></IconBtn>}
        trailing={<IconBtn t={t}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg></IconBtn>}
      />

      {/* Tabs */}
      <div style={{ padding: '12px 16px 0' }}>
        <div style={{ background: t.sunken, borderRadius: 999, padding: 3, display: 'flex' }}>
          {[{ k: 'expense', l: 'Expense', n: CATEGORIES.length },
            { k: 'income',  l: 'Income',  n: INCOME_CATEGORIES.length }].map((x) => (
            <button key={x.k} onClick={() => setTab(x.k)} style={{
              flex: 1, height: 32, borderRadius: 999, border: 'none',
              background: tab === x.k ? t.surface : 'transparent',
              boxShadow: tab === x.k ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              color: tab === x.k ? t.ink : t.ink2,
              fontFamily: t.fontBody, fontSize: 13, fontWeight: tab === x.k ? 600 : 500,
              cursor: 'pointer',
            }}>{x.l} <span style={{ color: t.ink3, fontWeight: 400, marginLeft: 4 }}>{x.n}</span></button>
          ))}
        </div>
      </div>

      {/* Headline glyph + meta */}
      <div style={{ padding: '16px 20px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: t.fontDisplay, fontSize: 13, color: t.ink2, fontWeight: 600 }}>Tree</div>
          <div style={{ fontFamily: t.fontBody, fontSize: 11.5, color: t.ink3, marginTop: 1 }}>Tap a node to drill in · drag to reorder</div>
        </div>
        <button style={{
          background: 'transparent', border: `1px solid ${t.border}`, borderRadius: 999,
          padding: '5px 12px', cursor: 'pointer',
          fontFamily: t.fontBody, fontSize: 12, color: t.ink, fontWeight: 500,
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M6 2v8M2 6h8"/></svg>
          New
        </button>
      </div>

      {/* The tree */}
      <div>
        {tab === 'expense'
          ? CATEGORIES.map((c) => renderNode(c, 0))
          : INCOME_CATEGORIES.map((c) => (
              <div key={c.id} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '11px 20px',
                borderBottom: `1px solid ${t.border}`,
              }}>
                <div style={{ width: 18 }} />
                <div style={{
                  width: 32, height: 32, borderRadius: 9,
                  background: c.swatch + '20', border: `1px solid ${c.swatch}40`,
                  color: c.swatch, fontFamily: t.fontDeva, fontSize: 16,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>{c.glyph}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: t.fontBody, fontSize: 14.5, color: t.ink, fontWeight: 600 }}>{c.name}</div>
                  <div style={{ fontFamily: t.fontBody, fontSize: 11, color: t.ink3, marginTop: 1 }}>{c.count} this month</div>
                </div>
                <div style={{ fontFamily: t.fontDisplay, fontSize: 13.5, color: t.positive, fontVariantNumeric: 'tabular-nums', fontWeight: t.displayWeight }}>
                  +{fmtINR(c.total, { compact: true })}
                </div>
              </div>
            ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Top-level RupiverseScreen — picks a screen + attaches tab bar (most screens)
// ─────────────────────────────────────────────────────────────
function RupiverseScreen({ which, themeKey = 'calm', platform = 'ios', initialType, state }) {
  const t = useTheme(themeKey);
  const insetTop = platform === 'ios' ? 56 : 0;
  const insetBottom = platform === 'ios' ? 22 : 8;

  const map = {
    home:  { Comp: ScreenDashboard,     tab: 'home',  showTabs: true  },
    add:   { Comp: ScreenAdd,           tab: 'add',   showTabs: false },
    txns:  { Comp: ScreenTransactions,  tab: 'txns',  showTabs: true  },
    accts: { Comp: ScreenAccounts,      tab: 'accts', showTabs: true  },
    cats:  { Comp: ScreenCategories,    tab: 'cats',  showTabs: true  },
    graph: { Comp: ScreenGraphDetail,   tab: 'home',  showTabs: false },
    // Auth screens — full-bleed, no tab bar. variant passed through.
    login:           { Comp: (p) => <AuthScreen {...p} variant="login" />,          showTabs: false, auth: true },
    signup:          { Comp: (p) => <AuthScreen {...p} variant="signup" />,         showTabs: false, auth: true },
    'signup-invalid':{ Comp: (p) => <AuthScreen {...p} variant="signup-invalid" />, showTabs: false, auth: true },
    otp:             { Comp: (p) => <AuthScreen {...p} variant="otp" />,            showTabs: false, auth: true },
    forgot:          { Comp: (p) => <AuthScreen {...p} variant="forgot" />,         showTabs: false, auth: true },
    'forgot-otp':    { Comp: (p) => <AuthScreen {...p} variant="forgot-otp" />,     showTabs: false, auth: true },
    reset:           { Comp: (p) => <AuthScreen {...p} variant="reset" />,          showTabs: false, auth: true },
  };
  const cfg = map[which] || map.home;
  const { Comp, tab, showTabs } = cfg;
  return (
    <div style={{
      width: '100%', height: '100%',
      background: t.page, color: t.ink,
      fontFamily: t.fontBody,
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      {insetTop > 0 && <div style={{ height: insetTop, background: t.page, flexShrink: 0 }} />}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', minHeight: 0 }}>
        <Comp t={t} bottomInset={!showTabs ? insetBottom : 0} initialType={initialType} state={state} />
      </div>
      {showTabs && <TabBar t={t} active={tab} bottomInset={insetBottom} />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Screen 6 — Graph Detail
// Opens from the Dashboard's "Where it went" card or the trend chart.
// Apple-Health-style time-frame selector + interactive chart + breakdown.
// ─────────────────────────────────────────────────────────────
function ScreenGraphDetail({ t, state }) {
  // Default = monthly, with day 13 (rent day) selected to make the
  // tooltip meaningful. ?state can swap the time frame.
  const initialFrame = state === 'week' ? 'W' : state === 'sixmo' ? '6M' : state === 'year' ? 'Y' : 'M';
  const [frame, setFrame] = React.useState(initialFrame);
  const [view, setView]   = React.useState('expense'); // expense | income | net

  // Synthetic daily-spend data — May 1-19 with realistic peaks.
  const daily = [
    320, 0, 460, 1280, 0, 240, 3460, 1100, 0, 0, 760, 2200, 39400, 4180,
    2840, 1280, 1784, 0, 1280,
  ];
  // Period labels per frame
  const frameMeta = {
    D:  { label: 'Today', total: 1280, period: '17 May', bins: 24, binLabel: (i) => `${i}h`, max: 600 },
    W:  { label: 'This week', total: 8520, period: '13 – 19 May', bins: 7,  binLabel: (i) => ['M','T','W','T','F','S','S'][i], max: 4180 },
    M:  { label: 'May 2026', total: 60584, period: '1 – 19 May', bins: 19, binLabel: (i) => i + 1, max: Math.max(...daily) },
    '6M': { label: 'Last 6 months', total: 824000, period: 'Dec – May', bins: 6,  binLabel: (i) => ['Dec','Jan','Feb','Mar','Apr','May'][i], max: 168 },
    Y:  { label: 'Last 12 months', total: 1620000, period: 'May 25 – May 26', bins: 12, binLabel: (i) => 'JFMAMJJASOND'[i], max: 180 },
  };
  const fm = frameMeta[frame];
  // Data per frame — daily for M, synthetic for others.
  const bars = React.useMemo(() => {
    if (frame === 'M') return daily;
    if (frame === 'W') return [1280, 540, 3460, 0, 0, 1784, 1456];
    if (frame === 'D') return [0,0,0,0,0,0,0,420,0,0,180,0,0,0,460,0,0,0,1280,0,0,0,0,0];
    if (frame === '6M') return [142, 118, 156, 132, 168, 122];
    return [98, 132, 156, 110, 142, 128, 162, 152, 140, 168, 122, 0]; // Y
  }, [frame]);

  const selectedIdx = frame === 'M' ? 12 : Math.floor(bars.length / 2);
  const selectedValue = bars[selectedIdx];

  // Bars row using svg for crisp lines.
  const w = 320, h = 140;
  const barW = (w - 2) / bars.length;
  const max = Math.max(...bars) || 1;

  return (
    <div style={{ background: t.page, minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header — title row + close (graph detail is a modal-y screen
          opened from the Dashboard card; bottom nav still owns global
          navigation). */}
      <div style={{ padding: '12px 14px 8px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button style={{
          width: 32, height: 32, borderRadius: 999, border: 'none',
          background: t.surface, color: t.ink, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 0 0 1px ${t.border}`,
        }}>
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 3l8 8M11 3l-8 8"/></svg>
        </button>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
          <Logo theme={t} variant="mark" size={20} />
          <span style={{ fontFamily: t.fontDisplay, fontSize: 15.5, color: t.ink, fontWeight: t.displayWeight }}>Breakdown</span>
        </div>
        <button style={{
          width: 32, height: 32, borderRadius: 999, border: 'none',
          background: 'transparent', color: t.ink2, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
        </button>
      </div>

      {/* View segmented (Expense / Income / Net) — same widget shape as Add */}
      <div style={{ padding: '6px 16px 0' }}>
        <div style={{ background: t.sunken, borderRadius: 999, padding: 3, display: 'flex' }}>
          {[
            { k: 'expense', l: 'Expense' },
            { k: 'income',  l: 'Income' },
            { k: 'net',     l: 'Net'  },
          ].map((x) => (
            <button key={x.k} onClick={() => setView(x.k)} style={{
              flex: 1, height: 32, borderRadius: 999, border: 'none',
              background: view === x.k ? t.surface : 'transparent',
              boxShadow: view === x.k ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              color: view === x.k ? t.ink : t.ink2,
              fontFamily: t.fontBody, fontSize: 13, fontWeight: view === x.k ? 600 : 500,
              cursor: 'pointer',
            }}>{x.l}</button>
          ))}
        </div>
      </div>

      {/* Headline */}
      <div style={{ padding: '20px 20px 8px' }}>
        <div style={{ fontFamily: t.fontBody, fontSize: 11.5, color: t.ink3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {view === 'income' ? 'Earned in ' : view === 'net' ? 'Net in ' : 'Spent in '}{fm.label}
        </div>
        <BigAmount t={t} value={fm.total} size={40} color={view === 'income' ? t.positive : view === 'net' ? t.positive : t.ink} />
        <div style={{ fontFamily: t.fontBody, fontSize: 12, color: t.ink3, marginTop: 6 }}>{fm.period}</div>
      </div>

      {/* Time-frame selector — Apple Health style */}
      <div style={{ padding: '6px 16px 0' }}>
        <div style={{ background: t.sunken, borderRadius: 999, padding: 3, display: 'flex' }}>
          {['D', 'W', 'M', '6M', 'Y'].map((k) => (
            <button key={k} onClick={() => setFrame(k)} style={{
              flex: 1, height: 32, borderRadius: 999, border: 'none',
              background: frame === k ? t.surface : 'transparent',
              boxShadow: frame === k ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              color: frame === k ? t.accent : t.ink2,
              fontFamily: t.fontBody, fontSize: 13, fontWeight: frame === k ? 700 : 500,
              cursor: 'pointer',
            }}>{k}</button>
          ))}
        </div>
      </div>

      {/* Chart card */}
      <div style={{ padding: '16px 16px 0' }}>
        <Card t={t} pad={18}>
          {/* Tooltip annotation above the selected bar */}
          <div style={{
            display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4,
          }}>
            <span style={{ fontFamily: t.fontBody, fontSize: 11, color: t.ink3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {frame === 'M' ? 'Mon, 13 May' : frame === 'W' ? 'Wed' : frame === 'D' ? '6 PM' : frame === '6M' ? 'Mar 2026' : 'Mar 2026'}
            </span>
            <span style={{ flex: 1 }} />
            <span style={{ fontFamily: t.fontDisplay, fontSize: 22, color: t.ink, fontWeight: t.displayWeight, fontVariantNumeric: 'tabular-nums' }}>
              {fmtINR(selectedValue || (frame === 'M' ? 39400 : 3460))}
            </span>
          </div>

          {/* Bar chart with selection marker */}
          <svg viewBox={`0 0 ${w} ${h + 32}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
            {/* Y-axis dotted line at selected value */}
            <line x1="0" y1={h - (selectedValue / max) * h} x2={w}
              y2={h - (selectedValue / max) * h}
              stroke={t.border} strokeWidth="1" strokeDasharray="2 3" />
            {bars.map((v, i) => {
              const bh = (v / max) * h;
              const x = i * barW + 1;
              const active = i === selectedIdx;
              return (
                <g key={i}>
                  <rect
                    x={x} y={h - bh} width={barW - 2} height={bh || 1}
                    fill={active ? t.accent : t.accent + '50'}
                    rx={2}
                  />
                  {/* X label every few */}
                  {(frame === 'M' ? (i % 4 === 0 || active) : true) && (
                    <text x={x + (barW - 2) / 2} y={h + 14}
                      textAnchor="middle"
                      fontFamily="ui-sans-serif, system-ui"
                      fontSize="9"
                      fontWeight={active ? 600 : 400}
                      fill={active ? t.ink : t.ink3}>
                      {fm.binLabel(i)}
                    </text>
                  )}
                </g>
              );
            })}
            {/* Selection bubble */}
            <g transform={`translate(${selectedIdx * barW + (barW - 2) / 2 + 1}, ${h - (selectedValue / max) * h - 8})`}>
              <circle r="4.5" fill={t.surface} stroke={t.accent} strokeWidth="2.4" />
            </g>
          </svg>

          {/* Average line summary */}
          <div style={{
            paddingTop: 12, marginTop: 6, borderTop: `1px solid ${t.border}`,
            display: 'flex', justifyContent: 'space-between',
            fontFamily: t.fontBody, fontSize: 11, color: t.ink3,
          }}>
            <div>
              <div style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>Daily avg</div>
              <div style={{ fontFamily: t.fontDisplay, fontSize: 14, fontWeight: t.displayWeight, color: t.ink, marginTop: 2 }}>{fmtINR(Math.round(fm.total / fm.bins))}</div>
            </div>
            <div>
              <div style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>Highest</div>
              <div style={{ fontFamily: t.fontDisplay, fontSize: 14, fontWeight: t.displayWeight, color: t.ink, marginTop: 2 }}>{fmtINR(Math.max(...bars))}</div>
            </div>
            <div>
              <div style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>vs last {frame === 'M' ? 'mo' : frame.toLowerCase()}</div>
              <div style={{ fontFamily: t.fontDisplay, fontSize: 14, fontWeight: t.displayWeight, color: t.positive, marginTop: 2 }}>−27%</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Breakdown by category */}
      <div style={{ padding: '14px 16px 24px' }}>
        <div style={{
          padding: '0 4px 8px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        }}>
          <div style={{ fontFamily: t.fontDisplay, fontSize: 14, color: t.ink, fontWeight: t.displayWeight }}>By category</div>
          <span style={{ fontFamily: t.fontBody, fontSize: 11.5, color: t.ink3 }}>tap to drill in</span>
        </div>
        <Card t={t} pad={0}>
          {SPEND_BY_CATEGORY.slice(0, 6).map((s, i) => {
            const pct = Math.round(s.amount / fm.total * 100);
            const cat = CAT_BY_ID[s.id];
            return (
              <div key={s.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 16px',
                borderTop: i > 0 ? `1px solid ${t.border}` : 'none',
              }}>
                <CatBadge cat={cat} t={t} size={32} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontFamily: t.fontBody, fontSize: 13.5, color: t.ink, fontWeight: 500 }}>{s.name}</span>
                    <span style={{ fontFamily: t.fontDisplay, fontSize: 13, color: t.ink, fontWeight: t.displayWeight, fontVariantNumeric: 'tabular-nums' }}>{fmtINR(s.amount, { compact: true })}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, height: 4, background: t.sunken, borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: s.color, borderRadius: 2 }} />
                    </div>
                    <span style={{ fontFamily: t.fontMono, fontSize: 10.5, color: t.ink3, width: 28, textAlign: 'right' }}>{pct}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </Card>
      </div>
    </div>
  );
}

Object.assign(window, {
  TopBar, IconBtn, Chip, CatBadge, BigAmount, Donut, TrendBars, TabBar, Card,
  ScreenDashboard, ScreenAdd, ScreenTransactions, ScreenAccounts, ScreenCategories, ScreenGraphDetail,
  RupiverseScreen,
});
