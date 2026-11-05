// khata-auth.jsx — Authentication screens for Rupiverse.
// Email + password login / signup, email OTP verification, and the
// forgot-password → OTP → reset-password flow. Built to extend later with
// Google SSO / mobile-number auth (see the "more ways" slot on Login).
//
// Loaded before khata-screens.jsx; everything is assigned to window at the end.
// Mobile screens render via <AuthScreen variant=…>; desktop via <DesktopAuth>.

// ── Validation helpers (real, so error states are honest) ────────────────────
function pwRules(pw) {
  return [
    { label: '8+ characters',   ok: pw.length >= 8 },
    { label: '1 uppercase',     ok: /[A-Z]/.test(pw) },
    { label: '1 number',        ok: /[0-9]/.test(pw) },
    { label: '1 special char',  ok: /[^A-Za-z0-9]/.test(pw) },
  ];
}

// ── Field ────────────────────────────────────────────────────────────────────
// label + input with optional prefix, error (red), valid (green check), hint.
function AuthField({ t, label, value, placeholder, type = 'text', prefix, error, valid, hint, rightSlot, optional }) {
  const borderColor = error ? t.negative : valid ? t.positive : t.borderStrong;
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 5, marginLeft: 2 }}>
        <label style={{ fontFamily: t.fontBody, fontSize: 12, color: t.ink2, fontWeight: 500, whiteSpace: 'nowrap' }}>{label}</label>
        {optional && <span style={{ fontFamily: t.fontBody, fontSize: 11, color: t.ink3 }}>optional</span>}
      </div>
      <div style={{
        display: 'flex', alignItems: 'center',
        height: 46, borderRadius: t.radiusM,
        background: t.surface,
        border: `1px solid ${borderColor}`,
        boxShadow: error ? `0 0 0 3px ${t.negative}1A` : valid ? `0 0 0 3px ${t.positive}14` : 'none',
        overflow: 'hidden',
      }}>
        {prefix && (
          <span style={{
            paddingLeft: 12, paddingRight: 8, fontFamily: t.fontBody, fontSize: 14.5,
            color: t.ink2, borderRight: `1px solid ${t.border}`, height: '100%',
            display: 'flex', alignItems: 'center', marginRight: 10,
          }}>{prefix}</span>
        )}
        <span style={{
          flex: 1, paddingLeft: prefix ? 0 : 14, paddingRight: 12,
          fontFamily: t.fontBody, fontSize: 14.5,
          color: value ? t.ink : t.ink3,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{value || placeholder}</span>
        {rightSlot}
        {valid && !rightSlot && (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={t.positive} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 12 }}><path d="M3 8.5l3 3 7-7"/></svg>
        )}
        {error && !rightSlot && (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={t.negative} strokeWidth="2" strokeLinecap="round" style={{ marginRight: 12 }}><circle cx="8" cy="8" r="6.5"/><path d="M8 5v3.5M8 11h0"/></svg>
        )}
      </div>
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 5, marginLeft: 2 }}>
          <span style={{ fontFamily: t.fontBody, fontSize: 12, color: t.negative }}>{error}</span>
        </div>
      )}
      {hint && !error && (
        <div style={{ fontFamily: t.fontBody, fontSize: 11.5, color: t.ink3, marginTop: 5, marginLeft: 2 }}>{hint}</div>
      )}
    </div>
  );
}

// ── Password field (eye toggle) + optional rules checklist ───────────────────
function PasswordField({ t, label, value, error, valid, showRules, revealed, forgotLink }) {
  const dots = '•'.repeat(value ? value.length : 0);
  const eye = (
    <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0 12px', color: t.ink3, display: 'flex', alignItems: 'center' }}>
      {revealed ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/><path d="M3 3l18 18"/></svg>
      )}
    </button>
  );
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 5, marginLeft: 2 }}>
        <label style={{ fontFamily: t.fontBody, fontSize: 12, color: t.ink2, fontWeight: 500, whiteSpace: 'nowrap' }}>{label}</label>
        {forgotLink && <span style={{ fontFamily: t.fontBody, fontSize: 12, color: t.accent, fontWeight: 600, cursor: 'pointer' }}>Forgot?</span>}
      </div>
      <div style={{
        display: 'flex', alignItems: 'center',
        height: 46, borderRadius: t.radiusM, background: t.surface,
        border: `1px solid ${error ? t.negative : valid ? t.positive : t.borderStrong}`,
        boxShadow: error ? `0 0 0 3px ${t.negative}1A` : 'none',
        overflow: 'hidden',
      }}>
        <span style={{
          flex: 1, paddingLeft: 14, fontFamily: revealed ? t.fontBody : t.fontDisplay, fontSize: revealed ? 14.5 : 18,
          color: t.ink, letterSpacing: revealed ? 0 : 2, whiteSpace: 'nowrap', overflow: 'hidden',
        }}>{revealed ? value : dots}</span>
        {eye}
      </div>
      {error && (
        <div style={{ fontFamily: t.fontBody, fontSize: 12, color: t.negative, marginTop: 5, marginLeft: 2 }}>{error}</div>
      )}
      {showRules && <PasswordRules t={t} value={value} />}
    </div>
  );
}

