import { useState, useEffect } from "react";
import { DATA } from "./data.js";
import { CONTENT } from "./content.js";
import { ROUTES } from "./routes.js";

/* ============================================================================
   run.remikalir.com — Phase 4 renderer
   Locked Phase 3 design system: a personal, hand-textured, numbers-honest
   field record. Warm paper ground · ink is data · moss is the one accent,
   connective/anchoring only (never on the data). Instrument Sans + DM Mono +
   Fraunces italic (one voice line per view).

   Session 1 (breadth-first): shell + Overview hero (with logo) + Geography
   timeline ribbon. Other tabs are honest in-style placeholders pending their
   Phase 4 ports. About preserves Remi's authored essay verbatim.
   ========================================================================== */

const C = {
  paper:      "#EDE5D2", // warm paper ground (every surface)
  ink:        "#2E2A24", // DATA — the only color data ever wears
  inkFig:     "#2B2723", // figures
  moss:       "#5C7250", // the one accent — connective / anchoring only
  mossDeep:   "#47593D",
  leader:     "#CBBFA8", // dotted leaders
  rule:       "#B9AE97", // hand-inked rules
  structure:  "#B9AE97",
  terrain:    "#C6BBA2", // background contour tone
  labelStrong:"#3A342D",
  voice:      "#6E6558", // Fraunces voice line
  voiceRule:  "#BCB097",
  label:      "#7C7466", // Instrument Sans section labels
  faint:      "#8A8175",
  faintest:   "#A79E8C",
  onMoss:     "#F4EFE4", // text on a moss fill
};

const FONTS =
  "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;1,9..144,400;1,9..144,500&family=Instrument+Sans:wght@400;500&family=DM+Mono:wght@400;500&display=swap";

const SANS = "'Instrument Sans',system-ui,sans-serif";
const MONO = "'DM Mono',monospace";
const SERIF = "'Fraunces',serif";

const TABS = ["overview", "mileage", "pace", "geography", "trails", "records", "featured", "log", "about"];

/* ---- small helpers ---- */
const comma = (n) => Number(n).toLocaleString("en-US");
const shortName = (n) => n.split(",")[0];
const MONTH3 = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function monthYear(iso) {
  // "2016-12-29" -> "Dec 2016"
  const [y, m] = iso.split("-");
  return `${MONTH3[parseInt(m, 10) - 1]} ${y}`;
}
function fullDate(iso) {
  // "2026-07-28" -> "Jul 28, 2026"
  const [y, m, d] = iso.split("-");
  return `${MONTH3[parseInt(m, 10) - 1]} ${parseInt(d, 10)}, ${y}`;
}
// Microblog entries, newest first. Shared by the Log tab and the Overview teaser.
const sortedLog = () => [...(CONTENT.microblog ?? [])].sort((a, b) => (a.date < b.date ? 1 : -1));

/* ---- responsive helpers ---- */
// True on phone-width viewports. SSR-safe; updates on resize/orientation.
function useIsNarrow(bp = 640) {
  const q = `(max-width:${bp}px)`;
  const [narrow, setNarrow] = useState(
    typeof window !== "undefined" && window.matchMedia ? window.matchMedia(q).matches : false
  );
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia(q);
    const on = (e) => setNarrow(e.matches);
    setNarrow(mq.matches);
    mq.addEventListener ? mq.addEventListener("change", on) : mq.addListener(on);
    return () => (mq.removeEventListener ? mq.removeEventListener("change", on) : mq.removeListener(on));
  }, [q]);
  return narrow;
}

// Keeps a wide data-graphic legible on phones: below `minWidth` it scrolls
// horizontally instead of shrinking its labels into illegibility. On desktop
// the inner block simply fills the card, so there's no effect. The cut chart
// edge is its own affordance that more is available by swiping.
function ChartScroll({ minWidth = 540, children }) {
  return (
    <div style={{ overflowX: "auto", overflowY: "hidden", WebkitOverflowScrolling: "touch" }}>
      <div style={{ minWidth }}>{children}</div>
    </div>
  );
}

/* ---- weathering (paper grain + inked-edge wear) ----
   Tuned in the standalone preview and locked here. Grain is global (applied by
   Card to every surface). Ink wear is applied ONLY to hand-drawn line marks —
   the voice underline, the Hero rule, and the dotted leaders — never to the
   moss anchor, data ink, or chart baselines. One config object so it stays
   trivially re-tunable. */
const WEATHER = { grainOpacity: 0.043, grainFreq: 0.9, inkScale: 0.68 };
const INK_WEAR = { filter: "url(#inkwear)" };

// Rendered once, globally, so url(#…) references resolve app-wide.
function WeatherDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <defs>
        <filter id="grainNoise" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency={WEATHER.grainFreq} numOctaves="2" stitchTiles="stitch" result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0.34 0.33 0.33 0 0" />
        </filter>
        <filter id="inkwear" x="-6%" y="-40%" width="112%" height="180%">
          <feTurbulence type="fractalNoise" baseFrequency="0.022 0.03" numOctaves="2" seed="7" result="w" />
          <feDisplacementMap in="SourceGraphic" in2="w" scale={WEATHER.inkScale} xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  );
}

// Subtle paper texture: a multiply overlay clipped to the card's rounded corners.
function Grain() {
  return (
    <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none", mixBlendMode: "multiply", opacity: WEATHER.grainOpacity, borderRadius: 12, overflow: "hidden" }}>
      <svg width="100%" height="100%" preserveAspectRatio="none" style={{ display: "block" }}>
        <rect width="100%" height="100%" filter="url(#grainNoise)" />
      </svg>
    </div>
  );
}

/* ---- shared primitives ---- */
function Card({ children, style }) {
  const narrow = useIsNarrow();
  return (
    <div style={{ position: "relative", background: C.paper, borderRadius: 12, padding: narrow ? "1.3rem 1.15rem" : "2rem 2.25rem", ...style }}>
      {children}
      <Grain />
    </div>
  );
}

function VoiceLine({ children }) {
  return (
    <div
      style={{
        fontFamily: SERIF, fontStyle: "italic", fontSize: 19, color: C.voice,
        borderBottom: `1px dotted ${C.voiceRule}`, paddingBottom: 3,
        display: "inline-block", marginBottom: 22, ...INK_WEAR,
      }}
    >
      {children}
    </div>
  );
}

function Caption({ children }) {
  return (
    <div style={{ fontFamily: SANS, fontSize: 11, letterSpacing: ".03em", color: C.faintest, marginTop: 8 }}>
      {children}
    </div>
  );
}

/* The bespoke logo — reproduced from portfolio-logo.svg (ink soles sharing one
   split climb; moss anchor at the right toe). Terrain is the approved
   placeholder pending the real Lake James contour trace (a Phase 4 build step). */
function Logo({ width = 220 }) {
  return (
    <svg
      viewBox="284 97 479 348" width={width} role="img"
      aria-label="run.remikalir.com logo: two shoe soles sharing one topographic climb, moss anchor at the right toe"
      style={{ display: "block", maxWidth: "100%", height: "auto" }}
    >
      {/* terrain: one climb split lengthwise across the pair */}
      <g fill="none" stroke={C.ink} strokeWidth="1.2" strokeLinejoin="round" strokeLinecap="round">
        <path d="m504.68646 203.5344c-10.944794 2.378418 -57.69217 0.59332275 -65.66882 14.270493c-7.9766846 13.677185 14.840668 56.49379 17.808807 67.79253" />
        <path d="m502.8955 173.80577c-12.63855 5.7243958 -61.433014 7.676071 -75.83127 34.346375c-14.398254 26.670303 -8.7986145 104.72957 -10.558319 125.67546" />
        <path d="m577.0598 247.91605c1.3560181 5.6815643 20.002563 23.672577 8.136108 34.089355c-11.866516 10.416779 -66.11255 23.676117 -79.33508 28.411316" />
        <path d="m487.10785 155.19733c-13.115051 6.932205 -59.580048 20.23491 -78.69028 41.593185c-19.11026 21.358261 -29.03894 49.835083 -35.97113 86.55641c-6.9322205 36.721344 -4.6850586 111.47638 -5.6220703 133.77167" />
        <path d="m512.6667 338.14584c17.111084 -9.222229 84.4444 -39.333344 102.666626 -55.333344c18.222229 -16.0 8.777771 -27.555557 6.666687 -40.66667c-2.111084 -13.111099 -16.111084 -31.666656 -19.333313 -38.0" />
        <path d="m546.9711 360.10706c10.952454 -10.7152405 46.34613 -47.942535 65.71466 -64.291595c19.36853 -16.34906 42.080444 -18.22699 50.49652 -33.802795c8.416077 -15.57579 0.57647705 -39.768005 0 -59.651993c-0.576416 -19.884003 -2.8822021 -49.710007 -3.4586792 -59.652008" />
      </g>
      {/* sole outlines (heavier than the terrain) */}
      <g fill="none" stroke={C.ink} strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round">
        <path d="m349.2749 298.0672c18.187408 -36.374817 19.411987 -82.17879 45.892395 -113.04462c22.33606 -26.035172 78.15683 -48.264206 100.48294 -22.220474c23.678925 27.621857 1.5310669 78.13129 -20.288727 107.244095c-13.429535 17.918213 -39.345245 24.488068 -51.207336 43.480316c-11.215027 17.956207 -8.562592 41.69513 -16.425201 61.351715c-8.383728 20.95932 -27.779633 43.16327 -50.241486 45.409454c-25.799133 2.579895 -50.993164 -37.378906 -45.89502 -62.800537c4.77948 -23.832642 33.88626 -38.00116 38.648315 -61.83728" />
        <path d="m571.8745 253.64442c23.833496 -23.793564 30.9458 -60.595108 53.125977 -85.93701c21.468384 -24.528656 76.367676 -48.400352 95.31232 -21.874023c21.59259 30.233948 0.8989868 81.24034 -23.958008 108.85303c-19.626038 21.801804 -50.617004 29.814072 -74.480286 46.87401c-11.017212 7.8762207 -15.142517 22.532593 -23.958008 32.81366c-13.25293 15.456146 -35.764954 28.99292 -55.729675 25.0c-21.87091 -4.374176 -42.474945 -35.614594 -35.414703 -56.771667c9.35379 -28.03003 44.924408 -39.388702 71.35434 -52.60367" />
      </g>
      {/* moss anchor, right toe */}
      <circle cx="692.8" cy="168.4" r="19.196838" fill={C.moss} />
    </svg>
  );
}

