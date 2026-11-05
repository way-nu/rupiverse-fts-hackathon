// rupiverse-extras.jsx — Overlays, dialogs, empty states, desktop shell.
// Loaded BEFORE rupiverse-screens.jsx so the screens can reference these
// components by their bare names (they're all assigned to window at the end).

// ─────────────────────────────────────────────────────────────
// NoteField — slim inline input below the merchant/transfer block.
// ─────────────────────────────────────────────────────────────
function NoteField({ t, value, onChange, placeholder }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 14px',
      background: t.surface, border: `1px solid ${t.border}`,
      borderRadius: t.radiusM,
    }}>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={t.ink3} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 2.5h6l2.5 2.5v6.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5z M5 6.5h4 M5 8.5h4 M5 10.5h2.5"/>
      </svg>
      <input
        defaultValue={value}
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
        style={{
          flex: 1, height: 22, border: 'none', outline: 'none',
          background: 'transparent', color: t.ink,
          fontFamily: t.fontBody, fontSize: 13, padding: 0,
        }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TagRow — 3 most-used tag chips + "+ Tag" that opens a dialog.
// The active prop highlights the "+ Tag" affordance when the dialog is open.
// ─────────────────────────────────────────────────────────────
const QUICK_TAGS = ['reimburse', 'weekend', 'work-trip'];

function TagRow({ t, tags = [], highlighted = false }) {
  return (
    <div>
      <div style={{
        fontFamily: t.fontBody, fontSize: 10.5, color: t.ink3,
        textTransform: 'uppercase', letterSpacing: '0.06em',
        marginBottom: 6, marginLeft: 2,
      }}>Tags</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {QUICK_TAGS.map((tg) => {
          const on = tags.includes(tg);
          return (
            <button key={tg} style={{
              height: 30, padding: '0 12px', borderRadius: 999,
              background: on ? t.accent : 'transparent',
              color: on ? t.accentInk : t.ink2,
              border: `1px solid ${on ? 'transparent' : t.border}`,
              fontFamily: t.fontBody, fontSize: 13, fontWeight: 500,
              cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5,
            }}>{tg}</button>
          );
        })}
        <button style={{
          height: 30, padding: '0 12px', borderRadius: 999,
          background: highlighted ? t.accentSoft : 'transparent',
          color: highlighted ? t.accent : t.ink2,
          border: `1px dashed ${highlighted ? t.accent : t.borderStrong}`,
          fontFamily: t.fontBody, fontSize: 13, fontWeight: 500,
          cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4,
        }}>
          <span style={{ fontSize: 14, lineHeight: 1 }}>+</span> Tag
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ContextChips — Account · Method · Date row.
// ─────────────────────────────────────────────────────────────
function ContextChips({ t, type, hideAccount }) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {!hideAccount && (
        <button style={{
          height: 30, padding: '0 12px', borderRadius: 999,
          background: t.chipBg, color: t.chipInk,
          border: 'none', fontFamily: t.fontBody, fontSize: 13, fontWeight: 500,
          display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer',
        }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: type === 'income' ? '#0048A0' : '#97144D' }} />
          {type === 'income' ? 'HDFC · 4521' : 'Axis · 1102'}
          <svg width="8" height="8" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" style={{ opacity: 0.5 }}><path d="M2 4l3 3 3-3"/></svg>
        </button>
      )}
      <button style={{
        height: 30, padding: '0 12px', borderRadius: 999,
        background: t.chipBg, color: t.chipInk,
        border: 'none', fontFamily: t.fontBody, fontSize: 13, fontWeight: 500,
        cursor: 'pointer',
      }}>UPI</button>
      <button style={{
        height: 30, padding: '0 12px', borderRadius: 999,
        background: t.chipBg, color: t.chipInk,
        border: 'none', fontFamily: t.fontBody, fontSize: 13, fontWeight: 500,
        cursor: 'pointer',
      }}>Today</button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MonthPickerDropdown — small floating popover with months.
// ─────────────────────────────────────────────────────────────
function MonthPickerDropdown({ t }) {
  const months = [
    'May 2026', 'Apr 2026', 'Mar 2026', 'Feb 2026', 'Jan 2026', 'Dec 2025', 'Custom range…',
  ];
  return (
    <div style={{
      position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 30,
      width: 200,
      background: t.surface,
      border: `1px solid ${t.border}`,
      borderRadius: t.radiusM,
      boxShadow: '0 12px 36px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.04)',
      padding: 6,
    }}>
      {months.map((m, i) => {
        const active = i === 0;
        const custom = i === months.length - 1;
        return (
          <div key={m} style={{
            padding: '8px 10px', borderRadius: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: active ? t.accentSoft : 'transparent',
            color: active ? t.accent : custom ? t.ink2 : t.ink,
            fontFamily: t.fontBody, fontSize: 13, fontWeight: active ? 600 : 500,
            cursor: 'pointer', borderTop: custom ? `1px solid ${t.border}` : 'none',
            marginTop: custom ? 4 : 0, paddingTop: custom ? 12 : 8,
          }}>
            {m}
            {active && <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 6.5l2.5 2.5L10 3.5"/></svg>}
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Sheet — bottom sheet overlay primitive.
// ─────────────────────────────────────────────────────────────
function Sheet({ t, children, height, title, onClose }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 20,
      background: 'rgba(0,0,0,0.32)',
      backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)',
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
    }}>
      <div style={{
        background: t.surface,
        borderTopLeftRadius: 22, borderTopRightRadius: 22,
        padding: '12px 0 16px',
        maxHeight: height || '76%', display: 'flex', flexDirection: 'column',
        boxShadow: '0 -8px 32px rgba(0,0,0,0.18)',
      }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: t.borderStrong, margin: '0 auto 12px' }} />
        {title && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 18px 10px', borderBottom: `1px solid ${t.border}`,
          }}>
            <div style={{ fontFamily: t.fontDisplay, fontSize: 16, color: t.ink, fontWeight: t.displayWeight }}>{title}</div>
            <button style={{
              background: 'transparent', border: 'none', color: t.accent,
              fontFamily: t.fontBody, fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 0,
            }}>Done</button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// FilterSheet — the Ledger's full filter dialog.
// ─────────────────────────────────────────────────────────────
function FilterSheet({ t }) {
  return (
    <Sheet t={t} title="Filters">
      <div style={{ padding: '14px 18px 0', display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto' }}>
        {/* Date range */}
        <div>
          <div style={{ fontFamily: t.fontBody, fontSize: 11, color: t.ink3, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Date range</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['This month', 'Last month', 'Last 90 days', 'Year to date', 'Custom…'].map((p, i) => (
              <button key={p} style={{
                height: 30, padding: '0 12px', borderRadius: 999,
                background: i === 0 ? t.accent : t.chipBg,
                color: i === 0 ? t.accentInk : t.chipInk,
                border: 'none', fontFamily: t.fontBody, fontSize: 13, fontWeight: 500, cursor: 'pointer',
              }}>{p}</button>
            ))}
          </div>
        </div>
        {/* Categories — multi select */}
        <div>
          <div style={{ fontFamily: t.fontBody, fontSize: 11, color: t.ink3, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Categories</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {CATEGORIES.slice(0, 7).map((c) => {
              const on = c.id === 'food';
              return (
                <button key={c.id} style={{
                  height: 32, padding: '0 12px', borderRadius: 999,
                  background: on ? c.swatch : t.chipBg,
                  color: on ? '#fff' : t.chipInk,
                  border: 'none', fontFamily: t.fontBody, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                }}>
                  <span style={{
                    width: 16, height: 16, borderRadius: 4,
                    background: on ? 'rgba(255,255,255,0.25)' : c.swatch + '24',
                    color: on ? '#fff' : c.swatch,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: t.fontDisplay, fontSize: 9, fontWeight: 600,
                  }}>{c.abbr}</span>
                  {c.name}
                </button>
              );
            })}
          </div>
        </div>
        {/* Accounts */}
        <div>
          <div style={{ fontFamily: t.fontBody, fontSize: 11, color: t.ink3, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Accounts</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {ACCOUNTS.map((a) => {
              const on = a.id === 'a3';
              return (
                <button key={a.id} style={{
                  height: 32, padding: '0 12px', borderRadius: 999,
                  background: on ? t.accent : t.chipBg,
                  color: on ? t.accentInk : t.chipInk,
                  border: 'none', fontFamily: t.fontBody, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                }}>{a.short} · {a.last4}</button>
              );
            })}
          </div>
        </div>
        {/* Amount range */}
        <div>
          <div style={{ fontFamily: t.fontBody, fontSize: 11, color: t.ink3, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Amount range</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ flex: 1, height: 34, background: t.chipBg, borderRadius: 8, padding: '0 12px', display: 'flex', alignItems: 'center', fontFamily: t.fontMono, fontSize: 13, color: t.ink2 }}>₹0</div>
            <span style={{ color: t.ink3 }}>—</span>
            <div style={{ flex: 1, height: 34, background: t.chipBg, borderRadius: 8, padding: '0 12px', display: 'flex', alignItems: 'center', fontFamily: t.fontMono, fontSize: 13, color: t.ink2 }}>any</div>
          </div>
        </div>
        {/* Type & method */}
        <div>
          <div style={{ fontFamily: t.fontBody, fontSize: 11, color: t.ink3, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Type</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {['All', 'Expense', 'Income', 'Transfer'].map((m, i) => (
              <button key={m} style={{
                flex: 1, height: 32, borderRadius: 8,
                background: i === 0 ? t.accent : t.chipBg,
                color: i === 0 ? t.accentInk : t.chipInk,
                border: 'none', fontFamily: t.fontBody, fontSize: 13, fontWeight: 500, cursor: 'pointer',
              }}>{m}</button>
            ))}
          </div>
        </div>
      </div>
      {/* Footer actions */}
      <div style={{ padding: '12px 18px 0', display: 'flex', gap: 8, borderTop: `1px solid ${t.border}`, marginTop: 12 }}>
        <button style={{
          flex: 1, height: 44, borderRadius: t.radiusM,
          background: t.chipBg, color: t.ink, border: 'none',
          fontFamily: t.fontBody, fontSize: 14, fontWeight: 500, cursor: 'pointer',
        }}>Reset</button>
        <button style={{
          flex: 2, height: 44, borderRadius: t.radiusM,
          background: t.accent, color: t.accentInk, border: 'none',
          fontFamily: t.fontDisplay, fontSize: 14, fontWeight: 600, cursor: 'pointer',
        }}>Apply · 6 results</button>
      </div>
    </Sheet>
  );
}

// ─────────────────────────────────────────────────────────────
// TagDialog — Multi-select tag picker with custom-add.
// ─────────────────────────────────────────────────────────────
const ALL_TAGS = [
  { name: 'reimburse', count: 12 },
  { name: 'weekend',   count: 28 },
  { name: 'work-trip', count: 6  },
  { name: 'date',      count: 9  },
  { name: 'gift',      count: 4  },
  { name: 'subscription', count: 7 },
  { name: 'split',     count: 11 },
  { name: 'tax',       count: 3  },
  { name: 'cash',      count: 5  },
  { name: 'medical',   count: 2  },
];

function TagDialog({ t, selected = ['weekend'] }) {
  return (
    <Sheet t={t} title="Add tags" height="68%">
      <div style={{ padding: '14px 18px 0', display: 'flex', flexDirection: 'column', gap: 12, overflow: 'auto' }}>
        {/* Create-custom row — input on top, Create button on its own row below.
            Keeps the input a clean text field at full width and gives the action
            equal weight to the rest of the form. */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '0 12px', height: 40,
            background: t.sunken, borderRadius: 10,
            border: `1px solid ${t.accent}`,
            boxShadow: `0 0 0 3px ${t.accent}20`,
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={t.ink3} strokeWidth="1.6" strokeLinecap="round"><circle cx="6" cy="6" r="4.5"/><path d="M9.5 9.5l3 3"/></svg>
            <span style={{ flex: 1, fontFamily: t.fontBody, fontSize: 14, color: t.ink }}>
              paradise<span style={{ display: 'inline-block', width: 1.5, height: 14, background: t.accent, marginLeft: 1, verticalAlign: 'text-bottom' }}/>
            </span>
            <span style={{ fontFamily: t.fontBody, fontSize: 11.5, color: t.ink3 }}>no matches</span>
          </div>
          <button style={{
            height: 38, borderRadius: t.radiusM,
            background: t.surface, color: t.accent,
            border: `1px solid ${t.accent}`,
            fontFamily: t.fontBody, fontSize: 13, fontWeight: 600,
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 2v8M2 6h8"/></svg>
            Create “paradise”
          </button>
        </div>

        <div style={{ fontFamily: t.fontBody, fontSize: 11, color: t.ink3, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 4 }}>Recently used</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {QUICK_TAGS.map((tg) => {
            const on = selected.includes(tg);
            return (
              <button key={tg} style={{
                height: 32, padding: '0 14px', borderRadius: 999,
                background: on ? t.accent : t.chipBg,
                color: on ? t.accentInk : t.chipInk,
                border: 'none', fontFamily: t.fontBody, fontSize: 13, fontWeight: 500,
                cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5,
              }}>
                {on && <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 6.5l2.5 2.5L10 3.5"/></svg>}
                {tg}
              </button>
            );
          })}
        </div>

        <div style={{ fontFamily: t.fontBody, fontSize: 11, color: t.ink3, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 4 }}>All tags</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {ALL_TAGS.map((tg) => {
            const on = selected.includes(tg.name);
            return (
              <div key={tg.name} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 6px',
                borderTop: `1px solid ${t.border}`,
              }}>
                <div style={{
                  width: 20, height: 20, borderRadius: 5,
                  border: `1.5px solid ${on ? t.accent : t.borderStrong}`,
                  background: on ? t.accent : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: t.accentInk,
                }}>
                  {on && <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M2 6.5l2.5 2.5L10 3.5"/></svg>}
                </div>
                <span style={{ flex: 1, fontFamily: t.fontBody, fontSize: 14, color: t.ink }}>{tg.name}</span>
                <span style={{ fontFamily: t.fontMono, fontSize: 11, color: t.ink3 }}>{tg.count}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ padding: '12px 18px 0', borderTop: `1px solid ${t.border}`, marginTop: 12 }}>
        <button style={{
          width: '100%', height: 44, borderRadius: t.radiusM,
          background: t.accent, color: t.accentInk, border: 'none',
          fontFamily: t.fontDisplay, fontSize: 14, fontWeight: 600, cursor: 'pointer',
        }}>Apply {selected.length} tag{selected.length === 1 ? '' : 's'}</button>
      </div>
    </Sheet>
  );
}

// ─────────────────────────────────────────────────────────────
// AccountPickerSheet — used in Transfer to pick the "From" account.
// ─────────────────────────────────────────────────────────────
function AccountPickerSheet({ t, selected = 'a1' }) {
  return (
    <Sheet t={t} title="Choose source account" height="60%">
      <div style={{ padding: '8px 0 0' }}>
        {ACCOUNTS.filter((a) => a.type !== 'credit_card').map((a, i) => {
          const on = a.id === selected;
          return (
            <div key={a.id} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '12px 18px',
              background: on ? t.accentSoft : 'transparent',
              borderBottom: i < ACCOUNTS.length - 2 ? `1px solid ${t.border}` : 'none',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 9,
                background: a.color, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: t.fontDisplay, fontWeight: 700, fontSize: 12,
              }}>{a.short.slice(0, 2).toUpperCase()}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: t.fontBody, fontSize: 14.5, color: t.ink, fontWeight: 600 }}>{a.name}</div>
                <div style={{ fontFamily: t.fontMono, fontSize: 11, color: t.ink3, marginTop: 2 }}>•••• {a.last4} · <span style={{ textTransform: 'capitalize' }}>{a.type.replace('_', ' ')}</span></div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: t.fontDisplay, fontSize: 14, fontWeight: t.displayWeight, color: t.ink, fontVariantNumeric: 'tabular-nums' }}>{fmtINR(a.balance, { compact: true })}</div>
              </div>
              {on && <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={t.accent} strokeWidth="2.4" strokeLinecap="round"><path d="M3 8.5l3 3 7-7"/></svg>}
            </div>
          );
        })}
      </div>
    </Sheet>
  );
}

// ─────────────────────────────────────────────────────────────
// EmptyState — for the Ledger.
// ─────────────────────────────────────────────────────────────
function EmptyState({ t, kind = 'first-time' }) {
  const isFirst = kind === 'first-time';
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '40px 28px', textAlign: 'center', gap: 16,
    }}>
      {/* Illustration — abstract paper ledger / no-results glyph */}
      <div style={{
        width: 110, height: 110, position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: t.sunken, borderRadius: 24,
          transform: 'rotate(-4deg)',
        }} />
        {isFirst ? (
          // Stylized blank ledger book
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style={{ position: 'relative' }}>
            <rect x="10" y="12" width="44" height="40" rx="5" fill={t.surface} stroke={t.borderStrong} strokeWidth="1.5"/>
            <path d="M20 24h24 M20 30h24 M20 36h18 M20 42h14" stroke={t.border} strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="48" cy="46" r="9" fill={t.accent}/>
            <path d="M44 46l3 3 5-5" stroke={t.accentInk} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : (
          // Magnifier with X
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style={{ position: 'relative' }}>
            <circle cx="26" cy="26" r="16" fill={t.surface} stroke={t.borderStrong} strokeWidth="1.8"/>
            <path d="M38 38l12 12" stroke={t.borderStrong} strokeWidth="3" strokeLinecap="round"/>
            <path d="M21 21l10 10 M31 21l-10 10" stroke={t.ink3} strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 280 }}>
        <div style={{ fontFamily: t.fontDisplay, fontSize: 19, color: t.ink, fontWeight: t.displayWeight, letterSpacing: t.displayTracking }}>
          {isFirst ? 'No transactions yet' : 'No transactions match'}
        </div>
        <div style={{ fontFamily: t.fontBody, fontSize: 13.5, color: t.ink2, lineHeight: 1.5 }}>
          {isFirst
            ? 'Log your first expense with the + tab. Or import a bank statement to backfill the last few months.'
            : 'Try widening the date range, clearing a category filter, or removing the amount range.'}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        {isFirst ? (
          <>
            <button style={{
              height: 38, padding: '0 16px', borderRadius: 999,
              background: t.accent, color: t.accentInk, border: 'none',
              fontFamily: t.fontBody, fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M7 2v10M2 7h10"/></svg>
              Add transaction
            </button>
            <button style={{
              height: 38, padding: '0 16px', borderRadius: 999,
              background: t.surface, color: t.ink, border: `1px solid ${t.borderStrong}`,
              fontFamily: t.fontBody, fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
            }}>Import statement</button>
          </>
        ) : (
          <button style={{
            height: 38, padding: '0 16px', borderRadius: 999,
            background: t.accent, color: t.accentInk, border: 'none',
            fontFamily: t.fontBody, fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
          }}>Clear all filters</button>
        )}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// DESKTOP SHELL
// ═════════════════════════════════════════════════════════════
function RupiverseDesktop({ t, screen = 'home', state, initialType }) {
  // Auth screens have no app chrome (logged out) — full-window split layout.
  if (['login','signup','signup-invalid','otp','forgot','forgot-otp','reset'].includes(screen)) {
    return <DesktopAuth t={t} variant={screen} />;
  }
  const navItems = [
    { id: 'home',  label: 'Dashboard',    badge: null,    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l9-7 9 7v9a2 2 0 0 1-2 2h-3v-7H10v7H6a2 2 0 0 1-2-2v-9z"/></svg> },
    { id: 'txns',  label: 'Ledger',       badge: '47',    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 4h12a2 2 0 0 1 2 2v14l-3-2-3 2-3-2-3 2-3-2V6a2 2 0 0 1 2-2z M9 9h6 M9 13h4"/></svg> },
    { id: 'accts', label: 'Accounts',     badge: '5',     icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/></svg> },
    { id: 'cats',  label: 'Categories',   badge: null,    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/></svg> },
  ];

  return (
    <div style={{
      width: '100%', height: '100%',
      background: t.page, color: t.ink, fontFamily: t.fontBody,
      display: 'grid', gridTemplateColumns: '244px 1fr',
      overflow: 'hidden',
    }}>
      {/* Sidebar */}
      <aside style={{
        background: t.sunken, borderRight: `1px solid ${t.border}`,
        padding: '24px 16px 16px',
        display: 'flex', flexDirection: 'column', gap: 24,
      }}>
        <div style={{ paddingLeft: 4 }}>
          <Logo theme={t} variant="inline" size={32} />
        </div>

        {/* Quick add */}
        <button style={{
          width: '100%', height: 40, borderRadius: 10,
          background: t.accent, color: t.accentInk, border: 'none',
          fontFamily: t.fontBody, fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          boxShadow: `0 1px 0 rgba(255,255,255,0.2) inset, 0 4px 14px ${t.accent}33`,
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M7 2v10M2 7h10"/></svg>
          Add transaction
          <span style={{
            marginLeft: 4, fontSize: 10, opacity: 0.7, fontFamily: t.fontMono,
            background: 'rgba(255,255,255,0.18)', padding: '1px 5px', borderRadius: 3,
          }}>⌘N</span>
        </button>

        {/* Nav */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {navItems.map((n) => {
            const on = n.id === screen;
            const disabled = n.badge === 'soon';
            return (
              <div key={n.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '8px 12px', borderRadius: 8,
                background: on ? t.surface : 'transparent',
                color: on ? t.ink : t.ink2,
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.55 : 1,
                boxShadow: on ? '0 0 0 1px ' + t.border : 'none',
              }}>
                <span style={{ color: on ? t.accent : t.ink3 }}>{n.icon}</span>
                <span style={{ flex: 1, fontFamily: t.fontBody, fontSize: 13.5, fontWeight: on ? 600 : 500 }}>{n.label}</span>
                {n.badge && (
                  <span style={{
                    fontFamily: t.fontMono, fontSize: 10.5, color: disabled ? t.ink3 : t.ink2,
                    background: disabled ? 'transparent' : t.chipBg,
                    padding: '1px 7px', borderRadius: 999,
                    border: disabled ? `1px solid ${t.border}` : 'none',
                    textTransform: disabled ? 'uppercase' : 'none', letterSpacing: disabled ? '0.04em' : 0,
                  }}>{n.badge}</span>
                )}
              </div>
            );
          })}
        </nav>

        <div style={{ flex: 1 }} />

        {/* Account footer */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '8px 10px', borderRadius: 10,
          background: t.surface, border: `1px solid ${t.border}`,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: t.accent, color: t.accentInk,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: t.fontDisplay, fontSize: 13, fontWeight: 700,
          }}>V</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: t.fontBody, fontSize: 13, fontWeight: 600, color: t.ink }}>Venu</div>
            <div style={{ fontFamily: t.fontBody, fontSize: 11, color: t.ink3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>venu@rupiverse.app</div>
          </div>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={t.ink3} strokeWidth="1.6" strokeLinecap="round"><circle cx="3" cy="7" r="1"/><circle cx="7" cy="7" r="1"/><circle cx="11" cy="7" r="1"/></svg>
        </div>
      </aside>

      {/* Main */}
      <main style={{ overflow: 'auto', padding: '24px 32px 40px', position: 'relative' }}>
        {screen === 'home'  && <DesktopDashboard t={t} state={state} />}
        {screen === 'txns'  && <DesktopLedger    t={t} state={state} />}
        {screen === 'accts' && <DesktopAccounts  t={t} />}
        {screen === 'cats'  && <DesktopCategories t={t} />}
        {screen === 'graph' && <DesktopGraph     t={t} />}
        {screen === 'add' && (
          <>
            <DesktopDashboard t={t} dim />
            <DesktopAddModal t={t} initialType={initialType} state={state} />
          </>
        )}
      </main>
    </div>
  );
}

function DesktopDashboard({ t, state, dim }) {
  const m = MONTH_SUMMARY;
  const monthOpen = state === 'month-picker';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1080, opacity: dim ? 0.4 : 1, pointerEvents: dim ? 'none' : 'auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 4 }}>
        <div>
          <div style={{ fontFamily: t.fontBody, fontSize: 12, color: t.ink3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Overview</div>
          <div style={{ fontFamily: t.fontDisplay, fontSize: 30, color: t.ink, fontWeight: t.displayWeight, letterSpacing: t.displayTracking }}>May 2026</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ position: 'relative' }}>
            <button style={{
              background: monthOpen ? t.accent : t.surface,
              border: `1px solid ${monthOpen ? t.accent : t.border}`,
              color: monthOpen ? t.accentInk : t.ink,
              borderRadius: 999, padding: '8px 14px', cursor: 'pointer',
              fontFamily: t.fontBody, fontSize: 13, fontWeight: 500,
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>This month <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" style={{ transform: monthOpen ? 'rotate(180deg)' : 'none' }}><path d="M2 4l3 3 3-3"/></svg></button>
            {monthOpen && <MonthPickerDropdown t={t} />}
          </div>
          <button style={{
            background: t.surface, border: `1px solid ${t.border}`,
            borderRadius: 999, padding: '8px 14px', cursor: 'pointer',
            fontFamily: t.fontBody, fontSize: 13, color: t.ink2, fontWeight: 500,
          }}>Export</button>
        </div>
      </div>

      {/* KPI cards row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {[
          { label: 'Money in',   value: m.in,  delta: '+₹16.5k vs apr', deltaColor: t.positive },
          { label: 'Money out',  value: m.out, delta: '−₹45.5k vs apr', deltaColor: t.positive },
          { label: 'Net',        value: m.net, delta: '+₹62k vs apr',   deltaColor: t.positive, primary: true },
          { label: 'Transfers',  value: 22000, delta: 'excluded from net', deltaColor: t.ink3 },
        ].map((k, i) => (
          <div key={i} style={{
            background: t.surface, border: `1px solid ${t.border}`,
            borderRadius: 14, padding: 18,
            position: 'relative', overflow: 'hidden',
          }}>
            {k.primary && (
              <div style={{ position: 'absolute', right: -20, top: -32, pointerEvents: 'none' }}>
                <DevaGlyph char="ख" theme={t} size={140} opacity={0.05} />
              </div>
            )}
            <div style={{ position: 'relative' }}>
              <div style={{ fontFamily: t.fontBody, fontSize: 11, color: t.ink3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{k.label}</div>
              <div style={{ marginTop: 8 }}>
                <BigAmount t={t} value={k.value} size={26} color={k.primary ? t.positive : t.ink} />
              </div>
              <div style={{ fontFamily: t.fontBody, fontSize: 11, color: k.deltaColor, marginTop: 6 }}>{k.delta}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Two-col: donut + trend */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 14 }}>
        <div style={{
          background: t.surface, border: `1px solid ${t.border}`,
          borderRadius: 14, padding: 22,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
            <div style={{ fontFamily: t.fontDisplay, fontSize: 16, color: t.ink, fontWeight: t.displayWeight }}>Where it went</div>
            <button style={{ background: 'transparent', border: 'none', color: t.ink3, fontFamily: t.fontBody, fontSize: 12, cursor: 'pointer' }}>See breakdown →</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
            <Donut t={t} segments={SPEND_BY_CATEGORY} size={170} thickness={18}
              centerLabel="Spent" centerValue={fmtINR(m.out, { compact: true })} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {SPEND_BY_CATEGORY.slice(0, 6).map((s) => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: s.color }} />
                  <span style={{ flex: 1, fontFamily: t.fontBody, fontSize: 12.5, color: t.ink, fontWeight: 500 }}>{s.name}</span>
                  <span style={{ fontFamily: t.fontMono, fontSize: 12, color: t.ink2, fontVariantNumeric: 'tabular-nums' }}>{fmtINR(s.amount, { compact: true })}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{
          background: t.surface, border: `1px solid ${t.border}`,
          borderRadius: 14, padding: 22,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
            <div>
              <div style={{ fontFamily: t.fontDisplay, fontSize: 16, color: t.ink, fontWeight: t.displayWeight }}>6-month flow</div>
              <div style={{ fontFamily: t.fontBody, fontSize: 11.5, color: t.ink3, marginTop: 2 }}>Hover a bar for the daily breakdown</div>
            </div>
            <div style={{ display: 'flex', gap: 12, fontFamily: t.fontBody, fontSize: 11.5, color: t.ink2 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><span style={{ width: 9, height: 9, borderRadius: 2, background: t.positive }}/>In</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><span style={{ width: 9, height: 9, borderRadius: 2, background: t.accent }}/>Out</span>
            </div>
          </div>
          <TrendBars t={t} data={TREND} />
        </div>
      </div>

      {/* Bottom row: Accounts + recent txns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 14 }}>
        <div style={{
          background: t.surface, border: `1px solid ${t.border}`,
          borderRadius: 14, padding: 22,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
            <div style={{ fontFamily: t.fontDisplay, fontSize: 16, color: t.ink, fontWeight: t.displayWeight }}>Accounts</div>
            <span style={{ fontFamily: t.fontBody, fontSize: 11.5, color: t.ink3 }}>5 linked</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {ACCOUNTS.map((a) => {
              const isCard = a.type === 'credit_card';
              return (
                <div key={a.id} style={{
                  padding: '12px 14px',
                  borderRadius: 10,
                  background: isCard ? t.ink : t.sunken,
                  color: isCard ? t.inkInverse : t.ink,
                  display: 'flex', flexDirection: 'column', gap: 4,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: t.fontBody, fontSize: 11, opacity: isCard ? 0.7 : 1, color: isCard ? t.inkInverse : t.ink3, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{a.short}</span>
                    <span style={{ fontFamily: t.fontMono, fontSize: 10, opacity: 0.55 }}>•• {a.last4}</span>
                  </div>
                  <div style={{ fontFamily: t.fontBody, fontSize: 11.5, opacity: 0.85 }}>{a.name.replace(a.short + ' ', '').replace('HDFC ', '')}</div>
                  <div style={{ fontFamily: t.fontDisplay, fontSize: 17, fontWeight: t.displayWeight, fontVariantNumeric: 'tabular-nums', marginTop: 2 }}>{fmtINR(a.balance)}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{
          background: t.surface, border: `1px solid ${t.border}`,
          borderRadius: 14, padding: '22px 0 12px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '0 22px 12px' }}>
            <div style={{ fontFamily: t.fontDisplay, fontSize: 16, color: t.ink, fontWeight: t.displayWeight }}>Recent activity</div>
            <button style={{ background: 'transparent', border: 'none', color: t.ink3, fontFamily: t.fontBody, fontSize: 12, cursor: 'pointer' }}>See all →</button>
          </div>
          {TRANSACTIONS.slice(0, 6).map((tx, i) => (
            <div key={tx.id} style={{ padding: '0 14px' }}>
              <TxnRow t={t} tx={tx} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DesktopLedger({ t, state = 'default' }) {
  const isSearching     = state === 'searching';
  const isFilterOpen    = state === 'filter-open';
  const isFilterApplied = state === 'filter-applied';
  const isEmptyFirst    = state === 'empty-first';
  const isEmptyNoMatch  = state === 'empty-nomatch';

  const query = isSearching ? 'swi' : '';
  const txns = React.useMemo(() => {
    if (isEmptyFirst || isEmptyNoMatch) return [];
    let xs = TRANSACTIONS;
    if (isSearching) xs = xs.filter((x) => (x.merchant + ' ' + (x.note || '')).toLowerCase().includes(query));
    if (isFilterApplied) xs = xs.filter((x) => catRoot(x.cat)?.id === 'food' && x.account === 'a3');
    return xs;
  }, [state]);
  const total = txns.filter(x => x.type === 'expense').reduce((s, x) => s + x.amount, 0);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 1080 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: t.fontBody, fontSize: 12, color: t.ink3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Ledger</div>
          <div style={{ fontFamily: t.fontDisplay, fontSize: 30, color: t.ink, fontWeight: t.displayWeight, letterSpacing: t.displayTracking }}>All transactions</div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{
            width: 280, height: 36, padding: '0 12px',
            background: isSearching ? t.surface : t.surface,
            border: `1px solid ${isSearching ? t.accent : t.border}`,
            boxShadow: isSearching ? `0 0 0 3px ${t.accent}20` : 'none',
            borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isSearching ? t.ink : t.ink3} strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
            {isSearching ? (
              <span style={{ flex: 1, fontFamily: t.fontBody, fontSize: 13, color: t.ink }}>
                {query}<span style={{ display: 'inline-block', width: 1.5, height: 14, background: t.accent, marginLeft: 1, verticalAlign: 'text-bottom' }}/>
              </span>
            ) : (
              <span style={{ flex: 1, fontFamily: t.fontBody, fontSize: 13, color: t.ink3 }}>Search merchant, note, ₹…</span>
            )}
            <span style={{ fontFamily: t.fontMono, fontSize: 11, color: t.ink3, background: t.chipBg, padding: '1px 5px', borderRadius: 3 }}>/</span>
          </div>
          <button style={{
            height: 36, padding: '0 14px', borderRadius: 10,
            background: isFilterOpen || isFilterApplied ? t.accentSoft : t.surface,
            border: `1px solid ${isFilterOpen || isFilterApplied ? t.accent : t.border}`,
            color: isFilterOpen || isFilterApplied ? t.accent : t.ink,
            fontFamily: t.fontBody, fontSize: 13, fontWeight: 500, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6, position: 'relative',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 5h16l-6 8v6l-4-2v-4z"/></svg>
            Filters
            {isFilterApplied && <span style={{ background: t.accent, color: t.accentInk, fontFamily: t.fontMono, fontSize: 10, fontWeight: 700, padding: '1px 5px', borderRadius: 999 }}>3</span>}
          </button>
          <button style={{
            height: 36, padding: '0 14px', borderRadius: 10,
            background: t.accent, border: 'none', color: t.accentInk,
            fontFamily: t.fontBody, fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>+ Add</button>
        </div>
      </div>

      {/* Active filter chips */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
        {isFilterApplied ? (
          <>
            <Chip t={t} active>This month</Chip>
            <Chip t={t} active>Food ×</Chip>
            <Chip t={t} active>Axis · 1102 ×</Chip>
            <button style={{ background: 'transparent', border: 'none', color: t.ink3, fontFamily: t.fontBody, fontSize: 12, cursor: 'pointer' }}>Clear</button>
            <span style={{ flex: 1 }} />
            <span style={{ fontFamily: t.fontBody, fontSize: 12, color: t.ink2 }}>{txns.length} of {TRANSACTIONS.length} · {fmtINR(total, { compact: true })}</span>
          </>
        ) : (
          <>
            <Chip t={t} active>This month</Chip>
            <span style={{ fontFamily: t.fontBody, fontSize: 11.5, color: t.ink3 }}>·</span>
            <span style={{ fontFamily: t.fontBody, fontSize: 12, color: t.ink2 }}>{txns.length} transactions · {fmtINR(total)}</span>
          </>
        )}
      </div>

      {/* Empty states */}
      {(isEmptyFirst || isEmptyNoMatch) && (
        <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: '60px 24px' }}>
          <EmptyState t={t} kind={isEmptyFirst ? 'first-time' : 'no-matches'} />
        </div>
      )}

      {/* Table */}
      {!(isEmptyFirst || isEmptyNoMatch) && (
        <div style={{
          background: t.surface, border: `1px solid ${t.border}`,
          borderRadius: 12, overflow: 'hidden', position: 'relative',
        }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '110px 1fr 200px 100px 120px',
            padding: '10px 18px', background: t.sunken,
            borderBottom: `1px solid ${t.border}`,
            fontFamily: t.fontBody, fontSize: 11, color: t.ink3, textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
            <div>Date</div><div>Merchant</div><div>Category</div><div>Account</div><div style={{ textAlign: 'right' }}>Amount</div>
          </div>
          {txns.map((tx) => {
            const cat = CAT_BY_ID[tx.cat];
            const root = catRoot(tx.cat);
            const account = ACCOUNTS.find((a) => a.id === tx.account);
            return (
              <div key={tx.id} style={{
                display: 'grid', gridTemplateColumns: '110px 1fr 200px 100px 120px',
                padding: '12px 18px', alignItems: 'center',
                borderBottom: `1px solid ${t.border}`,
              }}>
                <div style={{ fontFamily: t.fontMono, fontSize: 12, color: t.ink3 }}>{tx.date.slice(5)}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <CatBadge cat={cat} t={t} size={26} />
                  <div style={{ fontFamily: t.fontBody, fontSize: 13.5, color: t.ink, fontWeight: 500 }}>
                    {isSearching ? <HighlightedText text={tx.merchant} query={query} t={t} /> : tx.merchant}
                  </div>
                  {tx.ai && (
                    <span style={{ fontFamily: t.fontBody, fontSize: 9, color: t.accent, background: t.accentSoft, padding: '1px 5px', borderRadius: 3, fontWeight: 600 }}>AI</span>
                  )}
                </div>
                <div style={{ fontFamily: t.fontBody, fontSize: 12.5, color: t.ink2 }}>
                  {(cat && cat.id !== root.id) ? `${root.name} \u203a ${cat.name}` : root?.name}
                </div>
                <div style={{ fontFamily: t.fontBody, fontSize: 12.5, color: t.ink2 }}>{account?.short} · {account?.last4}</div>
                <div style={{
                  textAlign: 'right',
                  fontFamily: t.fontDisplay, fontSize: 14, fontWeight: t.displayWeight,
                  color: tx.type === 'income' ? t.positive : t.ink,
                  fontVariantNumeric: 'tabular-nums',
                }}>{(tx.type === 'income' ? '+' : '\u2212') + fmtINR(tx.amount)}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Filter modal (desktop variant) */}
      {isFilterOpen && <DesktopFilterModal t={t} />}
    </div>
  );
}

Object.assign(window, {
  NoteField, TagRow, ContextChips, QUICK_TAGS, ALL_TAGS,
  MonthPickerDropdown, Sheet, FilterSheet, TagDialog, AccountPickerSheet,
  EmptyState, RupiverseDesktop, DesktopDashboard, DesktopLedger,
  DesktopAccounts, DesktopCategories, DesktopGraph, DesktopAddModal, DesktopFilterModal,
  CategoryField,
});

// ─────────────────────────────────────────────────────────────
// CategoryField — the Add screen's category area. Manual + on-demand AI.
//   memory      → known merchant; category filled instantly from history
//   ai-idle     → new merchant; "Categorize with AI" button
//   ai-loading  → button in loading state
//   ai-suggested→ editable suggestion chip (low confidence flagged)
// Income shows a "Bill split" suggestion; expense shows Food → Food delivery.
// ─────────────────────────────────────────────────────────────
function CategoryField({ t, type, aiState = 'memory' }) {
  const Label = () => (
    <div style={{ fontFamily: t.fontBody, fontSize: 11, color: t.ink3, marginBottom: 4, marginLeft: 14, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Category</div>
  );
  const sparkle = (color) => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round"><path d="M7 1.5l1.2 3.3 3.3 1.2-3.3 1.2L7 10.5 5.8 7.2 2.5 6l3.3-1.2L7 1.5z M11 9.5l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6z"/></svg>
  );
  const suggestion = type === 'income' ? 'Bill split' : 'Food → Food delivery';

  // Known merchant → instant fill from merchant-memory. No AI involved.
  if (aiState === 'memory' || aiState === 'autocomplete') {
    return (
      <div>
        <Label />
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 14px', borderRadius: t.radiusM,
          background: t.surface, border: `1px solid ${t.border}`,
        }}>
          <div style={{
            width: 26, height: 26, borderRadius: 7,
            background: (type === 'income' ? '#3F5B8A' : '#B5460F') + '24',
            border: `1px solid ${(type === 'income' ? '#3F5B8A' : '#B5460F')}40`,
            color: type === 'income' ? '#3F5B8A' : '#B5460F',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: t.fontDisplay, fontSize: 9, fontWeight: 600, flexShrink: 0,
          }}>{type === 'income' ? 'Sp' : 'Fo'}</div>
          <span style={{ flex: 1, fontFamily: t.fontBody, fontSize: 14, color: t.ink, fontWeight: 500 }}>{suggestion}</span>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            fontFamily: t.fontBody, fontSize: 10.5, color: t.ink3,
            background: t.sunken, padding: '3px 7px', borderRadius: 999,
          }}>
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M6 3v3l2 1"/><circle cx="6" cy="6" r="5"/></svg>
            from history
          </span>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={t.ink3} strokeWidth="1.6" strokeLinecap="round"><path d="M4 5l3 3 3-3"/></svg>
        </div>
      </div>
    );
  }

  if (aiState === 'ai-idle') {
    return (
      <div>
        <Label />
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{
            flex: 1, height: 44, borderRadius: t.radiusM,
            background: t.accentSoft, border: `1px solid ${t.accent}55`,
            color: t.accent, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            fontFamily: t.fontBody, fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap',
          }}>
            {sparkle(t.accent)}
            Categorize with AI
          </button>
          <button style={{
            height: 44, padding: '0 14px', borderRadius: t.radiusM,
            background: t.surface, border: `1px solid ${t.border}`,
            color: t.ink2, cursor: 'pointer',
            fontFamily: t.fontBody, fontSize: 14, fontWeight: 500,
          }}>Pick</button>
        </div>
        <div style={{ fontFamily: t.fontBody, fontSize: 11, color: t.ink3, marginTop: 6, marginLeft: 2 }}>
          New merchant — tap to suggest a category, or pick one yourself.
        </div>
      </div>
    );
  }

  if (aiState === 'ai-loading') {
    return (
      <div>
        <Label />
        <div style={{
          height: 44, borderRadius: t.radiusM,
          background: t.accentSoft, border: `1px solid ${t.accent}55`,
          color: t.accent,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          fontFamily: t.fontBody, fontSize: 14, fontWeight: 600,
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M8 1.5a6.5 6.5 0 1 1-6.5 6.5" opacity="0.9"/>
            <path d="M1.5 8a6.5 6.5 0 0 1 3-5.5" opacity="0.3"/>
          </svg>
          Categorizing…
        </div>
        <div style={{ fontFamily: t.fontBody, fontSize: 11, color: t.ink3, marginTop: 6, marginLeft: 2 }}>
          Asking the local model — this stays on your server.
        </div>
      </div>
    );
  }

  // ai-suggested
  return (
    <div>
      <Label />
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 12px', borderRadius: t.radiusM,
        background: t.accentSoft, border: `1px solid ${t.accent}55`,
      }}>
        {sparkle(t.accent)}
        <span style={{
          fontFamily: t.fontBody, fontSize: 13, color: t.accent, fontWeight: 600,
          background: t.surface, padding: '4px 10px', borderRadius: 999,
          border: `1px solid ${t.accent}50`,
        }}>{type === 'income' ? 'Refunds' : 'Food → Dining out → Coffee'}</span>
        <span style={{ flex: 1 }} />
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          fontFamily: t.fontBody, fontSize: 10.5, color: '#B5820F',
          background: '#B5820F18', padding: '3px 7px', borderRadius: 999,
        }}>
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M6 2.5v4M6 9h0"/></svg>
          62%
        </span>
        <button style={{ background: 'transparent', border: 'none', color: t.ink2, fontFamily: t.fontBody, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Change</button>
      </div>
      <div style={{ fontFamily: t.fontBody, fontSize: 11, color: t.ink3, marginTop: 6, marginLeft: 2 }}>
        Low confidence — give it a glance. Tap to change; your choice is remembered.
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// DesktopAccounts — wide accounts page.
// ─────────────────────────────────────────────────────────────
function DesktopAccounts({ t }) {
  const netWorth = ACCOUNTS.reduce((s, a) => s + a.balance, 0);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 1080 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: t.fontBody, fontSize: 12, color: t.ink3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Accounts</div>
          <div style={{ fontFamily: t.fontDisplay, fontSize: 30, color: t.ink, fontWeight: t.displayWeight, letterSpacing: t.displayTracking }}>Balance & flow</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{
            height: 36, padding: '0 14px', borderRadius: 10,
            background: t.surface, border: `1px solid ${t.border}`,
            fontFamily: t.fontBody, fontSize: 13, color: t.ink, fontWeight: 500, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M2 5h10M9 2l3 3-3 3 M12 9H2M5 12L2 9l3-3"/></svg>
            Transfer between
          </button>
          <button style={{
            height: 36, padding: '0 14px', borderRadius: 10,
            background: t.accent, border: 'none', color: t.accentInk,
            fontFamily: t.fontBody, fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>+ Add account</button>
        </div>
      </div>

      {/* Net worth strip */}
      <div style={{
        background: t.surface, border: `1px solid ${t.border}`,
        borderRadius: 14, padding: 22, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: -10, top: -22, pointerEvents: 'none' }}>
          <DevaGlyph char="ता" theme={t} size={140} opacity={0.05} />
        </div>
        <div style={{ position: 'relative' }}>
          <div style={{ fontFamily: t.fontBody, fontSize: 11, color: t.ink3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total balance</div>
          <BigAmount t={t} value={netWorth} size={38} />
        </div>
        <div style={{ position: 'relative', display: 'flex', gap: 22 }}>
          <div>
            <div style={{ fontFamily: t.fontBody, fontSize: 11, color: t.ink3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>In this month</div>
            <div style={{ fontFamily: t.fontDisplay, fontSize: 18, color: t.positive, fontWeight: t.displayWeight, marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>+{fmtINR(MONTH_SUMMARY.in, { compact: true })}</div>
          </div>
          <div>
            <div style={{ fontFamily: t.fontBody, fontSize: 11, color: t.ink3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Out this month</div>
            <div style={{ fontFamily: t.fontDisplay, fontSize: 18, color: t.ink, fontWeight: t.displayWeight, marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>−{fmtINR(MONTH_SUMMARY.out, { compact: true })}</div>
          </div>
        </div>
      </div>

      {/* Account cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
        {ACCOUNTS.map((a) => {
          const isCard = a.type === 'credit_card';
          return (
            <div key={a.id} style={{
              background: t.surface, border: `1px solid ${t.border}`,
              borderRadius: 14, padding: 20,
              display: 'flex', flexDirection: 'column', gap: 16,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 10,
                  background: a.color, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: t.fontDisplay, fontWeight: 700, fontSize: 14,
                }}>{a.short.slice(0, 2).toUpperCase()}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: t.fontBody, fontSize: 15, color: t.ink, fontWeight: 600 }}>{a.name}</div>
                  <div style={{ fontFamily: t.fontMono, fontSize: 11.5, color: t.ink3, marginTop: 2 }}>•••• {a.last4} · <span style={{ textTransform: 'capitalize' }}>{a.type.replace('_', ' ')}</span></div>
                </div>
                <div style={{
                  fontFamily: t.fontDisplay, fontSize: 22, fontWeight: t.displayWeight,
                  color: a.balance < 0 ? t.negative : t.ink, fontVariantNumeric: 'tabular-nums',
                }}>{fmtINR(a.balance)}</div>
              </div>
              {(a.monthIn || a.monthOut) > 0 && (
                <div style={{ paddingTop: 14, borderTop: `1px solid ${t.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                    <span style={{ fontFamily: t.fontBody, fontSize: 10.5, color: t.ink3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>This month</span>
                    <div style={{ display: 'flex', gap: 14, fontFamily: t.fontMono, fontSize: 12, fontVariantNumeric: 'tabular-nums' }}>
                      {a.monthIn > 0 && <span style={{ color: t.positive }}>+{fmtINR(a.monthIn, { compact: true })}</span>}
                      {a.monthOut > 0 && <span style={{ color: t.ink2 }}>−{fmtINR(a.monthOut, { compact: true })}</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ height: 5, background: t.sunken, borderRadius: 2.5, overflow: 'hidden' }}>
                      {a.monthIn > 0 && <div style={{ width: `${Math.min(100, a.monthIn / Math.max(a.monthIn, a.monthOut) * 100)}%`, height: '100%', background: t.positive }} />}
                    </div>
                    <div style={{ height: 5, background: t.sunken, borderRadius: 2.5, overflow: 'hidden' }}>
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
// DesktopCategories — wide tree with right-side detail.
// ─────────────────────────────────────────────────────────────
function DesktopCategories({ t }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 1080 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: t.fontBody, fontSize: 12, color: t.ink3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Categories</div>
          <div style={{ fontFamily: t.fontDisplay, fontSize: 30, color: t.ink, fontWeight: t.displayWeight, letterSpacing: t.displayTracking }}>Tree</div>
        </div>
        <button style={{
          height: 36, padding: '0 14px', borderRadius: 10,
          background: t.accent, border: 'none', color: t.accentInk,
          fontFamily: t.fontBody, fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}>+ New category</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14 }}>
        {/* Tree column */}
        <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, overflow: 'hidden' }}>
          {CATEGORIES.map((c) => (
            <div key={c.id} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 18px',
              borderBottom: `1px solid ${t.border}`,
              background: c.id === 'food' ? t.accentSoft : 'transparent',
            }}>
              <CatBadge cat={c} t={t} size={34} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: t.fontBody, fontSize: 14, color: t.ink, fontWeight: 600 }}>{c.name}</div>
                <div style={{ fontFamily: t.fontBody, fontSize: 11.5, color: t.ink3, marginTop: 2 }}>{c.children ? `${c.children.length} sub-categories` : 'leaf'}</div>
              </div>
              <div style={{ fontFamily: t.fontDisplay, fontSize: 14, color: t.ink2, fontVariantNumeric: 'tabular-nums', fontWeight: t.displayWeight }}>
                {(() => {
                  const tot = c.spend ?? (c.children ? c.children.reduce((s, x) => s + (x.spend || 0) + (x.children ? x.children.reduce((s2, y) => s2 + (y.spend || 0), 0) : 0), 0) : 0);
                  return tot > 0 ? fmtINR(tot, { compact: true }) : '—';
                })()}
              </div>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={t.ink3} strokeWidth="1.6" strokeLinecap="round"><path d="M5 3l4 4-4 4"/></svg>
            </div>
          ))}
        </div>
        {/* Detail column */}
        <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
            <CatBadge cat={CATEGORIES[0]} t={t} size={44} />
            <div>
              <div style={{ fontFamily: t.fontDisplay, fontSize: 20, color: t.ink, fontWeight: t.displayWeight, letterSpacing: t.displayTracking }}>Food</div>
              <div style={{ fontFamily: t.fontBody, fontSize: 12, color: t.ink3, marginTop: 2 }}>3 sub-categories · 35 transactions this month</div>
            </div>
          </div>
          <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: `1px solid ${t.border}` }}>
            <div style={{ fontFamily: t.fontBody, fontSize: 11, color: t.ink3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Spent this month</div>
            <BigAmount t={t} value={25900} size={28} />
          </div>
          <div style={{ fontFamily: t.fontBody, fontSize: 11, color: t.ink3, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Sub-categories</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {CATEGORIES[0].children.map((c, i) => {
              const tot = c.spend ?? (c.children ? c.children.reduce((s, x) => s + (x.spend || 0), 0) : 0);
              return (
                <div key={c.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 0',
                  borderTop: i > 0 ? `1px solid ${t.border}` : 'none',
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: CATEGORIES[0].swatch }} />
                  <span style={{ flex: 1, fontFamily: t.fontBody, fontSize: 13.5, color: t.ink, fontWeight: 500 }}>{c.name}</span>
                  <span style={{ fontFamily: t.fontMono, fontSize: 12, color: t.ink3 }}>{c.count}×</span>
                  <span style={{ fontFamily: t.fontDisplay, fontSize: 13.5, color: t.ink, fontWeight: t.displayWeight, fontVariantNumeric: 'tabular-nums', width: 70, textAlign: 'right' }}>{fmtINR(tot, { compact: true })}</span>
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
// DesktopGraph — dedicated graph detail page (wide).
// ─────────────────────────────────────────────────────────────
function DesktopGraph({ t }) {
  // Same data as mobile, larger canvas.
  const daily = [320, 0, 460, 1280, 0, 240, 3460, 1100, 0, 0, 760, 2200, 39400, 4180, 2840, 1280, 1784, 0, 1280];
  const selectedIdx = 12;
  const max = Math.max(...daily);
  const w = 900, h = 200;
  const barW = (w - 2) / daily.length;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 1080 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: t.fontBody, fontSize: 12, color: t.ink3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
            <span style={{ cursor: 'pointer' }}>Dashboard</span> <span style={{ opacity: 0.4 }}>›</span> Breakdown
          </div>
          <div style={{ fontFamily: t.fontDisplay, fontSize: 30, color: t.ink, fontWeight: t.displayWeight, letterSpacing: t.displayTracking }}>Spend in May 2026</div>
          <div style={{ fontFamily: t.fontBody, fontSize: 13, color: t.ink3, marginTop: 6 }}>1 – 19 May · 47 transactions</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{
            height: 36, padding: '0 14px', borderRadius: 10,
            background: t.surface, border: `1px solid ${t.border}`,
            fontFamily: t.fontBody, fontSize: 13, color: t.ink, fontWeight: 500, cursor: 'pointer',
          }}>Export CSV</button>
        </div>
      </div>

      {/* View + timeframe — sit on one row */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ background: t.sunken, borderRadius: 999, padding: 3, display: 'flex' }}>
          {[{ k: 'expense', l: 'Expense' }, { k: 'income', l: 'Income' }, { k: 'net', l: 'Net' }].map((x, i) => (
            <button key={x.k} style={{
              height: 32, padding: '0 18px', borderRadius: 999, border: 'none',
              background: i === 0 ? t.surface : 'transparent',
              boxShadow: i === 0 ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              color: i === 0 ? t.ink : t.ink2,
              fontFamily: t.fontBody, fontSize: 13, fontWeight: i === 0 ? 600 : 500,
              cursor: 'pointer',
            }}>{x.l}</button>
          ))}
        </div>
        <span style={{ flex: 1 }} />
        <div style={{ background: t.sunken, borderRadius: 999, padding: 3, display: 'flex' }}>
          {['D','W','M','6M','Y'].map((k, i) => (
            <button key={k} style={{
              height: 32, padding: '0 16px', borderRadius: 999, border: 'none',
              background: i === 2 ? t.surface : 'transparent',
              boxShadow: i === 2 ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              color: i === 2 ? t.accent : t.ink2,
              fontFamily: t.fontBody, fontSize: 13, fontWeight: i === 2 ? 700 : 500,
              cursor: 'pointer', minWidth: 36,
            }}>{k}</button>
          ))}
        </div>
      </div>

      {/* Chart card */}
      <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 14, padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
          <div>
            <div style={{ fontFamily: t.fontBody, fontSize: 11, color: t.ink3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Mon, 13 May · Rent</div>
            <BigAmount t={t} value={39400} size={30} />
          </div>
          <div style={{ display: 'flex', gap: 22, fontFamily: t.fontBody, fontSize: 11, color: t.ink3 }}>
            <div>
              <div style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>Daily avg</div>
              <div style={{ fontFamily: t.fontDisplay, fontSize: 16, fontWeight: t.displayWeight, color: t.ink, marginTop: 2 }}>{fmtINR(Math.round(60584 / 19))}</div>
            </div>
            <div>
              <div style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>vs april</div>
              <div style={{ fontFamily: t.fontDisplay, fontSize: 16, fontWeight: t.displayWeight, color: t.positive, marginTop: 2 }}>−27%</div>
            </div>
          </div>
        </div>
        <svg viewBox={`0 0 ${w} ${h + 24}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
          <line x1="0" y1={h - (daily[selectedIdx] / max) * h} x2={w} y2={h - (daily[selectedIdx] / max) * h} stroke={t.border} strokeWidth="1" strokeDasharray="3 4" />
          {daily.map((v, i) => {
            const bh = (v / max) * h;
            const x = i * barW + 1;
            const active = i === selectedIdx;
            return (
              <g key={i}>
                <rect x={x} y={h - bh} width={barW - 4} height={bh || 1} fill={active ? t.accent : t.accent + '55'} rx={3} />
                <text x={x + (barW - 4) / 2} y={h + 18} textAnchor="middle"
                  fontFamily="ui-sans-serif, system-ui" fontSize="10"
                  fontWeight={active ? 600 : 400}
                  fill={active ? t.ink : t.ink3}>{i + 1}</text>
              </g>
            );
          })}
          <g transform={`translate(${selectedIdx * barW + (barW - 4) / 2 + 1}, ${h - (daily[selectedIdx] / max) * h - 10})`}>
            <circle r="5" fill={t.surface} stroke={t.accent} strokeWidth="2.6" />
          </g>
        </svg>
      </div>

      {/* Breakdown table */}
      <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px 8px', fontFamily: t.fontDisplay, fontSize: 15, color: t.ink, fontWeight: t.displayWeight }}>By category</div>
        {SPEND_BY_CATEGORY.map((s, i) => {
          const pct = Math.round(s.amount / 121935 * 100);
          const cat = CAT_BY_ID[s.id];
          return (
            <div key={s.id} style={{
              display: 'grid', gridTemplateColumns: '40px 1fr 80px 220px 100px',
              alignItems: 'center', gap: 14,
              padding: '14px 20px',
              borderTop: `1px solid ${t.border}`,
            }}>
              <CatBadge cat={cat} t={t} size={32} />
              <div style={{ fontFamily: t.fontBody, fontSize: 14, color: t.ink, fontWeight: 500 }}>{s.name}</div>
              <div style={{ fontFamily: t.fontMono, fontSize: 11.5, color: t.ink3 }}>{Math.max(1, Math.round(pct/4))} txn</div>
              <div style={{ height: 6, background: t.sunken, borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: s.color }} />
              </div>
              <div style={{ textAlign: 'right', fontFamily: t.fontDisplay, fontSize: 14, color: t.ink, fontWeight: t.displayWeight, fontVariantNumeric: 'tabular-nums' }}>{fmtINR(s.amount, { compact: true })}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// DesktopAddModal — centered modal that wraps the mobile Add screen.
// State + initialType flow through so all variants render correctly.
// ─────────────────────────────────────────────────────────────
function DesktopAddModal({ t, initialType = 'expense', state }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 30,
      background: 'rgba(14,14,12,0.4)',
      backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 40,
    }}>
      <div style={{
        width: 480, maxHeight: '100%', background: t.page,
        borderRadius: 18, overflow: 'hidden',
        boxShadow: '0 30px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,0,0,0.05)',
        display: 'flex', flexDirection: 'column',
      }}>
        <ScreenAdd t={t} initialType={initialType} state={state} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// DesktopFilterModal — centered filter modal on Ledger.
// ─────────────────────────────────────────────────────────────
function DesktopFilterModal({ t }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 30,
      background: 'rgba(14,14,12,0.4)',
      backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 40,
    }}>
      <div style={{
        width: 520, maxHeight: '100%', background: t.surface,
        borderRadius: 18, overflow: 'hidden',
        boxShadow: '0 30px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,0,0,0.05)',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px', borderBottom: `1px solid ${t.border}`,
        }}>
          <div style={{ fontFamily: t.fontDisplay, fontSize: 17, color: t.ink, fontWeight: t.displayWeight }}>Filters</div>
          <button style={{
            background: 'transparent', border: 'none', color: t.ink2,
            width: 28, height: 28, borderRadius: 6, cursor: 'pointer',
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 3l8 8M11 3l-8 8"/></svg>
          </button>
        </div>
        <div style={{ padding: '18px 20px 0', display: 'flex', flexDirection: 'column', gap: 16, overflow: 'auto' }}>
          {/* Reuse the same controls as mobile FilterSheet inner body */}
          <FilterControlsInner t={t} />
        </div>
        <div style={{ padding: '14px 20px', borderTop: `1px solid ${t.border}`, display: 'flex', gap: 8 }}>
          <button style={{
            flex: 1, height: 40, borderRadius: 10,
            background: t.chipBg, color: t.ink, border: 'none',
            fontFamily: t.fontBody, fontSize: 13.5, fontWeight: 500, cursor: 'pointer',
          }}>Reset</button>
          <button style={{
            flex: 2, height: 40, borderRadius: 10,
            background: t.accent, color: t.accentInk, border: 'none',
            fontFamily: t.fontDisplay, fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
          }}>Apply · 6 results</button>
        </div>
      </div>
    </div>
  );
}

// Shared filter controls used by both mobile FilterSheet and DesktopFilterModal.
function FilterControlsInner({ t }) {
  return (
    <>
      <div>
        <div style={{ fontFamily: t.fontBody, fontSize: 11, color: t.ink3, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Date range</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['This month', 'Last month', 'Last 90 days', 'Year to date', 'Custom…'].map((p, i) => (
            <button key={p} style={{
              height: 30, padding: '0 12px', borderRadius: 999,
              background: i === 0 ? t.accent : t.chipBg,
              color: i === 0 ? t.accentInk : t.chipInk,
              border: 'none', fontFamily: t.fontBody, fontSize: 13, fontWeight: 500, cursor: 'pointer',
            }}>{p}</button>
          ))}
        </div>
      </div>
      <div>
        <div style={{ fontFamily: t.fontBody, fontSize: 11, color: t.ink3, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Categories</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {CATEGORIES.slice(0, 7).map((c) => {
            const on = c.id === 'food';
            return (
              <button key={c.id} style={{
                height: 32, padding: '0 12px', borderRadius: 999,
                background: on ? c.swatch : t.chipBg,
                color: on ? '#fff' : t.chipInk,
                border: 'none', fontFamily: t.fontBody, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}>
                <span style={{
                  width: 16, height: 16, borderRadius: 4,
                  background: on ? 'rgba(255,255,255,0.25)' : c.swatch + '24',
                  color: on ? '#fff' : c.swatch,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: t.fontDisplay, fontSize: 9, fontWeight: 600,
                }}>{c.abbr}</span>
                {c.name}
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <div style={{ fontFamily: t.fontBody, fontSize: 11, color: t.ink3, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Accounts</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {ACCOUNTS.map((a) => {
            const on = a.id === 'a3';
            return (
              <button key={a.id} style={{
                height: 32, padding: '0 12px', borderRadius: 999,
                background: on ? t.accent : t.chipBg,
                color: on ? t.accentInk : t.chipInk,
                border: 'none', fontFamily: t.fontBody, fontSize: 13, fontWeight: 500, cursor: 'pointer',
              }}>{a.short} · {a.last4}</button>
            );
          })}
        </div>
      </div>
      <div>
        <div style={{ fontFamily: t.fontBody, fontSize: 11, color: t.ink3, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Amount range</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ flex: 1, height: 34, background: t.chipBg, borderRadius: 8, padding: '0 12px', display: 'flex', alignItems: 'center', fontFamily: t.fontMono, fontSize: 13, color: t.ink2 }}>₹0</div>
          <span style={{ color: t.ink3 }}>—</span>
          <div style={{ flex: 1, height: 34, background: t.chipBg, borderRadius: 8, padding: '0 12px', display: 'flex', alignItems: 'center', fontFamily: t.fontMono, fontSize: 13, color: t.ink2 }}>any</div>
        </div>
      </div>
      <div style={{ paddingBottom: 16 }}>
        <div style={{ fontFamily: t.fontBody, fontSize: 11, color: t.ink3, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Type</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['All', 'Expense', 'Income', 'Transfer'].map((m, i) => (
            <button key={m} style={{
              flex: 1, height: 32, borderRadius: 8,
              background: i === 0 ? t.accent : t.chipBg,
              color: i === 0 ? t.accentInk : t.chipInk,
              border: 'none', fontFamily: t.fontBody, fontSize: 13, fontWeight: 500, cursor: 'pointer',
            }}>{m}</button>
          ))}
        </div>
      </div>
    </>
  );
}