function PasswordRules({ t, value }) {
  const rules = pwRules(value || '');
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px', marginTop: 9, marginLeft: 2 }}>
      {rules.map((r) => (
        <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 5, width: 'calc(50% - 7px)' }}>
          {r.ok ? (
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke={t.positive} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 7.5l2.5 2.5 6.5-6.5"/></svg>
          ) : (
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke={t.ink3} strokeWidth="1.8" strokeLinecap="round"><circle cx="7" cy="7" r="5"/></svg>
          )}
          <span style={{ fontFamily: t.fontBody, fontSize: 11.5, color: r.ok ? t.ink2 : t.ink3, whiteSpace: 'nowrap' }}>{r.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Gender (segmented, optional) ─────────────────────────────────────────────
function GenderSelect({ t, value }) {
  const opts = ['Male', 'Female', 'Other'];
  return (
    <div>
      <div style={{ marginBottom: 5, marginLeft: 2, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <label style={{ fontFamily: t.fontBody, fontSize: 12, color: t.ink2, fontWeight: 500 }}>Gender</label>
        <span style={{ fontFamily: t.fontBody, fontSize: 11, color: t.ink3 }}>optional</span>
      </div>
      <div style={{ background: t.sunken, borderRadius: 999, padding: 3, display: 'flex' }}>
        {opts.map((o) => {
          const on = value === o;
          return (
            <button key={o} style={{
              flex: 1, height: 36, borderRadius: 999, border: 'none',
              background: on ? t.surface : 'transparent',
              boxShadow: on ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
              color: on ? t.ink : t.ink2,
              fontFamily: t.fontBody, fontSize: 13.5, fontWeight: on ? 600 : 500, cursor: 'pointer',
            }}>{o}</button>
          );
        })}
      </div>
    </div>
  );
}

// ── OTP input (6 cells) ──────────────────────────────────────────────────────
function OTPInput({ t, filled = '', activeIndex }) {
  const cells = Array.from({ length: 6 });
  const active = activeIndex != null ? activeIndex : filled.length;
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
      {cells.map((_, i) => {
        const ch = filled[i];
        const isActive = i === active;
        return (
          <div key={i} style={{
            width: 46, height: 56, borderRadius: t.radiusM,
            background: t.surface,
            border: `1.5px solid ${isActive ? t.accent : ch ? t.borderStrong : t.border}`,
            boxShadow: isActive ? `0 0 0 3px ${t.accent}22` : 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: t.fontDisplay, fontSize: 24, fontWeight: t.displayWeight, color: t.ink,
          }}>
            {ch || (isActive ? <span style={{ width: 2, height: 24, background: t.accent, borderRadius: 1 }} /> : '')}
          </div>
        );
      })}
    </div>
  );
}

// ── Primary / secondary buttons ──────────────────────────────────────────────
function AuthPrimary({ t, label, disabled }) {
  return (
    <button style={{
      width: '100%', height: 50, borderRadius: t.radiusM, border: 'none',
      background: disabled ? t.chipBg : t.accent,
      color: disabled ? t.ink3 : t.accentInk,
      fontFamily: t.fontDisplay, fontSize: 16, fontWeight: 600, letterSpacing: '0.01em',
      cursor: disabled ? 'not-allowed' : 'pointer',
    }}>{label}</button>
  );
}

// ── The form body per variant — shared by mobile + desktop ───────────────────
function AuthBody({ t, variant }) {
  const H = ({ title, sub }) => (
    <div style={{ marginBottom: 22 }}>
      <div style={{ fontFamily: t.fontDisplay, fontSize: 26, color: t.ink, fontWeight: t.displayWeight, letterSpacing: t.displayTracking, lineHeight: 1.15 }}>{title}</div>
      {sub && <div style={{ fontFamily: t.fontBody, fontSize: 14, color: t.ink2, marginTop: 6, lineHeight: 1.45 }}>{sub}</div>}
    </div>
  );
  const Footer = ({ children }) => (
    <div style={{ textAlign: 'center', marginTop: 22, fontFamily: t.fontBody, fontSize: 13.5, color: t.ink2 }}>{children}</div>
  );
  const Link = ({ children }) => <span style={{ color: t.accent, fontWeight: 600, cursor: 'pointer' }}>{children}</span>;

  // ── LOGIN ──
  if (variant === 'login') {
    return (
      <>
        <H title="Welcome back" sub="Log in to your Rupiverse." />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <AuthField t={t} label="Email" value="venu@gmail.com" type="email" />
          <PasswordField t={t} label="Password" value="Rupi@2026" forgotLink />
          <AuthPrimary t={t} label="Log in" />
        </div>
        {/* Extensible sign-in area — Google SSO + mobile come later. */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '22px 0 16px' }}>
          <div style={{ flex: 1, height: 1, background: t.border }} />
          <span style={{ fontFamily: t.fontBody, fontSize: 11.5, color: t.ink3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>or</span>
          <div style={{ flex: 1, height: 1, background: t.border }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[['Continue with Google', 'G'], ['Continue with phone number', '☎']].map(([lbl]) => (
            <button key={lbl} disabled style={{
              width: '100%', height: 46, borderRadius: t.radiusM,
              background: t.surface, border: `1px solid ${t.border}`,
              color: t.ink3, cursor: 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              fontFamily: t.fontBody, fontSize: 13.5, fontWeight: 500, position: 'relative',
            }}>
              {lbl}
              <span style={{
                position: 'absolute', right: 12, fontFamily: t.fontBody, fontSize: 9.5, fontWeight: 600,
                color: t.ink3, background: t.sunken, padding: '2px 6px', borderRadius: 999,
                textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>Soon</span>
            </button>
          ))}
        </div>
        <Footer>New to Rupiverse? <Link>Create an account</Link></Footer>
      </>
    );
  }

  // ── SIGNUP (valid) & SIGNUP-INVALID ──
  if (variant === 'signup' || variant === 'signup-invalid') {
    const bad = variant === 'signup-invalid';
    return (
      <>
        <H title="Create your account" sub="Track every rupee across your accounts." />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
          <AuthField t={t} label="Name"
            value={bad ? 'Ve' : 'Venu Gopal'}
            valid={!bad}
            error={bad ? 'Name must be at least 3 characters' : null} />
          <AuthField t={t} label="Age"
            value={bad ? '15' : '29'}
            valid={!bad}
            error={bad ? 'You must be 18 or older' : null} />
          <GenderSelect t={t} value={bad ? null : 'Male'} />
          <AuthField t={t} label="Phone" prefix="+91"
            value={bad ? '98765' : '98765 43210'}
            valid={!bad}
            error={bad ? 'Enter a valid 10-digit number' : null} />
          <AuthField t={t} label="Email" type="email"
            value={bad ? 'venu@gmail' : 'venu@gmail.com'}
            valid={!bad}
            error={bad ? 'Enter a valid email address' : null} />
          <PasswordField t={t} label="Password"
            value={bad ? 'venu' : 'Rupi@2026'}
            showRules
            error={bad ? "Doesn't meet the requirements below" : null} />
          <AuthPrimary t={t} label="Create account" disabled={bad} />
        </div>
        <Footer>Already have an account? <Link>Log in</Link></Footer>
      </>
    );
  }

  // ── OTP (signup email verification) ──
  if (variant === 'otp') {
    return (
      <>
        <H title="Verify your email"
           sub={<span>Enter the 6-digit code we sent to <b style={{ color: t.ink }}>venu@gmail.com</b>.</span>} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <OTPInput t={t} filled="248" />
          <div style={{ textAlign: 'center', fontFamily: t.fontBody, fontSize: 13, color: t.ink3 }}>
            Didn't get it? <span style={{ color: t.ink3 }}>Resend in <b style={{ color: t.ink2 }}>0:24</b></span>
          </div>
          <AuthPrimary t={t} label="Verify email" />
        </div>
        <div style={{ textAlign: 'center', marginTop: 22, fontFamily: t.fontBody, fontSize: 13.5, color: t.ink2 }}>
          Wrong address? <span style={{ color: t.accent, fontWeight: 600, cursor: 'pointer' }}>Change email</span>
        </div>
      </>
    );
  }

  // ── FORGOT (request code) ──
  if (variant === 'forgot') {
    return (
      <>
        <H title="Reset your password" sub="Enter your email and we'll send a 6-digit reset code." />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <AuthField t={t} label="Email" type="email" value="venu@gmail.com" valid />
          <AuthPrimary t={t} label="Send reset code" />
        </div>
        <Footer>Remembered it? <Link>Back to log in</Link></Footer>
      </>
    );
  }

  // ── FORGOT-OTP ──
  if (variant === 'forgot-otp') {
    return (
      <>
        <H title="Check your email"
           sub={<span>We sent a reset code to <b style={{ color: t.ink }}>venu@gmail.com</b>.</span>} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <OTPInput t={t} filled="7193" />
          <div style={{ textAlign: 'center', fontFamily: t.fontBody, fontSize: 13, color: t.ink3 }}>
            Didn't get it? <span style={{ color: t.accent, fontWeight: 600, cursor: 'pointer' }}>Resend code</span>
          </div>
          <AuthPrimary t={t} label="Verify code" />
        </div>
      </>
    );
  }

  // ── RESET (new + confirm) ──
  if (variant === 'reset') {
    return (
      <>
        <H title="Set a new password" sub="Choose a strong password you don't use elsewhere." />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <PasswordField t={t} label="New password" value="Rupiverse@9" showRules valid />
          <PasswordField t={t} label="Confirm new password" value="Rupiverse@1"
            error="Passwords don't match" />
          <AuthPrimary t={t} label="Update password" disabled />
        </div>
      </>
    );
  }

  return null;
}

// Whether a variant shows a back arrow (it's a step inside a flow).
function authHasBack(variant) {
  return ['otp', 'forgot', 'forgot-otp', 'reset'].includes(variant);
}

// ── Mobile auth screen ───────────────────────────────────────────────────────
function AuthScreen({ t, variant = 'login', bottomInset = 0 }) {
  return (
    <div style={{ background: t.page, minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Top: optional back + logo mark */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px 0', minHeight: 40 }}>
        {authHasBack(variant) ? (
          <button style={{
            width: 36, height: 36, borderRadius: 999, border: 'none',
            background: t.surface, color: t.ink, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 0 1px ${t.border}`,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 6l-6 6 6 6"/></svg>
          </button>
        ) : <div style={{ width: 36, height: 36 }} />}
      </div>

      {/* Logo lockup */}
      <div style={{ padding: '14px 24px 6px', display: 'flex', justifyContent: 'center' }}>
        <Logo theme={t} variant="inline" size={30} />
      </div>

      {/* Form */}
      <div style={{ flex: 1, padding: `18px 24px ${20 + bottomInset}px`, display: 'flex', flexDirection: 'column' }}>
        <AuthBody t={t} variant={variant} />
      </div>
    </div>
  );
}

// ── Desktop auth — split brand panel + centered form card ────────────────────
function DesktopAuth({ t, variant = 'login' }) {
  return (
    <div style={{ width: '100%', height: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', background: t.page }}>
      {/* Brand panel */}
      <div style={{
        background: t.accent, color: t.accentInk,
        padding: 48, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: -80, bottom: -80, opacity: 0.12, pointerEvents: 'none' }}>
          <RupeeOrbit size={420} fg={t.accentInk} bg="transparent" />
        </div>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10 }}>
          <RupeeOrbit size={36} fg={t.accent} bg={t.accentInk} radius={10} />
          <span style={{ fontFamily: t.fontDisplay, fontSize: 22, fontWeight: t.displayWeight, color: t.accentInk }}>Rupiverse</span>
        </div>
        <div style={{ position: 'relative' }}>
          <div style={{ fontFamily: t.fontDisplay, fontSize: 34, lineHeight: 1.2, fontWeight: t.displayWeight, letterSpacing: t.displayTracking, maxWidth: 360 }}>
            The rupee, in every form it takes in your life.
          </div>
          <div style={{ fontFamily: t.fontBody, fontSize: 14, opacity: 0.85, marginTop: 14, maxWidth: 320, lineHeight: 1.5 }}>
            One place for every account, every category, every rupee in and out.
          </div>
        </div>
        <div style={{ position: 'relative', fontFamily: t.fontBody, fontSize: 12, opacity: 0.7 }}>India · 2026</div>
      </div>

      {/* Form column */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, overflow: 'auto' }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          {authHasBack(variant) && (
            <button style={{
              border: 'none', background: 'transparent', color: t.ink2, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6, fontFamily: t.fontBody, fontSize: 13, fontWeight: 500,
              marginBottom: 18, padding: 0,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 6l-6 6 6 6"/></svg>
              Back
            </button>
          )}
          <AuthBody t={t} variant={variant} />
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  pwRules, AuthField, PasswordField, PasswordRules, GenderSelect, OTPInput,
  AuthPrimary, AuthBody, AuthScreen, DesktopAuth, authHasBack,
});