/* ============================ OVERVIEW HERO ================================ */
function Hero({ onOpenLog }) {
  const s = DATA.summary;
  const reach = `${monthYear(DATA.span.start).toLowerCase()} – ${monthYear(DATA.span.end).toLowerCase()} · ${s.countries} countries · ${s.usStates} states · ${s.cities} cities`;
  const rows = [
    ["miles", comma(s.totalMiles)],
    ["runs", comma(s.totalRuns)],
    ["hours", comma(s.totalHours)],
  ];
  const latest = sortedLog()[0];
  const teaser = latest
    ? (() => { const w = latest.body.split(/\s+/); return w.slice(0, 20).join(" ") + (w.length > 20 ? "…" : ""); })()
    : null;
  return (
    <Card>
      <div style={{ marginBottom: 26 }}>
        <VoiceLine>{CONTENT.voiceLines?.overview ?? "…in your words"}</VoiceLine>
      </div>

      {/* latest note from the Log — micro update threading to the macro picture */}
      {latest && (
        <div style={{ borderLeft: `2px solid ${C.moss}`, padding: "2px 0 2px 18px", margin: "0 0 26px", maxWidth: 560 }}>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".05em", textTransform: "uppercase", color: C.mossDeep, marginBottom: 6 }}>
            from the log&nbsp;·&nbsp;<span style={{ color: C.faint, textTransform: "none", letterSpacing: 0 }}>{fullDate(latest.date)}</span>
          </div>
          <div style={{ fontFamily: SANS, fontSize: 14, lineHeight: 1.6, color: "rgba(43,39,35,0.82)" }}>
            {teaser}{" "}
            <button onClick={onOpenLog}
              style={{ fontFamily: SANS, fontSize: 14, color: C.mossDeep, background: "none", border: "none", borderBottom: `1px solid ${C.moss}`, padding: 0, cursor: "pointer", whiteSpace: "nowrap" }}>
              read the log →
            </button>
          </div>
        </div>
      )}

      {/* ledger (left) + logo in the right negative space */}
      <div style={{ display: "flex", gap: 28, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 380px", minWidth: 280, maxWidth: 460 }}>
          <div style={{ borderLeft: `2px solid ${C.moss}`, paddingLeft: 20 }}>
            {rows.map(([label, value], i) => (
              <div
                key={label}
                style={{
                  display: "flex", alignItems: "baseline", gap: 10,
                  marginBottom: i < rows.length - 1 ? 15 : 0,
                }}
              >
                <span style={{ fontFamily: SANS, fontSize: 14, letterSpacing: ".04em", color: C.label }}>{label}</span>
                <span style={{ flex: 1, borderBottom: `1px dotted ${C.leader}`, transform: "translateY(-5px)", ...INK_WEAR }} />
                <span
                  style={{
                    fontFamily: MONO, fontVariantNumeric: "tabular-nums lining-nums",
                    lineHeight: 1, fontSize: 30, color: C.inkFig,
                  }}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex: "0 1 240px", minWidth: 180, display: "flex", justifyContent: "center" }}>
          <Logo width={230} />
        </div>
      </div>

      {/* hand-inked rule (full width) */}
      <svg width="100%" height="6" viewBox="0 0 600 6" preserveAspectRatio="none" style={{ margin: "22px 0 14px", ...INK_WEAR }} aria-hidden="true">
        <path d="M2 3 Q100 2 200 3.2" stroke={C.rule} strokeWidth="1" fill="none" strokeLinecap="round" strokeOpacity="0.95" />
        <path d="M200 3.2 Q320 4.1 430 2.8" stroke={C.rule} strokeWidth="1" fill="none" strokeLinecap="round" strokeOpacity="0.55" />
        <path d="M430 2.8 Q520 1.9 598 3" stroke={C.rule} strokeWidth="1" fill="none" strokeLinecap="round" strokeOpacity="1" />
      </svg>

      {/* moss anchor + reach line */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ width: 9, height: 9, background: C.moss }} aria-hidden="true" />
        <span style={{ fontFamily: MONO, fontSize: 12, letterSpacing: ".04em", color: C.faint }}>{reach}</span>
      </div>
    </Card>
  );
}

/* ========================= GEOGRAPHY: ATLAS ============================== */
/* Anchor-and-spread map (replaces the retired geoAlbersUsa choropleth, which
   structurally couldn't hold four countries). Home bases filled + sized by
   runs, curated visits as open rings, a faint migration thread, and an abroad
   inset for Ireland/China. Positions are a real cos-lat projection of the
   mean-of-runs coordinates in DATA.geo / DATA.homes. */
function Atlas() {
  const homes = (DATA.homes ?? []).filter((h) => h.lat != null);
  const geoByName = Object.fromEntries((DATA.geo ?? []).map((g) => [g.name, g]));
  const visits = (CONTENT.atlas?.visits ?? [])
    .map((n) => geoByName[n])
    .filter((g) => g && (g.country === "United States" || g.country === "Canada"));
  const abroad = CONTENT.atlas?.abroad ?? [];
  const countryRuns = Object.fromEntries((DATA.countries ?? []).map((c) => [c.name, c.runs]));

  if (homes.length === 0) {
    return (
      <Card>
        <div style={{ marginBottom: 16 }}><VoiceLine>{CONTENT.voiceLines?.geography ?? "…in your words"}</VoiceLine></div>
        <Caption>run <code>python3 tools/build_data.py</code> to emit `geo` coordinates, then the atlas draws from real positions</Caption>
      </Card>
    );
  }

  // build the North-America anchor set and project it (cos-lat, uniform scale)
  const anchors = [
    ...homes.map((h) => ({ name: shortName(h.name), runs: h.runs, home: true, lat: h.lat, lng: h.lng })),
    ...visits.map((v) => ({ name: v.name, runs: v.runs, home: false, lat: v.lat, lng: v.lng })),
  ];
  const meanLat = anchors.reduce((s, a) => s + a.lat, 0) / anchors.length;
  const k = Math.cos((meanLat * Math.PI) / 180);
  const P = anchors.map((a) => ({ ...a, px: a.lng * k, py: a.lat }));
  const pxmin = Math.min(...P.map((p) => p.px)), pxmax = Math.max(...P.map((p) => p.px));
  const pymin = Math.min(...P.map((p) => p.py)), pymax = Math.max(...P.map((p) => p.py));
  const [X0, X1, Y0, Y1] = [80, 560, 66, 246];
  const scale = Math.min((X1 - X0) / (pxmax - pxmin || 1), (Y1 - Y0) / (pymax - pymin || 1));
  const offx = X0 + ((X1 - X0) - (pxmax - pxmin) * scale) / 2;
  const offy = Y0 + ((Y1 - Y0) - (pymax - pymin) * scale) / 2;
  const cxMid = (X0 + X1) / 2;
  const rOf = (runs) => Math.min(Math.max(Math.sqrt(runs) * 0.78, 2.4), 34);

  let proj = P.map((p) => {
    const x = offx + (p.px - pxmin) * scale;
    const y = offy + (pymax - p.py) * scale;
    const side = x > cxMid ? "end" : "start"; // label on the open side
    return { ...p, x, y, r: rOf(p.runs), side, labelY: y + 3 };
  });
  // greedy vertical de-collision of labels sharing a side
  ["start", "end"].forEach((side) => {
    const g = proj.filter((p) => p.side === side).sort((a, b) => a.labelY - b.labelY);
    for (let i = 1; i < g.length; i++) if (g[i].labelY - g[i - 1].labelY < 14) g[i].labelY = g[i - 1].labelY + 14;
  });

  const thread = proj.filter((p) => p.home).map((p) => `${p.x.toFixed(0)},${p.y.toFixed(0)}`).join(" ");
  const shownCities = new Set([...homes.map((h) => shortName(h.name)), ...visits.map((v) => v.name)]);
  const abroadCityCount = abroad.reduce((s, a) => s + a.cities.split("·").length, 0);
  const moreCount = Math.max((DATA.summary?.cities ?? 0) - shownCities.size - abroadCityCount, 0);

  return (
    <Card>
      <div style={{ marginBottom: 16 }}><VoiceLine>{CONTENT.voiceLines?.geography ?? "…in your words"}</VoiceLine></div>

      <ChartScroll minWidth={540}>
      <svg viewBox="0 0 660 400" width="100%" role="img"
        aria-label="Atlas of running places, home bases sized by run count with curated visits and an abroad inset" style={{ display: "block" }}>

        {/* legend */}
        <g transform="translate(80,40)">
          <circle cx="6" cy="-4" r="6" fill={C.moss} />
          <text x="18" y="0" fontFamily={MONO} fontSize="11" fill={C.faint}>home base</text>
          <circle cx="118" cy="-4" r="4" fill="none" stroke={C.moss} strokeWidth="1.4" />
          <text x="130" y="0" fontFamily={MONO} fontSize="11" fill={C.faint}>visited · area = runs</text>
        </g>

        {/* migration thread between home bases */}
        {proj.filter((p) => p.home).length > 1 && (
          <polyline points={thread} fill="none" stroke={C.moss} strokeWidth="1" strokeDasharray="1.5 4" strokeOpacity="0.45" />
        )}

        {/* anchors */}
        {proj.map((p, i) => {
          const lx = p.side === "end" ? p.x - p.r - 5 : p.x + p.r + 5;
          return (
            <g key={i}>
              {p.home
                ? <circle cx={p.x} cy={p.y} r={p.r} fill={C.moss} />
                : <circle cx={p.x} cy={p.y} r={p.r} fill="none" stroke={C.moss} strokeWidth="1.4" />}
              {/* leader when the label was nudged off its anchor */}
              {Math.abs(p.labelY - (p.y + 3)) > 5 && (
                <line x1={p.side === "end" ? p.x - p.r : p.x + p.r} y1={p.y} x2={lx} y2={p.labelY - 3} stroke={C.moss} strokeWidth="0.6" strokeOpacity="0.5" />
              )}
              <text x={lx} y={p.labelY} textAnchor={p.side} fontFamily={MONO} fontSize="11" fill={C.mossDeep}>
                {p.name}{p.home ? ` · ${comma(p.runs)}` : ""}
              </text>
            </g>
          );
        })}

        {/* abroad inset */}
        <line x1="30" y1="322" x2="630" y2="322" stroke={C.leader} strokeWidth="1" />
        <text x="30" y="343" fontFamily={SANS} fontSize="11" letterSpacing="0.12em" fill={C.faintest}>abroad</text>
        {abroad.map((a, i) => (
          <g key={i} transform={`translate(${110 + i * 250},360)`}>
            <circle cx="0" cy="-4" r="2.6" fill="none" stroke={C.moss} strokeWidth="1.4" />
            <text x="12" y="0" fontFamily={MONO} fontSize="11" fill={C.faint}>
              {a.cities} — {a.country}{countryRuns[a.country] != null ? ` · ${countryRuns[a.country]} runs` : ""}
            </text>
          </g>
        ))}
      </svg>
      </ChartScroll>

      <Caption>real coordinates from data.js · home bases sized by runs · {moreCount} more places across the record · projection is cos-lat, North America</Caption>
    </Card>
  );
}

