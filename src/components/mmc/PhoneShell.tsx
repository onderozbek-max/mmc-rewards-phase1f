import * as React from 'react';

/**
 * Decorative phone bezel used ONLY for the desktop stakeholder-delivery
 * view (Phase 1D spec §37/§38: "MMC remains mobile-app-only... Desktop
 * remains a stakeholder delivery mechanism only"). At mobile-sized
 * viewports the bezel collapses to a plain full-viewport container via the
 * media query below — the app fills the real screen like the real product,
 * not a picture of a phone inside a phone.
 */
export function PhoneShell({ children }: { children: React.ReactNode }) {
  const screenRef = React.useRef<HTMLDivElement>(null);

  // Modal/BottomSheet/Panel (read-only generated components, all built on the
  // shared Overlay primitive) call ReactDOM.createPortal(..., document.body)
  // with no container override prop — so at runtime they mount as direct
  // children of <body>, OUTSIDE this bezel div entirely, and their CSS
  // (position: fixed; inset: 0) sizes them to the real browser viewport, not
  // the 390px simulated phone screen. There is no prop-based way to redirect
  // that portal. Instead we keep CSS custom properties in sync with the
  // on-screen rect of the phone's screen area, and override the portaled
  // elements' fixed positioning (via our own global CSS below, not by
  // editing the generated files) to use that rect. On mobile the bezel IS
  // the full viewport, so these vars naturally resolve to 0/0/100%/100dvh
  // and nothing changes there.
  React.useEffect(() => {
    const root = document.documentElement;
    let raf = 0;
    const sync = () => {
      const el = screenRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      root.style.setProperty('--mmc-bezel-top', `${rect.top}px`);
      root.style.setProperty('--mmc-bezel-left', `${rect.left}px`);
      root.style.setProperty('--mmc-bezel-width', `${rect.width}px`);
      root.style.setProperty('--mmc-bezel-height', `${rect.height}px`);
    };
    const onEvent = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(sync);
    };
    sync();
    window.addEventListener('resize', onEvent);
    window.addEventListener('scroll', onEvent, true);
    const ro = new ResizeObserver(onEvent);
    if (screenRef.current) ro.observe(screenRef.current);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onEvent);
      window.removeEventListener('scroll', onEvent, true);
      ro.disconnect();
    };
  }, []);

  return (
    <div className="mmc-phone-shell">
      <style>{`
        .mmc-phone-shell {
          width: 390px;
          height: 844px;
          border-radius: 44px;
          border: 10px solid #111;
          box-shadow: 0 30px 60px rgba(0,0,0,0.35);
          overflow: hidden;
          background: #fff;
          position: relative;
          flex-shrink: 0;
        }
        .mmc-phone-shell-scroll {
          position: absolute;
          inset: 0;
          overflow: hidden;
        }
        /* Page (read-only LD component) hardcodes .ld-page-main { min-height: 100vh }
           for real full-page use. Inside the fixed-height desktop bezel simulation
           that would blow past the 844px frame and clip unreachable content. A
           percentage height here is unreliable across browsers, so instead we pin
           <main> to the bezel's box via inset (an absolutely-positioned box's size
           from top/bottom offsets is always definite, unlike percentage height) and
           let it own the scrolling — filling the bezel exactly instead of growing to
           the real viewport. This overrides the generated file from our own code,
           not by editing it.
        */
        .mmc-phone-shell-scroll .ld-page-main {
          min-height: 0 !important;
          height: auto !important;
          position: absolute !important;
          inset: 0 !important;
          overflow: hidden !important;
        }
        @media (max-width: 768px) {
          .mmc-phone-shell {
            width: 100%;
            height: 100dvh;
            border: none;
            border-radius: 0;
            box-shadow: none;
          }
        }
        /* Confine the portaled overlay primitives (see comment above) to the
           phone screen's on-screen rect instead of the real browser viewport.
           Each selector below is the outer fixed-position box for one of the
           overlay types actually used in this app (Overlay's shared trap +
           scrim cover Modal; BottomSheet and Panel additionally size their
           own outer container the same way). Falls back to the real viewport
           before the first measurement effect runs.
        */
        .ld-overlay-trap,
        .ld-overlay-overlayscrim-scrim,
        .ld-bottomsheet-bottomsheetportal-container,
        .ld-panel-panelportal-container {
          position: fixed !important;
          inset: auto !important;
          top: var(--mmc-bezel-top, 0) !important;
          left: var(--mmc-bezel-left, 0) !important;
          width: var(--mmc-bezel-width, 100vw) !important;
          height: var(--mmc-bezel-height, 100dvh) !important;
        }
      `}</style>
      <div className="mmc-phone-shell-scroll" ref={screenRef}>{children}</div>
    </div>
  );
}