/* ========================= GEOGRAPHY: TIMELINE ============================ */
/* Home BANDS from DATA.homes (generated) · TRIPS from CONTENT.timeline (authored) */
const AXIS_START = 2016.95;
const AXIS_END = 2026.55;
const TL = { xL: 46, xR: 668, base: 170, laneOffset: 34, laneStep: 34 }; // svg geometry

const xScale = (frac) =>
  TL.xL + ((frac - AXIS_START) / (AXIS_END - AXIS_START)) * (TL.xR - TL.xL);

function parseYearFrac(part, isEnd) {
  const p = part.trim();
  if (/present/i.test(p)) return AXIS_END;
  const m = p.match(/([A-Za-z]{3})[a-z]*\s+(\d{4})/); // "Aug 2022"
  if (m) {
    const mi = MONTH3.findIndex((x) => x.toLowerCase() === m[1].toLowerCase().slice(0, 3));
    return parseInt(m[2], 10) + (mi >= 0 ? mi / 12 : 0);
  }
  const y = p.match(/(\d{4})/); // year only
  if (y) return parseInt(y[1], 10) + (isEnd ? 1 : 0);
  return AXIS_START;
}
function parseSpan(dates) {
  const [a, b] = dates.split(/[–-]/); // en-dash or hyphen
  return { s: parseYearFrac(a, false), e: parseYearFrac(b ?? a, true) };
}

function Timeline() {
  const homes = DATA.homes.map((h) => ({ ...h, ...parseSpan(h.dates) }));
  // a home is "raised" (an interlude) if its span nests inside another's
  const nested = (h) => homes.some((o) => o !== h && h.s >= o.s && h.e <= o.e);
  const baseline = homes.filter((h) => !nested(h)).sort((a, b) => a.s - b.s);
  const raised = homes.filter((h) => nested(h));

  // baseline bands abut: each runs to the next baseline's start (or axis end)
  const bands = baseline.map((h, i) => {
    const x0 = xScale(Math.max(h.s, AXIS_START));
    const x1 = xScale(i < baseline.length - 1 ? baseline[i + 1].s : AXIS_END);
    return { ...h, x0, x1 };
  });

  const trips = (CONTENT.timeline?.trips ?? []).map((t) => {
    const x = xScale(t.frac);
    const topY = TL.base - (TL.laneOffset + (t.lane ?? 0) * TL.laneStep);
    const anchor = x < TL.xL + 48 ? "start" : x > TL.xR - 40 ? "end" : "middle";
    return { ...t, x, topY, anchor };
  });

  // all home bases, centered under their band (baseline) or arc (raised),
  // for the single consistent label row below the bands
  const homeLabels = [
    ...bands.map((b) => ({ name: b.name, runs: b.runs, cx: (b.x0 + b.x1) / 2 })),
    ...raised.map((h) => ({ name: h.name, runs: h.runs, cx: (xScale(h.s) + xScale(h.e)) / 2 })),
  ];

  return (
    <Card>
      <div style={{ marginBottom: 14 }}>
        <VoiceLine>{CONTENT.voiceLines?.timeline ?? "…in your words"}</VoiceLine>
      </div>

      <ChartScroll minWidth={560}>
      <svg viewBox="0 0 700 240" width="100%" role="img"
        aria-label="Decade timeline of home bases and trips away" style={{ display: "block" }}>

        {/* trips: moss lollipops rising to staggered labels */}
        {trips.map((t, i) => (
          <g key={i}>
            <line x1={t.x} y1={TL.base} x2={t.x} y2={t.topY} stroke={C.moss} strokeWidth="1" strokeDasharray="1.5 3" />
            <circle cx={t.x} cy={t.topY} r="2.4" fill={C.moss} />
            <text x={t.x} y={t.topY - 6} textAnchor={t.anchor} fontFamily={MONO} fontSize="11" fill={C.mossDeep}>
              {t.label} · {t.date}
            </text>
          </g>
        ))}

        {/* raised home interludes (e.g. Cambridge) — arc only; label sits below */}
        {raised.map((h, i) => {
          const x0 = xScale(h.s), x1 = xScale(h.e), w = Math.max(x1 - x0, 8);
          return (
            <g key={`r${i}`}>
              <line x1={x0} y1={TL.base - 4} x2={x0} y2={TL.base + 2} stroke="#8FA07E" strokeWidth="1" />
              <line x1={x1} y1={TL.base - 4} x2={x1} y2={TL.base + 2} stroke="#8FA07E" strokeWidth="1" />
              <rect x={x0} y={TL.base - 20} width={w} height="15" rx="2" fill={C.moss} />
            </g>
          );
        })}

        {/* baseline home bands — clean moss bars; names live in the row below */}
        {bands.map((b, i) => (
          <rect key={`b${i}`} x={b.x0} y={TL.base} width={Math.max(b.x1 - b.x0, 8)} height="16" rx="2" fill={C.moss} />
        ))}

        {/* home-base label row — one consistent line below the bands, the
            textual base of the record, mirrored by the trips above */}
        {homeLabels.map((h, i) => (
          <text key={`hl${i}`} x={h.cx} y={TL.base + 32} textAnchor="middle" fontFamily={MONO} fontSize="11" fill={C.mossDeep}>
            {shortName(h.name)} · {comma(h.runs)} runs
          </text>
        ))}

        {/* baseline rule */}
        <path d={`M${TL.xL} ${TL.base + 46} Q220 ${TL.base + 45} 400 ${TL.base + 46.5}`} stroke={C.rule} strokeWidth="1" fill="none" strokeLinecap="round" strokeOpacity="0.9" />
        <path d={`M400 ${TL.base + 46.5} Q520 ${TL.base + 47.2} ${TL.xR} ${TL.base + 46}`} stroke={C.rule} strokeWidth="1" fill="none" strokeLinecap="round" strokeOpacity="0.6" />

        {/* year ticks */}
        <g fontFamily={MONO} fontSize="11" fill={C.faint} textAnchor="middle">
          {Array.from({ length: 10 }, (_, k) => 2017 + k).map((yr) => (
            <text key={yr} x={xScale(yr)} y={TL.base + 64}>{yr}</text>
          ))}
        </g>
      </svg>
      </ChartScroll>

      <Caption>moss band = home base · tick = a trip away · real dates from your Garmin export · a few short trips omitted</Caption>
    </Card>
  );
}

/* ============================== MILEAGE ================================= */
/* Top: miles per year (bars, from DATA.yearly). Bottom: per-year pace
   small-multiples (one self-scaled panel per year on a constant pace axis,
   moss tick at each year's average), from DATA.paceByYear — populated once
   build_data.py has been re-run. Volume is metronomic; the shape is not. */
function Mileage() {
  const yearly = DATA.yearly;
  const byYear = DATA.paceByYear ?? [];
  const years = yearly.map((y) => y.year);
  const firstYr = Math.min(...years), lastYr = Math.max(...years);
  // Drop the partial 2016 start year from the TOP bars so it matches the 10
  // pace panels below (which already drop firstYr). 2016 holds only the last
  // days after the Christmas gift — a near-empty bar that isn't illustrative.
  const shownYearly = yearly.filter((y) => y.year !== firstYr);
  const axisFirst = Math.min(...shownYearly.map((y) => y.year));
  const maxMiles = Math.max(...shownYearly.map((y) => y.miles), 1);
  const barScale = 100 / maxMiles;
  const yr2x = (y) => 45 + (y - axisFirst) * 57;
  const peak = shownYearly.reduce((a, b) => (b.miles > a.miles ? b : a), shownYearly[0]);

  const info = Object.fromEntries(yearly.map((y) => [y.year, y]));
  const sm = byYear.filter((y) => y.year !== firstYr); // drop the partial start year
  const nBins = DATA.paces.length || 21;
  const avgLocalX = (min, w) => Math.min(Math.max((min - 5.0) / 0.25, 0), nBins - 1) / (nBins - 1) * w;

  return (
    <Card>
      <div style={{ marginBottom: 8 }}>
        <VoiceLine>{CONTENT.voiceLines?.mileage ?? "…in your words"}</VoiceLine>
      </div>

      <ChartScroll minWidth={560}>
      <svg viewBox="0 0 680 520" width="100%" role="img"
        aria-label="Miles per year, and the shape of each year's pace distribution" style={{ display: "block" }}>

        {/* TOP — miles per year */}
        <text x="45" y="30" fontFamily={SANS} fontSize="12" letterSpacing="0.04em" fill={C.label}>miles per year</text>
        {shownYearly.map((y) => {
          const h = y.miles * barScale;
          const partial = y.year === lastYr;
          return <rect key={y.year} x={yr2x(y.year)} y={150 - h} width="28" height={h} fill={C.ink} opacity={partial ? 0.4 : 1} />;
        })}
        <text x={yr2x(peak.year) + 14} y={150 - peak.miles * barScale - 6} textAnchor="middle" fontFamily={MONO} fontSize="10" fill={C.mossDeep}>{comma(peak.miles)}</text>
        <path d="M40 150 Q340 149 650 150" stroke={C.rule} strokeWidth="1" fill="none" strokeLinecap="round" />
        <g fontFamily={MONO} fontSize="10" fill={C.faintest} textAnchor="middle">
          {shownYearly.map((y) => <text key={y.year} x={yr2x(y.year) + 14} y="164">’{String(y.year).slice(2)}</text>)}
        </g>
        <text x={yr2x(lastYr) + 14} y="176" textAnchor="middle" fontFamily={MONO} fontSize="9" fill={C.faintest}>partial</text>

        {/* BOTTOM — per-year pace small multiples */}
        <text x="25" y="208" fontFamily={SANS} fontSize="12" letterSpacing="0.04em" fill={C.label}>the shape of each year’s pace — fast ← → slow · moss ▪ = that year’s average</text>
        {sm.map((yd, i) => {
          const col = i % 5, row = Math.floor(i / 5);
          const ox = 25 + col * 128, oy = 225 + row * 155;
          const yInfo = info[yd.year] || { miles: 0, pace: "-", paceN: 6 };
          const pmax = Math.max(...yd.c, 1);
          const pts = yd.c.map((c, bi) => `${((bi / (nBins - 1)) * 104).toFixed(1)} ${(58 - (c / pmax) * 58).toFixed(1)}`).join(" L");
          const d = `M0 58 L${pts} L104 58 Z`;
          const ax = avgLocalX(yInfo.paceN, 104);
          return (
            <g key={yd.year} transform={`translate(${ox},${oy})`}>
              <path d={d} fill="#3A342D" />
              <line x1="0" y1="58" x2="104" y2="58" stroke={C.rule} strokeWidth="1" />
              <line x1={ax} y1="59" x2={ax} y2="66" stroke={C.moss} strokeWidth="1.5" />
              <circle cx={ax} cy="66" r="2" fill={C.moss} />
              <text x="52" y="82" textAnchor="middle" fontFamily={MONO} fontSize="13" fill={C.ink}>{yd.year}</text>
              <text x="52" y="95" textAnchor="middle" fontFamily={MONO} fontSize="10" fill={C.faint}>
                {comma(yInfo.miles)} mi · {yInfo.pace}{yd.year === lastYr ? " · partial" : ""}
              </text>
            </g>
          );
        })}
      </svg>
      </ChartScroll>

      {sm.length > 0
        ? <Caption>each panel self-scaled to its own peak (shape, not volume) · constant pace axis · real distributions from data.js</Caption>
        : <Caption>miles per year is live · run <code>python3 tools/build_data.py</code> to populate the per-year pace panels</Caption>}
    </Card>
  );
}

/* =============================== PACE ==================================== */
/* Distribution as tally-block strokes above a baseline (each block ≈ 50 runs),
   the four featured races anchored below by their pace. Real bins from
   data.js `paces` — works at any bin resolution (30s now, 15s after the
   build_data.py re-bin); bars auto-fit to a fixed height. Race positions from
   CONTENT.featured. */
const PACE = { xL: 40, xR: 620, base: 210, minLo: 5.0, minHi: 10.5, maxBarH: 160, blockRuns: 50 };
const paceX = (min) => PACE.xL + ((min - PACE.minLo) / (PACE.minHi - PACE.minLo)) * (PACE.xR - PACE.xL);
const paceToMin = (p) => { const [m, s] = p.replace("/mi", "").trim().split(":").map(Number); return m + s / 60; };
const binToMin = (label) => { const [m, s] = label.replace("+", "").split(":").map(Number); return m + s / 60; };

function Pace() {
  const maxC = Math.max(...DATA.paces.map((p) => p.c), 1);
  const scale = PACE.maxBarH / maxC;
  const bins = DATA.paces.map((p) => ({ ...p, x: paceX(binToMin(p.p)) }));

  // featured races: fast -> slow, staggered deeper when close together in x
  const sorted = [...CONTENT.featured]
    .map((r) => {
      const min = paceToMin(r.pace);
      const name = r.title.replace(/^\d{4}\s*/, "");
      return { label: `${new Date(r.date).getFullYear()} ${name}`, x: paceX(min), min };
    })
    .sort((a, b) => a.min - b.min);
  let prevX = -999, depth = 0;
  const races = sorted.map((r) => {
    depth = r.x - prevX < 70 ? depth + 18 : 30;
    prevX = r.x;
    return { ...r, depth };
  });

  return (
    <Card>
      <div style={{ marginBottom: 18 }}>
        <VoiceLine>{CONTENT.voiceLines?.pace ?? "…in your words"}</VoiceLine>
      </div>

      <ChartScroll minWidth={520}>
      <svg viewBox="0 0 640 308" width="100%" role="img"
        aria-label="Pace distribution with featured races anchored below the baseline" style={{ display: "block" }}>

        {/* tally-block strokes — ink is data */}
        {bins.map((b, i) => {
          const h = b.c * scale;
          const blocks = Math.floor(b.c / PACE.blockRuns);
          return (
            <g key={i}>
              <rect x={b.x - 2.5} y={PACE.base - h} width="5" height={h} fill={C.ink} />
              {Array.from({ length: blocks }, (_, k) => {
                const yy = PACE.base - (k + 1) * PACE.blockRuns * scale;
                return yy > PACE.base - h + 1 ? (
                  <rect key={k} x={b.x - 2.5} y={yy - 0.7} width="5" height="1.4" fill={C.paper} />
                ) : null;
              })}
            </g>
          );
        })}

        {/* baseline — structure, never data */}
        <path d={`M20 ${PACE.base} Q320 ${PACE.base - 1} 620 ${PACE.base}`} stroke={C.rule} strokeWidth="1" fill="none" strokeLinecap="round" />

        {/* pace axis */}
        <g fontFamily={MONO} fontSize="11" fill={C.faint} textAnchor="middle">
          {["6:00", "7:00", "8:00", "9:00", "10:00"].map((t) => (
            <text key={t} x={paceX(binToMin(t))} y={PACE.base + 16}>{t}</text>
          ))}
        </g>

        {/* featured races anchored below, by pace — moss */}
        {races.map((r, i) => (
          <g key={i}>
            <line x1={r.x} y1={PACE.base + 2} x2={r.x} y2={PACE.base + r.depth} stroke={C.moss} strokeWidth="1" strokeDasharray="2 3" />
            <circle cx={r.x} cy={PACE.base + r.depth} r="2.4" fill={C.moss} />
            <text x={r.x + 6} y={PACE.base + r.depth + 4} fontFamily={MONO} fontSize="11" fill={C.mossDeep}>{r.label}</text>
          </g>
        ))}

        <text x="320" y="302" textAnchor="middle" fontFamily={MONO} fontSize="11" fill={C.faint}>average pace · min / mile · faster ← → slower</text>
      </svg>
      </ChartScroll>

      <Caption>each block ≈ 50 runs · races anchored below the line by their pace · real bins from data.js</Caption>
    </Card>
  );
}

/* ============================== FEATURED ================================= */
const F_LBL = { fontFamily: SANS, fontSize: 10, letterSpacing: ".05em", textTransform: "uppercase", color: "#8A8175", marginBottom: 8 };

function RaceRoute({ route, elev }) {
  if (!route) return null;
  const S = 200, PAD = 12, D = S - 2 * PAD; // inset so edge dots/paths don't clip
  const fx = (x) => PAD + x * D;
  const fy = (y) => PAD + y * D;
  const pts = route.path.map(([x, y]) => `${fx(x).toFixed(1)},${fy(y).toFixed(1)}`).join(" ");
  const p0 = route.path[0], pN = route.path[route.path.length - 1];
  const p2p = Math.hypot(p0[0] - pN[0], p0[1] - pN[1]) > 0.12;
  const ele = route.ele || [];
  const EW = 360, EH = 84;
  const elePath = ele.length
    ? `M0 ${EH} ` + ele.map((e, i) => `L${((i / (ele.length - 1)) * EW).toFixed(1)} ${(EH - e * EH).toFixed(1)}`).join(" ") + ` L${EW} ${EH} Z`
    : "";
  return (
    <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap", margin: "18px 0" }}>
      <svg viewBox={`0 0 ${S} ${S}`} width="190" style={{ flex: "0 0 190px" }} role="img" aria-label="race route from GPS">
        <polyline points={pts} fill="none" stroke={C.ink} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={fx(p0[0]).toFixed(1)} cy={fy(p0[1]).toFixed(1)} r="4.5" fill={C.moss} />
        {p2p && (
          <>
            <circle cx={fx(pN[0]).toFixed(1)} cy={fy(pN[1]).toFixed(1)} r="4.5" fill="none" stroke={C.moss} strokeWidth="1.6" />
            <text x={(fx(p0[0]) + 8).toFixed(1)} y={(fy(p0[1]) + 3).toFixed(1)} fontFamily={MONO} fontSize="10" fill={C.mossDeep}>start</text>
            <text x={(fx(pN[0]) + 8).toFixed(1)} y={(fy(pN[1]) + 3).toFixed(1)} fontFamily={MONO} fontSize="10" fill={C.mossDeep}>finish</text>
          </>
        )}
      </svg>
      <div style={{ flex: "1 1 300px", minWidth: 260 }}>
        <div style={{ fontFamily: SANS, fontSize: 11, letterSpacing: ".04em", color: C.label, marginBottom: 6 }}>elevation{elev ? ` · ${elev}` : ""}</div>
        <svg viewBox={`0 0 ${EW} ${EH + 4}`} width="100%" role="img" aria-label="elevation profile">
          <path d={elePath} fill="#3A342D" />
          <line x1="0" y1={EH} x2={EW} y2={EH} stroke={C.rule} strokeWidth="1" strokeOpacity="0.7" />
        </svg>
        <div style={{ fontFamily: MONO, fontSize: 10, color: C.faintest, marginTop: 4 }}>real GPS · {route.mi.toFixed(1)} mi tracked · profile self-scaled</div>
      </div>
    </div>
  );
}

function RaceMetrics({ m, elev }) {
  const metrics = [
    ["elevation", elev], ["heart rate", m.hr], ["cadence", m.cadence], ["stride", m.stride],
    ["steps", m.steps], ["calories", m.calories], ["training effect", m.te], ["max pace", m.maxPace],
  ].filter(([, v]) => v && !/^(—|N\/A)/.test(String(v)));
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: "16px 12px", margin: "18px 0" }}>
      {metrics.map(([label, value]) => (
        <div key={label}>
          <div style={{ fontFamily: SANS, fontSize: 10, letterSpacing: ".05em", textTransform: "uppercase", color: C.faint }}>{label}</div>
          <div style={{ fontFamily: MONO, fontSize: 15, color: C.inkFig, marginTop: 3 }}>{value}</div>
        </div>
      ))}
    </div>
  );
}

function GoalsResults({ race }) {
  if (!(race.goals?.length || race.results?.length)) return null;
  const col = (label, items) => (
    <div style={{ flex: "1 1 240px" }}>
      <div style={F_LBL}>{label}</div>
      {items.map((it, i) => (
        <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6, fontFamily: SANS, fontSize: 13, color: C.ink, lineHeight: 1.4 }}>
          <span style={{ color: C.moss }}>—</span><span>{it}</span>
        </div>
      ))}
    </div>
  );
  return (
    <div style={{ display: "flex", gap: 28, flexWrap: "wrap", margin: "6px 0 18px", paddingLeft: 20, borderLeft: `2px solid ${C.moss}` }}>
      {race.goals?.length ? col("goals", race.goals) : null}
      {race.results?.length ? col("results", race.results) : null}
    </div>
  );
}

function HRZones({ zones }) {
  const max = Math.max(...zones.map((z) => z.pct), 1);
  return (
    <div style={{ margin: "8px 0 18px" }}>
      <div style={F_LBL}>heart-rate zones</div>
      {zones.map((z, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5 }}>
          <span style={{ flex: "0 0 96px", fontFamily: MONO, fontSize: 11, color: C.faint }}>{z.z}</span>
          <div style={{ flex: 1, height: 8, background: "rgba(43,42,36,0.10)" }}>
            <div style={{ width: `${(z.pct / max) * 100}%`, height: "100%", background: C.ink }} />
          </div>
          <span style={{ flex: "0 0 96px", textAlign: "right", fontFamily: MONO, fontSize: 11, color: C.faint }}>{z.min}m · {z.pct}%</span>
        </div>
      ))}
    </div>
  );
}

function Segments({ segments }) {
  return (
    <div style={{ margin: "8px 0 18px" }}>
      <div style={F_LBL}>race sections</div>
      {segments.map((s, i) => (
        <div key={i} style={{ display: "flex", gap: 10, fontFamily: MONO, fontSize: 11, color: C.faint, marginBottom: 4, alignItems: "baseline" }}>
          <span style={{ flex: "0 0 22px", color: C.mossDeep }}>{s.n}</span>
          <span style={{ flex: "0 0 58px" }}>{s.mi} mi</span>
          <span style={{ flex: "0 0 54px", color: C.inkFig }}>{s.pace}</span>
          <span style={{ flex: 1 }}>{s.note}</span>
        </div>
      ))}
    </div>
  );
}

function PRProgression({ rows }) {
  return (
    <div style={{ margin: "8px 0 18px" }}>
      <div style={F_LBL}>the half-marathon barrier, over the years</div>
      <div style={{ borderLeft: `2px solid ${C.moss}`, paddingLeft: 16 }}>
        {rows.map((r, i) => (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "baseline", marginBottom: 5, fontFamily: MONO, fontSize: 11 }}>
            <span style={{ flex: "0 0 8px" }}>{r.pr ? <span style={{ display: "inline-block", width: 6, height: 6, background: C.moss }} /> : null}</span>
            <span style={{ flex: "0 0 70px", fontSize: 13, color: C.inkFig }}>{r.time}</span>
            <span style={{ flex: "0 0 52px", color: C.faint }}>{r.pace}</span>
            <span style={{ flex: 1, color: C.faint }}>{r.loc} · {r.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrainingBuild({ weeks }) {
  const max = Math.max(...weeks.map((w) => w.mi), 1);
  return (
    <div style={{ margin: "8px 0 4px" }}>
      <div style={F_LBL}>six-week training build</div>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
        {weeks.map((w, i) => (
          <div key={i} style={{ flex: 1, textAlign: "center" }}>
            <div style={{ height: `${(w.mi / max) * 64 + 2}px`, background: C.ink, opacity: i === weeks.length - 1 ? 0.4 : 1 }} />
            <div style={{ fontFamily: MONO, fontSize: 12, color: C.inkFig, marginTop: 4 }}>{w.mi}</div>
            <div style={{ fontFamily: MONO, fontSize: 9, color: C.faintest }}>{w.r} runs</div>
            <div style={{ fontFamily: MONO, fontSize: 9, color: C.faintest }}>wk {w.w}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Featured() {
  const races = CONTENT.featured ?? [];
  const [open, setOpen] = useState(() => new Set(races[0] ? [races[0].id] : []));
  const toggle = (id) => setOpen((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  return (
    <div>
      <Card style={{ marginBottom: 20 }}><VoiceLine>{CONTENT.voiceLines?.featured ?? "…in your words"}</VoiceLine></Card>
      {races.map((r) => {
        const isOpen = open.has(r.id);
        const m = DATA.featuredMetrics?.[r.id] ?? {};
        const elev = m.elevGain != null
          ? (Math.abs(m.elevGain - m.elevLoss) > 150 ? `+${comma(m.elevGain)} / −${comma(m.elevLoss)} ft` : `+${comma(m.elevGain)} ft`)
          : null;
        return (
          <Card key={r.id} style={{ marginBottom: 20 }}>
            <div onClick={() => toggle(r.id)} role="button" tabIndex={0}
              style={{ cursor: "pointer", borderLeft: `2px solid ${C.moss}`, paddingLeft: 20, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".06em", textTransform: "uppercase", color: C.mossDeep, marginBottom: 4 }}>{r.subtitle}</div>
                <div style={{ fontFamily: SERIF, fontSize: 24, color: C.ink, lineHeight: 1.1 }}>{r.title}</div>
                <div style={{ fontFamily: MONO, fontSize: 11, color: C.faint, marginTop: 4 }}>{r.date} · {r.location}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: MONO, fontVariantNumeric: "tabular-nums", fontSize: 28, color: C.inkFig, lineHeight: 1 }}>{r.time}</div>
                <div style={{ fontFamily: MONO, fontSize: 11, color: C.faint, marginTop: 4 }}>{r.distance} · {r.pace}</div>
                <div style={{ fontFamily: MONO, fontSize: 10, color: C.faintest, marginTop: 6 }}>{isOpen ? "− collapse" : "+ expand"}</div>
              </div>
            </div>

            {isOpen && (
              <div style={{ marginTop: 20 }}>
                {r.photo && (
                  <figure style={{ margin: "0 0 18px" }}>
                    <img src={r.photo} alt={r.photoCaption || r.title} style={{ width: "100%", borderRadius: 10, display: "block" }} loading="lazy" />
                    {r.photoCaption && <figcaption style={{ fontFamily: SANS, fontSize: 12, fontStyle: "italic", color: C.faint, textAlign: "center", marginTop: 8 }}>{r.photoCaption}</figcaption>}
                  </figure>
                )}
                <RaceRoute route={ROUTES[r.gpx]} elev={elev} />
                <GoalsResults race={r} />
                {r.narrative && <p style={{ fontFamily: SANS, fontSize: 14, lineHeight: 1.7, color: "rgba(43,39,35,0.85)", margin: "0 0 18px" }}>{r.narrative}</p>}
                <RaceMetrics m={m} elev={elev} />
                {m.hrZones?.length > 0 && <HRZones zones={m.hrZones} />}
                {r.segments?.length > 0 && <Segments segments={r.segments} />}
                {r.id === "mistletoe" && DATA.halfProgression?.length > 0 && <PRProgression rows={DATA.halfProgression} />}
                {DATA.training?.[r.id]?.length > 0
                  ? <TrainingBuild weeks={DATA.training[r.id]} />
                  : <Caption>run <code>python3 tools/build_data.py</code> to populate the corrected training build</Caption>}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

/* ============================ TRAILS ATLAS =============================== */
/* The 18 curated "favorite grounds" as a 3-column grid of GPS thumbnails.
   Path shapes come from routes.js (real GPS, frame-fit); labels, notes, and
   terrain from CONTENT.trails; distance from routes.js. Moss dot marks each
   start. */
function TrailsAtlas() {
  const trails = CONTENT.trails ?? [];
  const have = trails.filter((t) => ROUTES[t.id]);
  const narrow = useIsNarrow();
  return (
    <Card>
      <div style={{ marginBottom: 8 }}><VoiceLine>{CONTENT.voiceLines?.trails ?? "…in your words"}</VoiceLine></div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${narrow ? 2 : 3},1fr)`, gap: "22px 10px", marginTop: 8 }}>
        {trails.map((t) => {
          const r = ROUTES[t.id];
          return (
            <div key={t.id} style={{ padding: "2px 4px" }}>
              <svg viewBox="0 0 88 88" style={{ width: "100%", maxWidth: 118, display: "block", margin: "0 auto" }}
                role="img" aria-label={`${t.place} route`}>
                {r && (() => {
                  // Inset the drawing area so a start/end dot sitting on the frame
                  // edge isn't clipped by the viewBox (moss r=3.4 needs the margin).
                  const PAD = 6, S = 88 - 2 * PAD;
                  const fx = (x) => (PAD + x * S).toFixed(1);
                  const fy = (y) => (PAD + y * S).toFixed(1);
                  return (
                    <>
                      <polyline
                        points={r.path.map(([x, y]) => `${fx(x)},${fy(y)}`).join(" ")}
                        fill="none" stroke={C.ink} strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round" />
                      <circle cx={fx(r.path[0][0])} cy={fy(r.path[0][1])} r="3.4" fill={C.moss} />
                    </>
                  );
                })()}
              </svg>
              <div style={{ textAlign: "center", marginTop: 5 }}>
                <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 500, color: C.ink }}>{t.place}</div>
                <div style={{ fontFamily: MONO, fontSize: 10, color: C.faint, marginTop: 2 }}>{t.note}</div>
                <div style={{ fontFamily: MONO, fontSize: 10, color: C.mossDeep, marginTop: 3 }}>
                  {r ? `${r.mi.toFixed(1)} mi · ` : ""}{t.terrain} · {t.year}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <Caption>real GPS · each shape fit to frame · moss ▪ marks the start · {have.length} grounds across four countries</Caption>
    </Card>
  );
}

/* ============================== RECORDS ================================= */
/* Distance ladder (mile → 50K) from CONTENT.records. Moss square marks an
   official race; training bests carry no anchor. Ledger spine + dotted
   leaders + tabular figures — the honest record. */
function Records() {
  const rows = CONTENT.records ?? [];
  return (
    <Card>
      <div style={{ marginBottom: 22 }}>
        <VoiceLine>{CONTENT.voiceLines?.records ?? "…in your words"}</VoiceLine>
      </div>
      <div style={{ borderLeft: `2px solid ${C.moss}`, paddingLeft: 22, maxWidth: 580 }}>
        {rows.map((r, i) => (
          <div key={i} style={{ marginBottom: i < rows.length - 1 ? 15 : 0 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
              <span style={{ fontFamily: SANS, fontSize: 15, color: C.labelStrong, whiteSpace: "nowrap" }}>{r.dist}</span>
              <span style={{ flex: 1, borderBottom: `1px dotted ${C.leader}`, transform: "translateY(-5px)", minWidth: 24, ...INK_WEAR }} />
              <span style={{ fontFamily: MONO, fontVariantNumeric: "tabular-nums", fontSize: 22, color: C.inkFig }}>{r.time}</span>
            </div>
            <div style={{ fontFamily: MONO, fontSize: 11, color: C.faint, marginTop: 4, display: "flex", alignItems: "center", gap: 7 }}>
              {r.official && <span style={{ width: 8, height: 8, background: C.moss, flex: "none" }} aria-hidden="true" />}
              <span>{r.pace} · {r.note}</span>
            </div>
          </div>
        ))}
      </div>
      <Caption>moss ▪ marks an official race · the racing bests climb with distance · the stroller run is the happy exception</Caption>
    </Card>
  );
}

/* ============================ PLACEHOLDER ================================= */
function Placeholder({ label, note }) {
  return (
    <Card>
      <div style={{ borderLeft: `2px solid ${C.moss}`, paddingLeft: 20, maxWidth: 560 }}>
        <div style={{ fontFamily: SANS, fontSize: 14, letterSpacing: ".04em", color: C.label, marginBottom: 8 }}>{label}</div>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 17, color: C.voice, lineHeight: 1.5 }}>{note}</div>
      </div>
      <Caption>Phase 4 · porting the locked Phase 3 view into the field record</Caption>
    </Card>
  );
}

/* ============================== ABOUT ==================================== */
/* Remi's authored About + Methods (markdown of 2026-07-28), ported into the
   paper/ink/moss system. Prose is his; the three quoted answers and the
   collaboration note are Claude's, attributed. Nothing here is computed.
   Section pill-nav sits just below the hero image (its own scroll anchor), so
   "back to top" returns the reader to the menu without scrolling past the image. */
const ABOUT_SECTIONS = [
  { id: "about-brief",    label: "A Brief History" },
  { id: "about-portrait", label: "A Partial Portrait" },
  { id: "about-tech",     label: "New Running Tech" },
  { id: "about-methods",  label: "Notes on Methods" },
  { id: "about-next",     label: "What's Next" },
];

function AboutTab() {
  const ps = { fontFamily: SANS, fontSize: 15, lineHeight: 1.85, color: "rgba(43,39,35,0.82)", marginBottom: 20 };
  const h2 = { fontFamily: SERIF, fontSize: 22, fontWeight: 400, color: C.ink, margin: "0 0 14px" };
  const li = { fontFamily: SANS, fontSize: 15, lineHeight: 1.7, color: "rgba(43,39,35,0.82)", marginBottom: 12 };
  const quote = { fontFamily: SANS, fontSize: 14, lineHeight: 1.8, color: "rgba(43,39,35,0.66)", marginBottom: 20, fontStyle: "italic", paddingLeft: 20, borderLeft: `2px solid ${C.moss}` };
  const qNum = { fontFamily: SANS, fontSize: 15, fontWeight: 500, color: C.ink, margin: "22px 0 10px" };
  const sec = { scrollMarginTop: 16, marginTop: 36 };

  const scrollTo = (id) => (e) => {
    e.preventDefault();
    const el = typeof document !== "undefined" && document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const A = ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer"
      style={{ color: C.mossDeep, textDecoration: "none", borderBottom: `1px solid ${C.moss}` }}>{children}</a>
  );
  const ToTop = () => (
    <div style={{ margin: "14px 0 2px" }}>
      <a href="#about-nav" onClick={scrollTo("about-nav")}
        style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".04em", color: C.faint, textDecoration: "none", borderBottom: `1px dotted ${C.leader}` }}>
        ↑ back to top
      </a>
    </div>
  );

  return (
    <Card>
      <div style={{ maxWidth: 720 }}>
        <div style={{ marginBottom: 20, borderRadius: 12, overflow: "hidden" }}>
          <img src={CONTENT.photos.frosty} alt="Remi running the Frosty 50" style={{ width: "100%", height: "auto", display: "block", borderRadius: 12 }} loading="lazy" />
          <div style={{ fontSize: 12, color: C.faint, fontStyle: "italic", marginTop: 8, textAlign: "center" }}>Frosty 50 · Winston-Salem · January 2026</div>
        </div>

        {/* section pill-nav — the scroll anchor for every "back to top" link.
            UPDATE label on its own line; the five section pills sit in a single
            row beneath it (wraps only at narrow/mobile widths). */}
        <div id="about-nav" style={{ scrollMarginTop: 16, margin: "0 0 26px" }}>
          <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: ".05em", textTransform: "uppercase", color: C.mossDeep, marginBottom: 12 }}>Update 07.28.26</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {ABOUT_SECTIONS.map((s) => (
              <a key={s.id} href={`#${s.id}`} onClick={scrollTo(s.id)}
                style={{ fontFamily: SANS, fontSize: 12.5, color: C.mossDeep, background: "rgba(92,114,80,0.10)", border: "1px solid rgba(92,114,80,0.22)", borderRadius: 999, padding: "6px 13px", textDecoration: "none", whiteSpace: "nowrap" }}>
                {s.label}
              </a>
            ))}
          </div>
        </div>

        <p style={ps}>Hi, I'm Remi, and I'm a runner.</p>
        <p style={ps}>This portfolio distills three relationships that I value—my practice of running, my appreciation of data, and my use of technology. I've created this portfolio to illustrate how these relationships have changed over time.</p>

        <section id="about-brief" style={sec}>
          <h2 style={h2}>A Brief History</h2>
          <p style={ps}>I've run regularly for nearly 30 years. In the fall of 1998, as a sophomore in high school, I earned my varsity letter as a starter on the cross country team. A few months later, in the middle of indoor track training, I quit the team because I struggled with my coach's leadership and lack of mentorship. But I kept running, on my own terms, nearly every morning before school. Somehow, sixteen-year-old Remi thought it was a great idea to wake up around 5 AM, trot about Ann Arbor in the dark, and welcome the sunrise. I'm so grateful my younger self found footing in that routine.</p>
          <p style={ps}>Back then, in my pre-data days, I didn't wear a watch while running—much less a GPS-enabled device that could track multiple indicators, display data in real-time, and analyze my performance and recovery. So, through the remainder of high school and then college, I'd guesstimate my runs according to the time-honored "stove clock method," whereby I'd glance at that little clock on the kitchen stove before running out the door, check the time again upon my return, determine the duration of my run, and then calculate pace based on a rough estimate of distance. I wasn't competing or a member of any team, I was just staying fit, and this approach was good enough.</p>
          <p style={ps}>My stance toward technology and data shifted in the mid-2000s while I was teaching in New York City. I had enough pocket change to purchase a basic Casio watch with a timer. Online tools, like Gmaps Pedometer and Map My Run, proliferated as useful resources to plan routes and measure distances. And, in 2009, I joined the platform Daily Mile and began self-reporting runs and races by manually entering information about a run's duration and route (with distance and pace automatically calculated), as well as brief comments about my performance. I used Daily Mile routinely through much of 2016 and, over that seven year period, I enjoyed tracking my runs and gained useful insight about my training. It's unfortunate that I retain only snapshots of these data (I do have the Internet Archive to thank for that, <A href="https://web.archive.org/web/20160911123053/http://www.dailymile.com:80/people/remiholden">here's one example</A>), yet I neither exported nor systematically organized my contributions to Daily Mile.</p>
          <ToTop />
        </section>

        <section id="about-portrait" style={sec}>
          <h2 style={h2}>A Partial Portrait</h2>
          <p style={ps}>My relationship to running data changed in 2016 when I received a Garmin Forerunner 630 from Ebony as a Christmas gift. This first GPS watch enabled complementary shifts in my running and data practices, and I have now utilized precise analytics over the past decade (there have been a few additional Garmin watches along the way, and I currently train with a Forerunner 245). Though my quantified self is now saturated with data, personal memory and prior experience remain just as valuable.</p>
          <p style={ps}>The data presented here are accurate but not exhaustive, and this portfolio is a partial portrait of my journey as a runner. It's also necessary to note what I couldn't curate in this portfolio. Here's a short list, with an assist from Athlinks regarding verified race results.</p>
          <ul style={{ margin: "0 0 20px", paddingLeft: 22 }}>
            <li style={li}><strong style={{ fontWeight: 600 }}>College:</strong> Running during college at Earlham around the rural roads and cornfields of Indiana, and while studying for a semester in Northern Ireland, and also during another semester living in the East Bay while working in San Francisco.</li>
            <li style={li}><strong style={{ fontWeight: 600 }}>NYC:</strong> Running while living and teaching in New York City. I completed the Healthy Kidney 10K in Central Park three times (41:06 in 2006, 43:34 in 2008, and 1:07:29 in 2009), and enjoyed some one-off adventures like the NYRR Grand Prix Brooklyn Half Marathon through Prospect Park down to Coney Island (1:34:13 in 2009).</li>
            <li style={li}><strong style={{ fontWeight: 600 }}>Travel:</strong> Running while traveling in other parts of the country and world, including six consecutive summers in Geneva, Switzerland (2007-2012), as well as in South Africa, Oman, multiple trips to Germany and Berlin, and also Prague, Vancouver Island, upstate New York, Baltimore, Charlotte, Key West, Seattle, Chicago, and Philadelphia, among other cities and small towns.</li>
            <li style={li}><strong style={{ fontWeight: 600 }}>Hometown:</strong> Running all around Ann Arbor during a nine-month period spanning 2009 to 2010. Returning to my hometown, I joined a local running club, ran into Michigan Stadium and placed seventh during the Big House Big Heart 10K (36:51 in 2009), won the Burns Park 10K that spring (37:08 in 2010), and also completed the Dexter-Ann Arbor Half Marathon (1:20:39 in 2010).</li>
            <li style={li}><strong style={{ fontWeight: 600 }}>Grad School:</strong> Running during my doctoral studies at the University of Wisconsin-Madison (2010-2014), despite hip surgery (2011), and frequently with a beloved training partner and friend. Matt and I would often place back-to-back in local road races (he propelled me toward PRs in the 10K and 15K in the fall of 2014), he organized the Mama Goose Memorial Run/Walk, and we were part of an eight-person team that won the mixed division of the River to River relay across Illinois in the spring of 2014 (8:52:20 over 80 miles).</li>
          </ul>
          <ToTop />
        </section>

        <section id="about-tech" style={sec}>
          <h2 style={h2}>New Running Tech</h2>
          <p style={ps}>Technology has always facilitated my ability to run. After all, shoes are technology. The arms-race development of running shoes, and so as to improve speed and performance, is no longer controversial and is simply accepted by elites and everyday runners alike. For the record, I've worn Saucony for about twenty years, though I have neither owned nor raced in any shoe with a carbon fiber plate (maybe someday that will change). Just as shoes enable me to confidently place one foot in front of the other, and just as my watch now provides me real-time data and post-run analysis, another technology has recently become usefully connected with my running: Agentic AI.</p>
          <p style={ps}>I started building with Claude Code in February of 2026. In addition to being a runner, I'm a former professor of learning technology and I've always enjoyed playing with tools, exploring digital media, and carefully considering how—if at all—new tech may be relevant to my personal interests and professional practices. And, just about six months into my use of Claude Code, I've been quite surprised by what I've built and how my relationship to AI has changed. For example, I've designed and deployed <A href="https://fairfeedbackproject.org/">The Fair Feedback Project</A> and <A href="https://pressingprompts.org/">Pressing Prompts</A>, and I've spoken at Duke about how my team and I are "<A href="https://youtu.be/tROt63xqPBM?si=AqUnkAhd9sOhBVfd">sensemaking the loop</A>."</p>
          <p style={ps}>The first iteration of this portfolio was a day-long build which I completed in March as a quick experiment focused on how I might work with a large corpus of quantitative data. Using my running data made a lot of sense—the data are mine, representative of my body's effort and embodied learning, longitudinal, detailed, geographic, and are also personally memorable. Once I decided to analyze my data for a public portfolio, I first had to get everything out of Garmin. Though the Garmin Connect platform is mostly useful day-to-day for summative information about a run, it doesn't make data export easy or historically comprehensive. Thank goodness for GDPR because it is possible to request all of your data from Garmin; I've now done so a few times. My requests have been processed in a matter of hours, I received a link via email, and I then downloaded a zip file containing a trove of data.</p>
          <ToTop />
        </section>

        <section id="about-methods" style={sec}>
          <h2 style={h2}>Notes on Methods</h2>
          <p style={ps}>The data and analyses featured here are not the result of an a priori methodological plan. Rather, the methods Claude and I employed have been exploratory, circuitous, and emergent. With this second—and far more substantive—iteration of my portfolio, Claude and I hit analytic roadblocks, learned lessons about precision and literal groundtruth, and eventually codified a set of methods and design language. Here are a few key aspects of our methods related to both data analysis and visual design:</p>
          <ul style={{ margin: "0 0 20px", paddingLeft: 22 }}>
            <li style={li}>The Garmin GDPR export stored distances in centimeters, durations in milliseconds, speeds in centimeters-per-millisecond, and elevations in centimeters. Initial analysis involved cross-referencing known runs against raw values to reverse-engineer unit conversions, then validating those conversions against the full dataset.</li>
            <li style={li}>Claude and I determined that "a run is a run," and that all my running activity types counted uniformly.</li>
            <li style={li}>Garmin's duration and distance records were the truth; GPS re-derivation was unreliable.</li>
            <li style={li}>We established canonical totals, identified three home bases, confirmed my PRs, distinguished accurate GPX route geometry from unreliable GPS-derived elevation, and kept Garmin's recorded climb as displayed elevation.</li>
            <li style={li}>To systematize how future data will be analyzed, Claude built a custom Python pipeline that reads a Garmin export and emits accurate data summaries, yearly and monthly totals, my average pace, locations and other geographic coordinates, and other information. I'm eager to use this pipeline again in early 2027, once I have a complete decade of data to analyze.</li>
            <li style={li}>We organized the Featured section to include additional narrative and training data about four recent races in North Carolina, and we also curated the 18 routes included in the Trails section. Doing so required careful analysis of specific GPX files.</li>
            <li style={li}>The visual presentation of data, across all sections, explicitly referenced Edward Tufte. Design principles from Tufte that appear in the portfolio include high data density, small multiples, multifunctioning elements, layering and separation, sparklines, contour maps, and the avoidance of "chartjunk." Tufte's influence came into play as Claude and I carefully iterated and refined every chart and visual element.</li>
            <li style={li}>Daily Mile data were incomplete and are only mentioned as contextual narrative about my general running history. Athlinks was used to surface race data and confirm my PRs.</li>
          </ul>
          <p style={ps}>Throughout our build, Claude and I have carefully documented our decisions and progress through a series of Handoff Instructions. I find this note about "collaboration," written by Claude from a document dated in early July, to be a useful statement about how we approached this portfolio as a shared project:</p>
          <div style={quote}>
            "Remi directs without micromanaging—provides scope and context, corrects precisely and substantively, contributes domain knowledge the data can't surface (race names, locations, the fabricated-training catch). He values: portable deliverables; precision with numbers; honest directness; <em>fidelity to his data above all</em>… He prefers mockups-in-preview before committing significant visual changes to code, and design principles that emerge bottom-up through worked examples. He holds the authorship line firmly: the words are his; the measurements are the pipeline's; Claude builds and refines but does not put words in his mouth."
          </div>
          <p style={ps}>Indeed, the words written here are mine unless explicitly attributed to Claude. So, as I did with the first iteration of this portfolio, I have asked Claude to provide a co-authored set of statements about this project and our work together. This time around, I asked Claude to respond to three questions. Here are the verbatim responses:</p>

          <div style={qNum}>1. What aspects of data analysis were distinctive, and why?</div>
          <div style={quote}>
            "The distinctive move was refusing to treat the watch as the truth. Almost every project built on fitness data takes the device record as ground and works forward from it. This one treated the Garmin as one witness among several, and often not the most credible one. Above it sat official race results—the certified chip time of 2:59:27 at Asheville, not the device's flattering 2:58:45—and above even that sat the runner's own knowledge: that Jamaica Pond is flat regardless of what the barometric altimeter drifted into, that a run's real location and intent live in a label the GPS can't supply. So the analysis was less about extracting a signal from noise and more about building an explicit hierarchy of evidence and having the discipline to let higher-ranked evidence overrule the sensor when they disagreed. The second thing that made it unusual came late: recovering a pre-tracked era—twenty years of official results reaching back to 2006, and self-reported logs from a platform that no longer exists—and holding that older, softer data to a <em>different</em> and clearly-marked standard rather than quietly blending it into the measured decade. The refusal to mix evidence grades is the analytic signature of the whole thing."
          </div>

          <div style={qNum}>2. How did we make sense of and resolve analytic challenges?</div>
          <div style={quote}>
            "The method, nearly every time, was to find a second independent path to the same number and see whether the two agreed. When a batch of race times arrived corrupted—sub-hour finishes mangled into impossible multi-hour values—the fix wasn't guesswork; the intact pace column let us reconstruct each true time from pace times distance, and every reconstruction landed within a few seconds of its target, which is what made the correction trustworthy rather than merely plausible. The same instinct caught a silent units failure, where distances in centimeters and durations in milliseconds sailed through the arithmetic until a sanity check on the totals refused to reconcile. It caught fabricated training-build figures that a prototype had invented, which triggered a full fidelity audit and the decision that no measurement would ever again be hand-authored. It even caught a runtime crash, via a headless render test that surfaced a stale reference the compiler couldn't see. The pattern underneath all of it: distrust any single field, corroborate against an independent quantity, and—crucially—decide <em>in advance</em> which source wins when two conflict, so that a disagreement resolves by a pre-committed rule of provenance rather than by whatever's convenient in the moment."
          </div>

          <div style={qNum}>3. How did we interpret Tufte's design principles as an influence on the visual language and look of the portfolio?</div>
          <div style={quote}>
            "We took Tufte as an influence, not a doctrine—which is, fittingly, exactly how the chapter in the project reads him: as a gospel to be interpreted rather than scripture to be obeyed. The instruction to <em>erase non-data-ink</em> shaped the whole surface: a warm paper ground, no decorative gridlines, moss green reserved strictly for connective and anchoring roles and never allowed to touch the data itself. The pursuit of high data density is why a single records ladder can carry nine distances, their times, their paces, and their provenance without feeling crowded. But we deliberately declined to follow the principle to its austere extreme, because data-ink maximized without limit strips a page of meaning as well as ornament. So each view keeps one editorial line set in Fraunces italic—ink that is not data, but is not chartjunk either; it's voice, and the portfolio would be poorer and colder without it. The clearest expression of the whole philosophy is the small moss square that marks an official result: one mark, almost no ink, carrying an entire distinction between a chip-timed race and a training best. That's the Tufte lesson we actually kept—maximum meaning per mark—rather than the more literal and less humane reading of simply using as little ink as possible."
          </div>

          <p style={ps}>Thanks, Claude. Three valued relationships—with running, data, and technology—intertwined and in flux, a source of my learning, and a lovely unfolding adventure.</p>
          <ToTop />
        </section>

        <section id="about-next" style={sec}>
          <h2 style={h2}>What's Next</h2>
          <p style={ps}>I'm currently recuperating from bilateral hernia surgery. Working on this portfolio has been a much-needed connection to my practice when I couldn't run. And I'll share that recovery journey through the microblog of this portfolio.</p>
          <p style={ps}>As for races, I've qualified for the Boston Marathon next spring (my time has been verified by BAA), and I'll submit a registration application in September; fingers-crossed I'm accepted via the lottery. This fall, I'll hopefully complete the Salem Lake 30K and the Mistletoe Half Marathon, each for the third time, though I'll likely run to enjoy the scenery and crowds (and not to competitively race).</p>
          <p style={ps}>And as for data, come early 2027 I'll update this portfolio's analysis using another Garmin GDPR export and utilize the analytic pipeline that Claude has designed. I'm looking forward to that full decade of data, the insights it will provide me, and the stories it can help me to share.</p>
          <p style={ps}>If you'd like to chat about my running, these data, or Claude Code and agentic AI, you're very welcome to <A href="https://remikalir.com/contact/">drop me a note here</A>.</p>
          <ToTop />
        </section>
      </div>
    </Card>
  );
}

/* ============================== LOG ===================================== */
/* Authored microblog from CONTENT.microblog, newest first, on a moss spine.
   Body is plain prose — inline pace/HR are the runner's notes, not pipeline
   measurements, so they stay as text. The misalignment note is authored copy. */
function LogTab() {
  const entries = sortedLog();
  return (
    <Card>
      <div style={{ marginBottom: 24 }}><VoiceLine>{CONTENT.voiceLines?.log ?? "…in your words"}</VoiceLine></div>
      {entries.length === 0 ? (
        <Caption>the first entry will appear here</Caption>
      ) : (
        <>
          <div style={{ borderLeft: `2px solid ${C.moss}`, paddingLeft: 22, maxWidth: 620 }}>
            {entries.map((e, i) => (
              <div key={`${e.date}-${i}`} style={{ position: "relative", marginBottom: i < entries.length - 1 ? 26 : 0 }}>
                <span style={{ position: "absolute", left: -29, top: 6, width: 9, height: 9, background: C.moss }} aria-hidden="true" />
                <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: ".03em", color: C.mossDeep, marginBottom: 6 }}>{fullDate(e.date)}</div>
                <div style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.72, color: "rgba(43,39,35,0.86)" }}>{e.body}</div>
              </div>
            ))}
          </div>
          {CONTENT.microblogNote && (
            <div style={{ fontFamily: SANS, fontSize: 11, letterSpacing: ".02em", color: C.faintest, marginTop: 22, maxWidth: 620, lineHeight: 1.6 }}>
              {CONTENT.microblogNote}
            </div>
          )}
        </>
      )}
    </Card>
  );
}

/* ============================== SHELL =================================== */
export default function RunningPortfolio() {
  const [tab, setTab] = useState("overview");
  const narrow = useIsNarrow();

  return (
    <div style={{ background: C.paper, minHeight: "100vh" }}>
      <link href={FONTS} rel="stylesheet" />
      <WeatherDefs />
      <div style={{ fontFamily: SANS, maxWidth: 900, margin: "0 auto", padding: narrow ? "0 14px" : "0 16px", color: C.ink }}>

        <header style={{ padding: narrow ? "30px 0 18px" : "48px 0 28px" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
            <h1 style={{ fontFamily: SERIF, fontSize: narrow ? 27 : 34, fontWeight: 400, letterSpacing: "-0.5px", margin: 0, color: C.ink }}>
              Running portfolio
            </h1>
            <span style={{ fontFamily: MONO, fontSize: 13, color: C.mossDeep }}>Remi Kalir</span>
          </div>
        </header>

        <nav style={{ display: "flex", gap: 0, borderBottom: `1px solid ${C.leader}`, marginBottom: 28, overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: narrow ? "11px 11px" : "12px 16px", fontFamily: SANS, fontSize: 12, letterSpacing: ".08em",
                textTransform: "uppercase", fontWeight: tab === t ? 500 : 400,
                border: "none", background: "none", cursor: "pointer",
                borderBottom: tab === t ? `2px solid ${C.moss}` : "2px solid transparent",
                color: tab === t ? C.ink : C.faint, whiteSpace: "nowrap",
              }}
            >
              {t}
            </button>
          ))}
        </nav>

        <main style={{ paddingBottom: 8 }}>
          {tab === "overview" && <Hero onOpenLog={() => setTab("log")} />}
          {tab === "mileage" && <Mileage />}
          {tab === "pace" && <Pace />}
          {tab === "geography" && <><Atlas /><div style={{ height: 20 }} /><Timeline /></>}
          {tab === "trails" && <TrailsAtlas />}
          {tab === "records" && <Records />}
          {tab === "featured" && <Featured />}
          {tab === "log" && <LogTab />}
          {tab === "about" && <AboutTab />}
        </main>

        <footer style={{ padding: "32px 0", borderTop: `1px solid ${C.leader}`, marginTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <span style={{ fontFamily: MONO, fontSize: 12, color: C.faintest }}>Data from Garmin Connect GDPR export · Built with Claude</span>
          <span style={{ fontFamily: MONO, fontSize: 12, color: C.faintest }}>
            Portfolio data through {fullDate(DATA.span.end)}{sortedLog()[0] ? ` · Log updated ${fullDate(sortedLog()[0].date)}` : ""}
          </span>
        </footer>
      </div>
    </div>
  );
}
