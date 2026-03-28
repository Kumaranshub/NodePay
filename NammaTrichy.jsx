import { useState, useEffect, useRef } from "react";

// ═══════════════════════════════════════════════════════════════════════════════
// ⚙️  SUPABASE CONFIG — paste your keys here
// ═══════════════════════════════════════════════════════════════════════════════
const SUPABASE_URL  = "https://pfzblpagvktqblnqvivp.supabase.co"; // 🔑 replace this
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmemJscGFndmt0cWJsbnF2aXZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0NDc0NDIsImV4cCI6MjA5MDAyMzQ0Mn0.3GZsDHUSEqucvW3wFUbdE13AgCoaOdiA-42GX47RMjw";                // 🔑 replace this

// Minimal Supabase REST client (no extra package needed)
const supabase = {
  async insert(table, row) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_ANON,
        "Authorization": `Bearer ${SUPABASE_ANON}`,
        "Prefer": "return=minimal",
      },
      body: JSON.stringify(row),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error(`[Supabase] insert into ${table} failed:`, err);
      return { error: err };
    }
    return { error: null };
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// TICKETS DATA
// ═══════════════════════════════════════════════════════════════════════════════
const ROUTE_DATA = {
  "1a":  { dist: 4.2,  mins: 22, fare: 12 },
  "3":   { dist: 5.8,  mins: 28, fare: 10 },
  "7":   { dist: 6.4,  mins: 35, fare: 8  },
  "15b": { dist: 9.1,  mins: 40, fare: 14 },
  "22":  { dist: 3.2,  mins: 18, fare: 6  },
  "47":  { dist: 14.5, mins: 55, fare: 18 },
  "51":  { dist: 22.0, mins: 75, fare: 24 },
  "77":  { dist: 7.8,  mins: 32, fare: 12 },
  "88":  { dist: 18.0, mins: 65, fare: 20 },
};
const LIVE_SETS = [
  ["Bus 1A · On Time", "Bus 1A · 2 Min Away", "Bus 1A · Arriving Now"],
  ["Bus 3 · On Time",  "Bus 3 · 4 Min Away",  "Bus 3 · Departing Soon"],
  ["Bus 15B · On Time","Bus 15B · 6 Min Away","Bus 15B · Departing Soon"],
];
const HEADLINES = ["On Time (1A)","2 Min Away (1A)","Arriving (1A)","On Time (3)","4 Min Away (3)","Departing Soon (15B)"];
const STOP_OPTIONS = [
  { value: "trichy_jn",     label: "Trichy Junction Bus Stop" },
  { value: "central_bs",    label: "Central Bus Stand"        },
  { value: "chatram_bs",    label: "Chatram Bus Stand"        },
  { value: "srirangam_bs",  label: "Srirangam Bus Stand"      },
  { value: "ariyamangalam", label: "Ariyamangalam"            },
  { value: "thillai_nagar", label: "Thillai Nagar"            },
  { value: "woraiyur",      label: "Woraiyur"                 },
  { value: "karumandapam",  label: "Karumandapam"             },
  { value: "puthur",        label: "Puthur"                   },
  { value: "kk_nagar",      label: "KK Nagar"                 },
  { value: "kal_colony",    label: "KAL Colony"               },
  { value: "intarapet",     label: "Intarapet"                },
  { value: "rockfort",      label: "Rock Fort"                },
  { value: "big_bazaar",    label: "Big Bazaar"               },
  { value: "bhel",          label: "BHEL Township"            },
  { value: "airport",       label: "Airport"                  },
  { value: "pullambadi",    label: "Pullambadi"               },
  { value: "musiri",        label: "Musiri"                   },
  { value: "lalgudi",       label: "Lalgudi"                  },
  { value: "manachanallur", label: "Manachanallur"            },
  { value: "manapparai",    label: "Manapparai"               },
  { value: "golden_rock",   label: "Golden Rock"              },
];
const ROUTE_OPTIONS = [
  { value: "1a",  label: "Route 1A · Trichy Jn → Rock Fort"         },
  { value: "3",   label: "Route 3 · Central BS → Srirangam"         },
  { value: "7",   label: "Route 7 · Chatram BS → Woraiyur"          },
  { value: "15b", label: "Route 15B · Trichy Jn → BHEL"             },
  { value: "22",  label: "Route 22 · Ariyamangalam → Thillai Nagar" },
  { value: "47",  label: "Route 47 · Central BS → Lalgudi"          },
  { value: "51",  label: "Route 51 · Chatram → Musiri"              },
  { value: "77",  label: "Route 77 · Trichy Jn → Airport"           },
  { value: "88",  label: "Route 88 · Puthur → Manapparai"           },
];
const WEEK_DATA = [1,2,2,0,5,7,3,5,0,6,2,5,5,0,0,5,4,5,3,8,1,5,0,4,6,8,3,2];
const DAYS = ["Su","Mo","Tu","We","Th","Fr","Sa"];
const ACTIVE_TICKETS = [
  { ref: "TCK-2024-0042", from: "TRICHY JN",  fromTime: "08:15 AM", to: "ROCK FORT", toTime: "08:37 AM", route: "1A",  stops: 8,  date: "24 Mar", price: 12, liveIdx: 0, qrLabel: "Trichy Jn → Rock Fort · Bus 1A"      },
  { ref: "TCK-2024-0043", from: "CENTRAL BS", fromTime: "10:00 AM", to: "SRIRANGAM", toTime: "10:28 AM", route: "3",   stops: 12, date: "25 Mar", price: 10, liveIdx: 1, qrLabel: "Central BS → Srirangam · Bus 3"       },
  { ref: "TCK-2024-0044", from: "CHATRAM BS", fromTime: "02:30 PM", to: "BHEL",      toTime: "03:10 PM", route: "15B", stops: 15, date: "25 Mar", price: 14, liveIdx: 2, qrLabel: "Chatram BS → BHEL · Bus 15B"          },
];
const HISTORY = [
  { route: "Rock Fort → Trichy Jn",    meta: "Bus 1A · 20 min", price: "₹12", date: "Today, 08:15"  },
  { route: "Central BS → Woraiyur",    meta: "Bus 7 · 34 min",  price: "₹8",  date: "Yesterday"     },
  { route: "Srirangam → Central BS",   meta: "Bus 3 · 27 min",  price: "₹10", date: "22 Mar, 14:00" },
  { route: "Chatram BS → Karumandapam",meta: "Bus 22 · 18 min", price: "₹6",  date: "22 Mar"        },
  { route: "Trichy Jn → Srirangam",    meta: "Bus 1 · 30 min",  price: "₹11", date: "21 Mar"        },
  { route: "Woraiyur → Rock Fort",     meta: "Bus 5 · 25 min",  price: "₹9",  date: "21 Mar"        },
  { route: "Karumandapam → Central BS",meta: "Bus 12 · 22 min", price: "₹7",  date: "21 Mar"        },
  { route: "Central BS → Rock Fort",   meta: "Bus 2 · 15 min",  price: "₹5",  date: "21 Mar"        },
  { route: "Srirangam → Trichy Jn",    meta: "Bus 1 · 29 min",  price: "₹11", date: "21 Mar"        },
  { route: "Chatram BS → Woraiyur",    meta: "Bus 9 · 21 min",  price: "₹7",  date: "21 Mar"        },
];

// ═══════════════════════════════════════════════════════════════════════════════
// TRANSPORT DATA
// ═══════════════════════════════════════════════════════════════════════════════
const LOCS = {
  central_bus:   { name: "Trichy Central Bus Stand", lat: 10.8050, lng: 78.6856 },
  chatram_bus:   { name: "Chatram Bus Stand",         lat: 10.8231, lng: 78.6917 },
  srirangam_bus: { name: "Srirangam Bus Stand",       lat: 10.8636, lng: 78.6921 },
  thillai_nagar: { name: "Thillai Nagar Bus Stop",    lat: 10.8189, lng: 78.6985 },
  bhel:          { name: "BHEL Township Stop",         lat: 10.9081, lng: 78.7295 },
  airport:       { name: "Trichy Airport",             lat: 10.7651, lng: 78.7099 },
  trichy_jn:     { name: "Trichy Junction Rly Stn",   lat: 10.8161, lng: 78.6844 },
  srirangam_rly: { name: "Srirangam Rly Stn",         lat: 10.8606, lng: 78.7003 },
  golden_rock:   { name: "Golden Rock Rly Stn",       lat: 10.8420, lng: 78.7312 },
  lalgudi:       { name: "Lalgudi Rly Stn",           lat: 10.8697, lng: 78.8156 },
};
const RATES = {
  bike: { rate: 9,  emoji: "🏍️", label: "Bike", driver: "C. Kumaran", rateDisplay: "₹6–12 / km" },
  auto: { rate: 15, emoji: "🛺",  label: "Auto", driver: "R. Muthu",   rateDisplay: "₹10–20 / km" },
  cab:  { rate: 22, emoji: "🚖",  label: "Cab",  driver: "S. Karthik", rateDisplay: "₹13–30 / km" },
};
const LOC_OPTIONS = [
  { value: "central_bus",   label: "Trichy Central Bus Stand" },
  { value: "chatram_bus",   label: "Chatram Bus Stand"        },
  { value: "srirangam_bus", label: "Srirangam Bus Stand"      },
  { value: "thillai_nagar", label: "Thillai Nagar Bus Stop"   },
  { value: "bhel",          label: "BHEL Township Stop"       },
  { value: "airport",       label: "Trichy Airport"           },
  { value: "trichy_jn",     label: "Trichy Junction Rly Stn"  },
  { value: "srirangam_rly", label: "Srirangam Rly Stn"        },
  { value: "golden_rock",   label: "Golden Rock Rly Stn"      },
  { value: "lalgudi",       label: "Lalgudi Rly Stn"          },
];
const LIVE_VEHICLES = [
  { emoji: "🏍️", lat: 10.820, lng: 78.692, dL:  0.0012, dG:  0.0009 },
  { emoji: "🛺",  lat: 10.835, lng: 78.700, dL: -0.0010, dG:  0.0011 },
  { emoji: "🚖",  lat: 10.810, lng: 78.712, dL:  0.0008, dG: -0.0013 },
  { emoji: "🏍️", lat: 10.855, lng: 78.695, dL: -0.0015, dG:  0.0007 },
  { emoji: "🛺",  lat: 10.800, lng: 78.685, dL:  0.0011, dG:  0.0010 },
];

// ═══════════════════════════════════════════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════════════════════════════════════════
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371, d2r = Math.PI / 180;
  const dL = (lat2 - lat1) * d2r, dG = (lng2 - lng1) * d2r;
  const a = Math.sin(dL / 2) ** 2 + Math.cos(lat1 * d2r) * Math.cos(lat2 * d2r) * Math.sin(dG / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
function calcFare(pickup, drop, rideType) {
  const p = LOCS[pickup], d = LOCS[drop];
  if (!p || !d || pickup === drop) return null;
  const dist = haversine(p.lat, p.lng, d.lat, d.lng);
  const fare = Math.round(dist * RATES[rideType].rate);
  const mins = Math.round(dist * (rideType === "bike" ? 3 : rideType === "auto" ? 4 : 3.5));
  return { dist, fare, mins };
}
function drawQR(canvas, size = 140) {
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = "#000";
  const cell = Math.floor(size / 14);
  for (let r = 0; r < 14; r++)
    for (let c = 0; c < 14; c++) {
      const corner = (r < 4 && c < 4) || (r < 4 && c > 9) || (r > 9 && c < 4);
      if (corner || Math.random() > 0.48) ctx.fillRect(c * cell + 2, r * cell + 2, cell - 1, cell - 1);
    }
  [[2, 2], [2, Math.floor(size * 0.73)], [Math.floor(size * 0.73), 2]].forEach(([x, y]) => {
    const s = Math.floor(size * 0.19);
    ctx.strokeStyle = "#000"; ctx.lineWidth = 2; ctx.strokeRect(x, y, s, s);
    ctx.fillStyle = "#000"; ctx.fillRect(x + 3, y + 3, s - 6, s - 6);
    ctx.fillStyle = "#fff"; ctx.fillRect(x + 6, y + 6, s - 12, s - 12);
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMBINED CSS
// ═══════════════════════════════════════════════════════════════════════════════
const ALL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Anton&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');

:root {
  --gold:     #C6A86B;
  --gold-dim: rgba(198,168,107,0.35);
  --gold-bg:  rgba(198,168,107,0.07);
  --gold-bdr: rgba(198,168,107,0.2);
  --black:    #080808;
  --surface:  #0f0f0f;
  --surface2: #161616;
  --white:    #ffffff;
  --pearl:    #f0ede8;
  --grey:     #888;
  --muted:    rgba(255,255,255,0.38);
}
*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  background: var(--black); color: var(--white);
  font-family: 'EB Garamond', Georgia, serif; overflow-x: hidden;
}

/* ── SHARED NAV ─────────────────────────────────────────────── */
.nt-nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
  display: flex; justify-content: space-between; align-items: center;
  padding: 24px 56px; transition: background 0.5s, padding 0.4s;
}
.nt-nav.scrolled {
  background: rgba(8,8,8,0.97); backdrop-filter: blur(20px);
  padding: 14px 56px; border-bottom: 1px solid rgba(198,168,107,0.15);
}
.nt-nav-logo {
  font-family: 'Anton', sans-serif; font-size: 28px; letter-spacing: 0.12em;
  text-transform: uppercase; color: var(--white);
  display: flex; align-items: center; gap: 10px;
  background: none; border: none; cursor: pointer;
  text-shadow: 0 1px 8px rgba(0,0,0,0.9);
}
.nt-nav-logo span { color: var(--gold); }
.nt-nav-logo-dot { width: 8px; height: 8px; background: var(--gold); border-radius: 50%; display: inline-block; }
.nt-nav-links { display: flex; align-items: center; gap: 36px; }
.nt-nav-links button {
  font-family: 'Anton', sans-serif; font-size: 15px; letter-spacing: 0.1em;
  color: rgba(255,255,255,0.75); text-transform: uppercase; position: relative;
  padding-bottom: 3px; transition: color 0.3s; background: none; border: none;
  cursor: pointer; text-shadow: 0 1px 8px rgba(0,0,0,0.9);
}
.nt-nav-links button::after {
  content: ''; position: absolute; bottom: 0; left: 0;
  width: 0; height: 1px; background: var(--gold); transition: width 0.3s;
}
.nt-nav-links button:hover { color: #fff; }
.nt-nav-links button:hover::after, .nt-nav-links button.active::after { width: 100%; }
.nt-nav-links button.active { color: var(--gold); }
.nt-nav-cta {
  font-family: 'Anton', sans-serif; font-size: 14px; letter-spacing: 0.14em;
  text-transform: uppercase; color: var(--black) !important; background: var(--gold);
  padding: 10px 22px; border: none; cursor: pointer; transition: background 0.25s, transform 0.2s;
}
.nt-nav-cta:hover { background: var(--white); transform: translateY(-1px); }

/* ── HOME: HERO ──────────────────────────────────────────────── */
.nt-hero {
  position: relative; width: 100%; min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1208 50%, #080808 100%);
  overflow: hidden; display: flex; align-items: flex-end;
}
.nt-hero-pattern {
  position: absolute; inset: 0; opacity: 0.04;
  background-image:
    repeating-linear-gradient(0deg,  transparent, transparent 80px, var(--gold) 80px, var(--gold) 81px),
    repeating-linear-gradient(90deg, transparent, transparent 80px, var(--gold) 80px, var(--gold) 81px);
}
.nt-hero-glow {
  position: absolute; top: 20%; right: 10%; width: 500px; height: 500px;
  background: radial-gradient(circle, rgba(198,168,107,0.12) 0%, transparent 70%);
  border-radius: 50%; pointer-events: none;
}
.nt-hero::after {
  content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, var(--gold), transparent);
  animation: shimmer 3s ease infinite; z-index: 2;
}
@keyframes shimmer { 0%,100%{opacity:0.3;transform:scaleX(0.4);}50%{opacity:1;transform:scaleX(1);} }
.nt-hero-content { position: relative; z-index: 3; padding: 0 56px 80px; }
.nt-hero-eyebrow { display: flex; align-items: center; gap: 14px; margin-bottom: 16px; }
.nt-hero-eyebrow-line {
  height: 1px; background: var(--gold);
  animation: linein 0.9s ease 0.2s forwards; width: 0;
}
@keyframes linein { to { width: 52px; } }
.nt-hero-eyebrow-text {
  font-family: 'Anton', sans-serif; font-size: 13px; letter-spacing: 0.3em;
  text-transform: uppercase; color: var(--gold); opacity: 0;
  animation: fadein 0.8s ease 0.5s forwards;
}
@keyframes fadein { to { opacity: 1; } }
.nt-hero-line {
  display: block; font-family: 'Anton', sans-serif; text-transform: uppercase;
  line-height: 0.92; opacity: 0; transform: translateY(40px);
}
.nt-hero-line-1 {
  font-size: clamp(40px, 7vw, 100px); letter-spacing: 0.02em;
  animation: floatup 1s cubic-bezier(0.22,1,0.36,1) 0.4s forwards;
}
.nt-hero-line-2 {
  font-size: clamp(56px, 11.5vw, 156px); color: var(--pearl);
  text-shadow: 0 2px 40px rgba(0,0,0,0.5);
  animation: floatup 1s cubic-bezier(0.22,1,0.36,1) 0.65s forwards;
}
@keyframes floatup { to { opacity: 1; transform: translateY(0); } }
.nt-hero-ctas {
  display: flex; gap: 16px; margin-top: 36px; opacity: 0;
  animation: fadein 0.8s ease 1.1s forwards;
}

/* ── BUTTONS ─────────────────────────────────────────────────── */
.nt-btn-primary {
  font-family: 'Anton', sans-serif; font-size: 14px; letter-spacing: 0.14em;
  text-transform: uppercase; background: var(--gold); color: var(--black);
  border: none; padding: 16px 36px; cursor: pointer; transition: background 0.25s, transform 0.2s;
}
.nt-btn-primary:hover { background: var(--white); transform: translateY(-2px); }
.nt-btn-secondary {
  font-family: 'Anton', sans-serif; font-size: 14px; letter-spacing: 0.14em;
  text-transform: uppercase; background: transparent; color: var(--white);
  border: 2px solid rgba(255,255,255,0.5); padding: 14px 36px; cursor: pointer;
  transition: background 0.25s, border-color 0.25s, transform 0.2s;
}
.nt-btn-secondary:hover { background: rgba(255,255,255,0.08); border-color: #fff; transform: translateY(-2px); }

/* ── HOME: QUICK ACCESS ──────────────────────────────────────── */
.nt-quick-access { background: var(--black); padding: 0 56px; }
.nt-quick-grid {
  display: grid; grid-template-columns: repeat(4, 1fr);
  border-top: 1px solid rgba(198,168,107,0.2);
}
.nt-quick-tile {
  padding: 40px 32px; border-right: 1px solid rgba(255,255,255,0.05);
  cursor: pointer; display: block; transition: background 0.3s; background: none;
  border-top: none; border-bottom: none; border-left: none; text-align: left;
}
.nt-quick-tile:last-child { border-right: none; }
.nt-quick-tile:hover { background: rgba(198,168,107,0.05); }
.nt-quick-tile-label {
  font-family: 'Anton', sans-serif; font-size: 11px; letter-spacing: 0.22em;
  text-transform: uppercase; color: var(--gold); margin-bottom: 8px; display: block;
}
.nt-quick-tile-title {
  font-family: 'Anton', sans-serif; font-size: 22px; letter-spacing: 0.02em;
  text-transform: uppercase; color: var(--white); margin-bottom: 10px; line-height: 1.1; display: block;
}
.nt-quick-tile-desc { font-family: 'EB Garamond', serif; font-size: 16px; color: rgba(255,255,255,0.35); line-height: 1.6; display: block; }
.nt-quick-tile-arrow {
  display: inline-block; margin-top: 16px; font-family: 'Anton', sans-serif;
  font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase;
  color: var(--gold); opacity: 0; transform: translateX(-6px);
  transition: opacity 0.25s, transform 0.25s;
}
.nt-quick-tile:hover .nt-quick-tile-arrow { opacity: 1; transform: translateX(0); }

/* ── HOME: ABOUT ─────────────────────────────────────────────── */
.nt-about {
  background: var(--black); padding: 100px 56px;
  display: grid; grid-template-columns: 200px 1fr; gap: 0 80px;
  align-items: start; max-width: 1280px; margin: 0 auto;
}
.nt-about-label {
  font-family: 'Anton', sans-serif; font-size: 13px; letter-spacing: 0.28em;
  text-transform: uppercase; color: rgba(198,168,107,0.6); padding-top: 12px;
  position: sticky; top: 80px;
}
.nt-about-label::before {
  content: ''; display: block; width: 28px; height: 1px;
  background: var(--gold-dim); margin-bottom: 14px;
}
.nt-about-right h2 {
  font-family: 'Anton', sans-serif; font-size: clamp(32px, 4.5vw, 64px);
  letter-spacing: 0.03em; line-height: 1.08; color: var(--pearl); margin-bottom: 40px;
}
.nt-about-right p {
  font-size: clamp(18px, 1.7vw, 24px); line-height: 1.95; color: var(--grey); max-width: 660px;
}
.nt-about-right p strong { color: var(--pearl); font-style: italic; }

/* ── HOME: FEATURES BAR ──────────────────────────────────────── */
.nt-features {
  border-top: 1px solid rgba(255,255,255,0.06);
  border-bottom: 1px solid rgba(255,255,255,0.06);
  padding: 28px 56px; display: flex; gap: 60px; align-items: center; overflow-x: auto;
}
.nt-feature-item { display: flex; align-items: center; gap: 20px; white-space: nowrap; }
.nt-feature-dot { width: 6px; height: 6px; background: var(--gold); border-radius: 50%; flex-shrink: 0; }
.nt-feature-text {
  font-family: 'Anton', sans-serif; font-size: 11px; letter-spacing: 0.2em;
  text-transform: uppercase; color: rgba(255,255,255,0.35);
}

/* ── FOOTER ──────────────────────────────────────────────────── */
.nt-footer {
  background: var(--black); border-top: 1px solid rgba(198,168,107,0.12);
  padding: 72px 56px 44px;
}
.nt-footer-inner {
  max-width: 1280px; margin: 0 auto;
  display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 40px 80px;
}
.nt-footer-col h3 {
  font-family: 'Anton', sans-serif; font-size: 13px; letter-spacing: 0.24em;
  text-transform: uppercase; color: var(--gold); margin-bottom: 24px;
}
.nt-footer-col h3::before {
  content: ''; display: block; width: 20px; height: 1px;
  background: var(--gold-dim); margin-bottom: 12px;
}
.nt-footer-col ul { list-style: none; }
.nt-footer-col ul li { font-family: 'EB Garamond', serif; font-size: 15px; color: #444; margin-bottom: 10px; line-height: 1.5; }
.nt-footer-col ul li a { color: #444; text-decoration: none; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 1px; transition: color 0.25s; }
.nt-footer-col ul li a:hover { color: var(--pearl); }
.nt-footer-bottom {
  max-width: 1280px; margin: 52px auto 0; padding-top: 24px;
  border-top: 1px solid rgba(255,255,255,0.05);
  display: grid; grid-template-columns: 1fr auto 1fr; align-items: center;
}
.nt-footer-bottom-left, .nt-footer-bottom-right {
  font-family: 'Anton', sans-serif; font-size: 11px; letter-spacing: 0.18em; color: #2a2a2a; text-transform: uppercase;
}
.nt-footer-bottom-right { text-align: right; }
.nt-footer-logo { font-family: 'Anton', sans-serif; font-size: 20px; letter-spacing: 0.14em; color: var(--pearl); text-transform: uppercase; text-align: center; }
.nt-footer-logo span { color: var(--gold); }

/* ── PLACEHOLDER PAGES ───────────────────────────────────────── */
.nt-page {
  min-height: 100vh; display: flex; align-items: center; justify-content: center;
  flex-direction: column; gap: 24px; padding: 120px 56px 80px;
}
.nt-page-title {
  font-family: 'Anton', sans-serif; font-size: clamp(48px, 8vw, 120px);
  letter-spacing: 0.04em; text-transform: uppercase; color: var(--pearl); text-align: center;
}
.nt-page-subtitle {
  font-family: 'EB Garamond', serif; font-size: 22px; color: var(--grey); text-align: center; max-width: 520px;
}
.nt-page-tag {
  font-family: 'Anton', sans-serif; font-size: 12px; letter-spacing: 0.3em;
  text-transform: uppercase; color: var(--gold); border: 1px solid var(--gold-dim);
  padding: 6px 18px;
}

/* ═══════════════════════════════════════════════════════════════
   TICKETS PAGE
   ═══════════════════════════════════════════════════════════════ */
.tk-layout { display:grid; grid-template-columns:560px 1fr; min-height:calc(100vh - 68px); padding-top:68px; }

.tk-left-panel { border-right:1px solid var(--gold-bdr); display:flex; flex-direction:column; overflow-y:auto; background:var(--black); }
.tk-left-panel::-webkit-scrollbar { width:2px; }
.tk-left-panel::-webkit-scrollbar-thumb { background:var(--gold-dim); }

.tk-panel-hero { padding:44px 48px 36px; border-bottom:1px solid var(--gold-bdr); }
.tk-panel-eyebrow { font-size:10px; letter-spacing:0.3em; text-transform:uppercase; color:rgba(198,168,107,0.6); margin-bottom:14px; display:flex; align-items:center; gap:10px; }
.tk-panel-eyebrow::before { content:''; display:block; width:18px; height:1px; background:var(--gold-dim); }
.tk-panel-heading { font-family:'Anton',sans-serif; font-size:clamp(52px,6vw,80px); line-height:0.9; letter-spacing:0.01em; text-transform:uppercase; color:var(--white); }
.tk-panel-heading span { color:var(--gold); }

.tk-carousel-section { padding:32px 48px 0; border-bottom:1px solid var(--gold-bdr); }
.tk-carousel-label { font-family:'Anton',sans-serif; font-size:9px; letter-spacing:0.3em; text-transform:uppercase; color:rgba(198,168,107,0.6); margin-bottom:12px; display:flex; align-items:center; gap:10px; }
.tk-carousel-label::before { content:''; display:block; width:12px; height:1px; background:var(--gold-dim); }
.tk-swipe-arrows { display:flex; gap:8px; justify-content:flex-end; margin-bottom:16px; }
.tk-arrow-btn { width:34px; height:34px; border:1px solid rgba(198,168,107,0.25); background:transparent; color:rgba(255,255,255,0.4); display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:14px; transition:all 0.2s; border-radius:50%; }
.tk-arrow-btn:hover:not(:disabled) { border-color:var(--gold); color:var(--gold); background:var(--gold-bg); }
.tk-arrow-btn:disabled { opacity:0.18; cursor:not-allowed; }
.tk-swipe-viewport { overflow:hidden; position:relative; margin:0 -48px; padding:0 48px; }
.tk-swipe-track { display:flex; gap:20px; transition:transform 0.45s cubic-bezier(0.22,1,0.36,1); will-change:transform; }

.tk-ticket-card { flex-shrink:0; width:100%; background:var(--surface); border:1px solid rgba(255,255,255,0.07); position:relative; overflow:hidden; }
.tk-ticket-card::before { content:''; position:absolute; top:0; left:0; right:0; height:2px; background:linear-gradient(90deg,transparent,var(--gold),transparent); }
.tk-ticket-top { padding:22px 28px 18px; }
.tk-ticket-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:20px; }
.tk-ticket-mode { display:flex; align-items:center; gap:10px; }
.tk-ticket-mode-icon { font-size:20px; }
.tk-ticket-mode-label { font-family:'Anton',sans-serif; font-size:9px; letter-spacing:0.26em; text-transform:uppercase; color:rgba(255,255,255,0.25); }
.tk-ticket-ref { font-family:'Anton',sans-serif; font-size:10px; letter-spacing:0.14em; text-transform:uppercase; color:rgba(198,168,107,0.45); }
.tk-route-display { display:flex; align-items:center; gap:16px; margin-bottom:20px; }
.tk-route-point { display:flex; flex-direction:column; gap:3px; }
.tk-route-city { font-family:'Anton',sans-serif; font-size:clamp(18px,2.2vw,26px); letter-spacing:0.04em; text-transform:uppercase; color:var(--pearl); line-height:1; }
.tk-route-time { font-family:'EB Garamond',serif; font-size:13px; color:rgba(255,255,255,0.3); }
.tk-route-arrow { color:rgba(198,168,107,0.35); font-size:20px; flex:1; text-align:center; }
.tk-ticket-meta { display:grid; grid-template-columns:repeat(4,1fr); border-top:1px solid rgba(255,255,255,0.05); }
.tk-meta-cell { padding:13px 0; border-right:1px solid rgba(255,255,255,0.05); }
.tk-meta-cell:last-child { border-right:none; }
.tk-meta-key { font-family:'Anton',sans-serif; font-size:8px; letter-spacing:0.24em; text-transform:uppercase; color:rgba(255,255,255,0.2); margin-bottom:5px; }
.tk-meta-val { font-family:'EB Garamond',serif; font-size:15px; color:rgba(255,255,255,0.65); }
.tk-meta-val.gold { font-family:'Anton',sans-serif; font-size:16px; letter-spacing:0.06em; color:var(--gold); }
.tk-tear-row { display:flex; align-items:center; border-top:1px dashed rgba(255,255,255,0.09); position:relative; margin:0 -1px; }
.tk-tear-hole { width:18px; height:18px; background:var(--black); border-radius:50%; flex-shrink:0; margin:-9px 0; }
.tk-tear-hole.left { margin-left:-9px; }
.tk-tear-hole.right { margin-right:-9px; margin-left:auto; }
.tk-ticket-bottom { padding:18px 28px 22px; display:flex; align-items:center; gap:24px; }
.tk-qr-box { width:78px; height:78px; background:#fff; display:flex; align-items:center; justify-content:center; flex-shrink:0; cursor:pointer; position:relative; overflow:hidden; transition:transform 0.2s; }
.tk-qr-box:hover { transform:scale(1.04); }
.tk-qr-box:hover .tk-qr-overlay { opacity:1; }
.tk-qr-overlay { position:absolute; inset:0; background:rgba(198,168,107,0.88); display:flex; align-items:center; justify-content:center; font-size:18px; opacity:0; transition:opacity 0.2s; }
.tk-qr-svg { width:66px; height:66px; }
.tk-ticket-actions-col { display:flex; flex-direction:column; gap:10px; flex:1; }
.tk-live-pill { display:inline-flex; align-items:center; gap:8px; border:1px solid var(--gold-dim); background:var(--gold-bg); padding:5px 13px; width:fit-content; }
.tk-live-pip { width:6px; height:6px; border-radius:50%; background:var(--gold); box-shadow:0 0 7px rgba(198,168,107,0.7); animation:tk-goldpulse 2s ease infinite; }
@keyframes tk-goldpulse { 0%,100%{opacity:1;} 50%{opacity:0.3;} }
.tk-live-txt { font-family:'Anton',sans-serif; font-size:9px; letter-spacing:0.2em; text-transform:uppercase; color:var(--gold); }
.tk-ticket-price-row { display:flex; align-items:baseline; gap:6px; }
.tk-ticket-price { font-family:'Anton',sans-serif; font-size:28px; letter-spacing:0.04em; color:var(--gold); }
.tk-ticket-price-label { font-family:'EB Garamond',serif; font-size:13px; color:rgba(255,255,255,0.25); }
.tk-action-btns { display:flex; gap:8px; }
.tk-action-btn { font-family:'Anton',sans-serif; font-size:9px; letter-spacing:0.18em; text-transform:uppercase; padding:7px 14px; border:1px solid rgba(255,255,255,0.1); background:transparent; color:rgba(255,255,255,0.3); cursor:pointer; transition:all 0.2s; }
.tk-action-btn:hover { border-color:var(--gold-dim); color:var(--gold); }
.tk-swipe-dots { display:flex; justify-content:center; align-items:center; gap:8px; padding:18px 0 28px; }
.tk-dot { width:6px; height:6px; border-radius:50%; background:rgba(255,255,255,0.12); cursor:pointer; transition:all 0.3s; border:none; }
.tk-dot.active { background:var(--gold); box-shadow:0 0 6px rgba(198,168,107,0.5); width:22px; border-radius:3px; }

.tk-book-section { padding:28px 48px; border-bottom:1px solid var(--gold-bdr); }
.tk-field-label { font-family:'Anton',sans-serif; font-size:10px; letter-spacing:0.3em; text-transform:uppercase; color:rgba(198,168,107,0.65); margin-bottom:12px; display:flex; align-items:center; gap:8px; }
.tk-field-label::before { content:''; display:block; width:12px; height:1px; background:var(--gold-dim); }
.tk-loc-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px; }
.tk-route-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px; }
.tk-time-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:18px; }
.tk-select,.tk-date-input,.tk-time-input { appearance:none; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); color:var(--white); font-family:'Anton',sans-serif; font-size:13px; letter-spacing:0.06em; text-transform:uppercase; padding:14px 16px; width:100%; outline:none; cursor:pointer; transition:border-color 0.25s,background 0.25s; }
.tk-select option { background:#111; color:#fff; text-transform:none; font-size:13px; }
.tk-select:focus,.tk-date-input:focus,.tk-time-input:focus { border-color:var(--gold); background:var(--gold-bg); }
.tk-date-input,.tk-time-input { text-transform:none; letter-spacing:0.04em; color-scheme:dark; }
.tk-fare-estimate { display:grid; grid-template-columns:1fr 1px 1fr 1px 1fr; border:1px solid var(--gold-bdr); padding:18px 0; align-items:center; margin-bottom:18px; }
.tk-fare-sep { background:var(--gold-bdr); height:34px; }
.tk-fare-item { display:flex; flex-direction:column; align-items:center; gap:5px; }
.tk-fare-num { font-family:'Anton',sans-serif; font-size:26px; letter-spacing:0.02em; color:rgba(255,255,255,0.18); transition:color 0.3s; }
.tk-fare-num.lit { color:var(--gold); }
.tk-fare-key { font-family:'Anton',sans-serif; font-size:8px; letter-spacing:0.22em; text-transform:uppercase; color:var(--muted); }
.tk-book-btn { width:100%; background:var(--gold); color:var(--black); border:none; padding:18px; font-family:'Anton',sans-serif; font-size:15px; letter-spacing:0.18em; text-transform:uppercase; cursor:pointer; transition:background 0.25s,transform 0.15s; display:flex; align-items:center; justify-content:center; gap:10px; }
.tk-book-btn:hover { background:var(--pearl); transform:translateY(-1px); }

.tk-right-panel { display:flex; flex-direction:column; background:var(--black); overflow-y:auto; }
.tk-right-panel::-webkit-scrollbar { width:2px; }
.tk-right-panel::-webkit-scrollbar-thumb { background:var(--gold-dim); }
.tk-stats-row { display:grid; grid-template-columns:1fr 1fr 1fr; border-bottom:1px solid var(--gold-bdr); }
.tk-stat-block { padding:36px 32px 30px; border-right:1px solid var(--gold-bdr); transition:background 0.25s; }
.tk-stat-block:last-child { border-right:none; }
.tk-stat-block:hover { background:var(--gold-bg); }
.tk-stat-eyebrow { font-family:'Anton',sans-serif; font-size:9px; letter-spacing:0.28em; text-transform:uppercase; color:rgba(198,168,107,0.5); margin-bottom:10px; }
.tk-stat-num { font-family:'Anton',sans-serif; font-size:44px; letter-spacing:0.02em; color:var(--pearl); line-height:1; }
.tk-stat-num span { color:var(--gold); }
.tk-stat-sub { font-family:'EB Garamond',serif; font-size:14px; color:rgba(255,255,255,0.25); margin-top:6px; }
.tk-stat-live { font-family:'Anton',sans-serif; font-size:22px; color:var(--gold); line-height:1.1; }
.tk-right-section { padding:32px 36px; border-bottom:1px solid rgba(255,255,255,0.05); }
.tk-section-eyebrow { font-family:'Anton',sans-serif; font-size:9px; letter-spacing:0.3em; text-transform:uppercase; color:rgba(198,168,107,0.5); margin-bottom:6px; display:flex; align-items:center; gap:10px; }
.tk-section-eyebrow::before { content:''; display:block; width:14px; height:1px; background:var(--gold-dim); }
.tk-section-heading { font-family:'Anton',sans-serif; font-size:clamp(18px,2vw,26px); letter-spacing:0.04em; text-transform:uppercase; color:var(--pearl); margin-bottom:22px; }
.tk-week-chart { display:flex; align-items:flex-end; gap:5px; height:80px; }
.tk-bar-col { flex:1; display:flex; flex-direction:column; align-items:center; gap:4px; }
.tk-bar { width:100%; }
.tk-bar-label { font-family:'Anton',sans-serif; font-size:8px; letter-spacing:0.1em; }
.tk-history-list { display:flex; flex-direction:column; border:1px solid rgba(255,255,255,0.06); }
.tk-history-row { display:flex; align-items:center; gap:18px; padding:15px 20px; border-bottom:1px solid rgba(255,255,255,0.04); transition:background 0.2s; }
.tk-history-row:last-child { border-bottom:none; }
.tk-history-row:hover { background:var(--gold-bg); }
.tk-hr-icon { font-size:15px; flex-shrink:0; }
.tk-hr-route { font-family:'Anton',sans-serif; font-size:13px; letter-spacing:0.06em; text-transform:uppercase; color:rgba(255,255,255,0.55); }
.tk-hr-meta { font-family:'EB Garamond',serif; font-size:13px; color:rgba(255,255,255,0.25); margin-top:2px; }
.tk-hr-right { margin-left:auto; text-align:right; }
.tk-hr-price { font-family:'Anton',sans-serif; font-size:16px; letter-spacing:0.04em; color:var(--gold); }
.tk-hr-date { font-family:'EB Garamond',serif; font-size:12px; color:rgba(255,255,255,0.2); margin-top:2px; }
.tk-shimmer-line { position:fixed; bottom:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,var(--gold),transparent); animation:tk-shimmer 3s ease infinite; z-index:999; pointer-events:none; }
@keyframes tk-shimmer { 0%,100%{opacity:0.25;transform:scaleX(0.4);}50%{opacity:0.8;transform:scaleX(1);} }

/* Tickets modal */
.tk-modal-back { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.9); backdrop-filter:blur(12px); z-index:2000; align-items:center; justify-content:center; }
.tk-modal-back.open { display:flex; }
.tk-modal-box { background:var(--black); border:1px solid var(--gold-bdr); padding:40px 44px; width:420px; max-width:96vw; position:relative; animation:tk-modalIn 0.35s cubic-bezier(0.22,1,0.36,1); }
@keyframes tk-modalIn { from{opacity:0;transform:scale(0.94) translateY(16px);}to{opacity:1;transform:scale(1) translateY(0);} }
.tk-modal-close-btn { position:absolute; top:14px; right:18px; background:none; border:none; color:var(--muted); font-family:'Anton',sans-serif; font-size:10px; letter-spacing:0.18em; text-transform:uppercase; cursor:pointer; transition:color 0.2s; }
.tk-modal-close-btn:hover { color:#fff; }
.tk-modal-eyebrow { font-family:'Anton',sans-serif; font-size:9px; letter-spacing:0.3em; text-transform:uppercase; color:rgba(198,168,107,0.55); margin-bottom:8px; display:flex; align-items:center; gap:8px; }
.tk-modal-eyebrow::before { content:''; display:block; width:12px; height:1px; background:var(--gold-dim); }
.tk-modal-title { font-family:'Anton',sans-serif; font-size:22px; letter-spacing:0.05em; text-transform:uppercase; margin-bottom:16px; }
.tk-modal-ref { font-family:'Anton',sans-serif; font-size:18px; letter-spacing:0.18em; color:var(--gold); border:1px solid var(--gold-bdr); padding:10px; text-align:center; margin-bottom:18px; }
.tk-modal-qr-wrap { width:160px; height:160px; background:#fff; margin:0 auto 16px; display:flex; align-items:center; justify-content:center; border:1px solid var(--gold-bdr); padding:10px; }
.tk-modal-route-lbl { font-family:'EB Garamond',serif; font-size:14px; color:rgba(255,255,255,0.35); text-align:center; margin-bottom:20px; }
.tk-modal-done { width:100%; background:var(--gold); color:var(--black); border:none; padding:15px; font-family:'Anton',sans-serif; font-size:14px; letter-spacing:0.18em; text-transform:uppercase; cursor:pointer; transition:background 0.2s; }
.tk-modal-done:hover { background:var(--pearl); }
.tk-fadein { opacity:0; transform:translateY(14px); animation:tk-fadeup 0.5s ease both; }
@keyframes tk-fadeup { to{opacity:1;transform:translateY(0);} }

/* ═══════════════════════════════════════════════════════════════
   TRANSPORT PAGE
   ═══════════════════════════════════════════════════════════════ */
.pt-layout { display:grid; grid-template-columns:520px 1fr; height:calc(100vh - 68px); padding-top:68px; }
.pt-panel { background:var(--black); border-right:1px solid var(--gold-bdr); display:flex; flex-direction:column; overflow-y:auto; overflow-x:hidden; }
.pt-panel::-webkit-scrollbar { width:2px; }
.pt-panel::-webkit-scrollbar-thumb { background:var(--gold-dim); }
.pt-panel-hero { padding:40px 44px 32px; border-bottom:1px solid var(--gold-bdr); }
.pt-panel-heading { font-family:'Anton',sans-serif; font-size:clamp(30px,4vw,52px); line-height:0.94; letter-spacing:0.01em; text-transform:uppercase; color:var(--white); }
.pt-panel-heading span { color:var(--gold); }
.pt-panel-section { padding:28px 44px; border-bottom:1px solid var(--gold-bdr); }
.pt-field-label { font-family:'Anton',sans-serif; font-size:10px; letter-spacing:0.3em; text-transform:uppercase; color:rgba(198,168,107,0.65); margin-bottom:10px; display:flex; align-items:center; gap:8px; }
.pt-field-label::before { content:''; display:block; width:12px; height:1px; background:var(--gold-dim); }
.pt-select,.pt-custom-input { appearance:none; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.12); color:var(--white); font-family:'Anton',sans-serif; font-size:14px; letter-spacing:0.06em; text-transform:uppercase; padding:15px 18px; width:100%; outline:none; cursor:pointer; transition:border-color 0.25s,background 0.25s; }
.pt-select option { background:#111; color:#fff; }
.pt-select:focus,.pt-custom-input:focus { border-color:var(--gold); background:rgba(198,168,107,0.06); }
.pt-custom-input::placeholder { color:rgba(255,255,255,0.3); font-family:'Anton',sans-serif; text-transform:uppercase; letter-spacing:0.06em; }
.pt-back-link { font-size:10px; letter-spacing:0.2em; text-transform:uppercase; color:rgba(198,168,107,0.5); cursor:pointer; margin-top:7px; text-align:right; transition:color 0.2s; display:block; background:none; border:none; font-family:'Anton',sans-serif; }
.pt-back-link:hover { color:var(--gold); }
.pt-loc-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
.pt-loc-col { display:flex; flex-direction:column; gap:0; }
.pt-ride-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-top:4px; }
.pt-ride-tile { border:1px solid rgba(255,255,255,0.1); padding:18px 12px; cursor:pointer; text-align:left; transition:border-color 0.25s,background 0.25s; position:relative; overflow:hidden; background:none; }
.pt-ride-tile::before { content:''; position:absolute; top:0; left:0; right:0; height:0; background:var(--gold); transition:height 0.25s; }
.pt-ride-tile:hover::before,.pt-ride-tile.sel::before { height:2px; }
.pt-ride-tile:hover,.pt-ride-tile.sel { border-color:var(--gold); background:var(--gold-bg); }
.pt-rt-emoji { font-size:26px; display:block; margin-bottom:10px; }
.pt-rt-name { font-family:'Anton',sans-serif; font-size:13px; letter-spacing:0.12em; text-transform:uppercase; display:block; margin-bottom:4px; color:var(--white); }
.pt-rt-rate { font-family:'EB Garamond',serif; font-size:13px; color:var(--muted); display:block; }
.pt-fare-box { display:grid; grid-template-columns:1fr 1px 1fr 1px 1fr; border:1px solid var(--gold-bdr); padding:20px 0; align-items:center; margin-top:4px; }
.pt-fare-divider { background:var(--gold-bdr); height:40px; }
.pt-fare-item { display:flex; flex-direction:column; align-items:center; gap:5px; }
.pt-fare-val { font-family:'Anton',sans-serif; font-size:26px; letter-spacing:0.02em; color:var(--white); transition:color 0.3s; }
.pt-fare-val.lit { color:var(--gold); }
.pt-fare-val.muted { color:rgba(255,255,255,0.18); }
.pt-fare-key { font-family:'Anton',sans-serif; font-size:9px; letter-spacing:0.22em; text-transform:uppercase; color:var(--muted); }
.pt-drivers-list { display:flex; flex-direction:column; gap:10px; margin-top:4px; }
.pt-driver-card { border:1px solid rgba(255,255,255,0.07); padding:14px 16px; display:flex; align-items:center; gap:14px; transition:border-color 0.25s,background 0.25s; }
.pt-driver-card:hover { border-color:var(--gold-bdr); background:var(--gold-bg); }
.pt-driver-emoji { font-size:22px; flex-shrink:0; }
.pt-driver-info { flex:1; }
.pt-driver-name { font-family:'Anton',sans-serif; font-size:13px; letter-spacing:0.06em; text-transform:uppercase; }
.pt-driver-meta { font-family:'EB Garamond',serif; font-size:13px; color:var(--muted); margin-top:2px; }
.pt-driver-eta { font-family:'Anton',sans-serif; font-size:11px; letter-spacing:0.12em; text-transform:uppercase; color:var(--gold); border:1px solid var(--gold-dim); padding:4px 10px; flex-shrink:0; }
.pt-book-btn { width:100%; background:var(--gold); color:var(--black); border:none; padding:20px; font-family:'Anton',sans-serif; font-size:20px; letter-spacing:0.16em; text-transform:uppercase; cursor:pointer; transition:background 0.25s,transform 0.15s; display:flex; align-items:center; justify-content:center; gap:12px; }
.pt-book-btn:hover { background:var(--white); transform:translateY(-1px); }

.pt-map-wrap { position:relative; overflow:hidden; }
.pt-map-wrap::after { content:''; position:absolute; bottom:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,var(--gold),transparent); animation:pt-shimmer 3s ease infinite; z-index:400; }
@keyframes pt-shimmer { 0%,100%{opacity:0.3;transform:scaleX(0.4);}50%{opacity:1;transform:scaleX(1);} }
#pt-map { width:100%; height:100%; }
.pt-map-badge { position:absolute; top:18px; left:18px; z-index:500; background:rgba(8,8,8,0.92); backdrop-filter:blur(16px); border:1px solid var(--gold-bdr); padding:16px 20px; transition:opacity 0.4s; opacity:0; pointer-events:none; }
.pt-map-badge.show { opacity:1; }
.pt-mb-eyebrow { font-family:'Anton',sans-serif; font-size:9px; letter-spacing:0.3em; text-transform:uppercase; color:rgba(198,168,107,0.6); margin-bottom:6px; display:flex; align-items:center; gap:6px; }
.pt-mb-eyebrow::before { content:''; display:block; width:10px; height:1px; background:var(--gold-dim); }
.pt-mb-route { font-family:'Anton',sans-serif; font-size:15px; letter-spacing:0.04em; text-transform:uppercase; margin-bottom:3px; }
.pt-mb-meta { font-family:'EB Garamond',serif; font-size:14px; color:var(--muted); }

/* Leaflet overrides */
.leaflet-popup-content-wrapper { background:rgba(8,8,8,0.97)!important; border:1px solid var(--gold-bdr)!important; border-radius:0!important; box-shadow:none!important; color:var(--white)!important; }
.leaflet-popup-tip { background:rgba(8,8,8,0.97)!important; }
.leaflet-popup-close-button { color:var(--gold)!important; font-size:16px!important; top:10px!important; right:10px!important; }
.leaflet-popup-content { margin:16px 18px!important; }
.pt-popup-inner { font-family:'Anton',sans-serif; text-transform:uppercase; letter-spacing:0.06em; color:var(--white); min-width:200px; }
.pt-pop-emoji { font-size:28px; display:block; text-align:center; margin-bottom:10px; }
.pt-pop-driver { font-size:18px; display:block; text-align:center; color:var(--gold); margin-bottom:6px; }
.pt-pop-eyebrow { font-size:9px; letter-spacing:0.26em; color:rgba(198,168,107,0.5); display:block; text-align:center; margin-bottom:12px; }
.pt-pop-route { font-family:'EB Garamond',serif; font-size:15px; display:block; text-align:center; line-height:1.7; color:var(--muted); margin-bottom:12px; }
.pt-pop-divider { height:1px; background:var(--gold-dim); margin-bottom:12px; }
.pt-pop-fare { font-size:32px; display:block; text-align:center; color:var(--gold); }
.pt-pop-sub { font-size:10px; letter-spacing:0.18em; display:block; text-align:center; color:var(--muted); margin-top:3px; }

/* Transport modal */
.pt-modal-back { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.88); backdrop-filter:blur(10px); z-index:2000; align-items:center; justify-content:center; }
.pt-modal-back.open { display:flex; }
.pt-modal { background:var(--black); border:1px solid var(--gold-bdr); padding:40px 44px; width:460px; max-width:95vw; position:relative; animation:tk-modalIn 0.35s cubic-bezier(0.22,1,0.36,1); }
.pt-modal-close { position:absolute; top:14px; right:18px; background:none; border:none; color:var(--muted); font-family:'Anton',sans-serif; font-size:11px; letter-spacing:0.14em; text-transform:uppercase; cursor:pointer; transition:color 0.2s; }
.pt-modal-close:hover { color:var(--white); }
.pt-modal-eyebrow { font-family:'Anton',sans-serif; font-size:10px; letter-spacing:0.3em; text-transform:uppercase; color:rgba(198,168,107,0.6); margin-bottom:6px; display:flex; align-items:center; gap:8px; }
.pt-modal-eyebrow::before { content:''; display:block; width:12px; height:1px; background:var(--gold-dim); }
.pt-modal-h2 { font-family:'Anton',sans-serif; font-size:24px; letter-spacing:0.04em; text-transform:uppercase; margin-bottom:20px; }
.pt-qr-ref { font-family:'Anton',sans-serif; font-size:22px; letter-spacing:0.2em; color:var(--gold); border:1px solid var(--gold-bdr); padding:12px; text-align:center; margin-bottom:18px; }
.pt-qr-wrap { width:150px; height:150px; margin:0 auto 18px; border:1px solid var(--gold-bdr); padding:8px; display:flex; align-items:center; justify-content:center; }
.pt-ticket-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:18px; }
.pt-tc { border:1px solid rgba(255,255,255,0.07); padding:10px 12px; }
.pt-tc-key { font-family:'Anton',sans-serif; font-size:9px; letter-spacing:0.2em; text-transform:uppercase; color:var(--muted); margin-bottom:4px; }
.pt-tc-val { font-family:'Anton',sans-serif; font-size:13px; letter-spacing:0.06em; text-transform:uppercase; color:var(--white); }
.pt-tc-val.gold { color:var(--gold); }
.pt-btn-full { width:100%; background:var(--gold); color:var(--black); border:none; padding:14px; font-family:'Anton',sans-serif; font-size:14px; letter-spacing:0.16em; text-transform:uppercase; cursor:pointer; transition:background 0.2s; }
.pt-btn-full:hover { background:var(--white); }

/* ── RESPONSIVE ──────────────────────────────────────────────── */
@media (max-width: 960px) {
  .nt-nav { padding: 16px 24px; }
  .nt-nav.scrolled { padding: 12px 24px; }
  .nt-nav-links { gap: 16px; }
  .nt-nav-links button { font-size: 11px; }
  .nt-hero-content { padding: 0 24px 60px; }
  .nt-quick-access { padding: 0 24px; }
  .nt-quick-grid { grid-template-columns: 1fr 1fr; }
  .nt-about { padding: 60px 24px; grid-template-columns: 1fr; gap: 20px; }
  .nt-about-label { position: static; }
  .nt-features { padding: 20px 24px; gap: 32px; }
  .nt-footer { padding: 48px 24px 32px; }
  .nt-footer-inner { grid-template-columns: 1fr 1fr; gap: 32px 40px; }
  .nt-footer-bottom { grid-template-columns: 1fr; gap: 12px; }
  .nt-footer-bottom-right { text-align: left; }
  .tk-layout { grid-template-columns: 1fr; }
  .tk-panel-hero, .tk-carousel-section, .tk-book-section { padding-left: 22px; padding-right: 22px; }
  .tk-swipe-viewport { margin: 0 -22px; padding: 0 22px; }
  .tk-stats-row { grid-template-columns: 1fr 1fr; }
  .pt-layout { grid-template-columns: 1fr; height: auto; }
  .pt-map-wrap { height: 60vw; min-height: 280px; }
  .pt-loc-row { grid-template-columns: 1fr; }
  .pt-panel-hero, .pt-panel-section { padding: 24px 24px; }
}
`;

// ═══════════════════════════════════════════════════════════════════════════════
// STYLE INJECTOR (single, shared)
// ═══════════════════════════════════════════════════════════════════════════════
function StyleInjector() {
  useEffect(() => {
    const id = "nt-all-styles";
    if (!document.getElementById(id)) {
      // Leaflet CSS
      const lk = document.createElement("link");
      lk.id = "leaflet-css"; lk.rel = "stylesheet";
      lk.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
      document.head.appendChild(lk);
      // App styles
      const tag = document.createElement("style");
      tag.id = id; tag.textContent = ALL_CSS;
      document.head.appendChild(tag);
    }
    return () => {
      ["nt-all-styles", "leaflet-css"].forEach(i => document.getElementById(i)?.remove());
    };
  }, []);
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED NAVBAR
// ═══════════════════════════════════════════════════════════════════════════════
function Navbar({ activePage, setPage }) {
  const [scrolled, setScrolled] = useState(false);
  const isHome = activePage === "home";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Always dark on non-home pages; transparent→dark on home
  const isDark = !isHome || scrolled;

  const navItems = [
    { id: "home",      label: "Home"      },
    { id: "transport", label: "Your Ride" },
    { id: "explore",   label: "Explore"   },
    { id: "tickets",   label: "Tickets"   },
  ];

  return (
    <nav className={`nt-nav${isDark ? " scrolled" : ""}`}>
      <button className="nt-nav-logo" onClick={() => setPage("home")}>
        <span className="nt-nav-logo-dot" />
        NAMMA <span>TRICHY</span>
      </button>
      <div className="nt-nav-links">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={activePage === item.id ? "active" : ""}
            onClick={() => setPage(item.id)}
          >
            {item.label}
          </button>
        ))}
        <button className="nt-nav-cta" onClick={() => setPage("tickets")}>
          Book Now
        </button>
      </div>
    </nav>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// HOME PAGE COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════
function Hero({ setPage }) {
  return (
    <section className="nt-hero">
      <div className="nt-hero-pattern" />
      <div className="nt-hero-glow" />
      <div className="nt-hero-content">
        <div className="nt-hero-eyebrow">
          <div className="nt-hero-eyebrow-line" />
          <span className="nt-hero-eyebrow-text">Tamil Nadu, India</span>
        </div>
        <div className="nt-hero-title">
          <span className="nt-hero-line nt-hero-line-1">Welcome to</span>
          <span className="nt-hero-line nt-hero-line-2">Tiruchirappalli</span>
        </div>
        <div className="nt-hero-ctas">
          <button className="nt-btn-primary" onClick={() => setPage("tickets")}>Book Now</button>
          <button className="nt-btn-secondary" onClick={() => setPage("explore")}>Explore City</button>
        </div>
      </div>
    </section>
  );
}

function QuickAccess({ setPage }) {
  const tiles = [
    { label: "Transport", title: "Private Transport", desc: "Bike, Auto, Cab — all in one platform.", page: "transport" },
    { label: "Discover",  title: "Explore City",      desc: "Temples, rivers, culture — iconic destinations.", page: "explore" },
    { label: "Book",      title: "My Tickets",        desc: "QR-based ticketing. Book bus tickets instantly.", page: "tickets" },
    { label: "Live",      title: "Live Status",       desc: "Real-time tracking of bus from station to station.", page: "tickets" },
  ];
  return (
    <div className="nt-quick-access">
      <div className="nt-quick-grid">
        {tiles.map((t) => (
          <button key={t.title} className="nt-quick-tile" onClick={() => setPage(t.page)}>
            <span className="nt-quick-tile-label">{t.label}</span>
            <span className="nt-quick-tile-title">{t.title}</span>
            <span className="nt-quick-tile-desc">{t.desc}</span>
            <span className="nt-quick-tile-arrow">Go →</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function About() {
  return (
    <div className="nt-about">
      <div className="nt-about-label">Our City</div>
      <div className="nt-about-right">
        <h2>Welcome to My Home:<br />The Heart of Tamil Nadu</h2>
        <p>
          If you ask any of us, we don't just live in Tiruchirappalli — we live in Trichy, a city that
          feels like a warm embrace. While the rest of the world rushes by, we find our rhythm on the
          banks of Kaveri, where the air always carries a hint of jasmine and history. Trichy isn't a
          place you just pass through on a highway. It's the steady pulse of the south, a place that
          remembers its past but keeps its doors open for everyone.{" "}
          <strong>It's HOME.</strong>
        </p>
      </div>
    </div>
  );
}

function FeaturesBar() {
  const items = ["QR Ticketing", "Live Bus Tracking", "Private Cab Booking", "City Exploration Guide", "Emergency Contacts"];
  return (
    <div className="nt-features">
      {items.map((f) => (
        <div className="nt-feature-item" key={f}>
          <div className="nt-feature-dot" />
          <span className="nt-feature-text">{f}</span>
        </div>
      ))}
    </div>
  );
}

function Footer() {
  return (
    <footer className="nt-footer">
      <div className="nt-footer-inner">
        <div className="nt-footer-col">
          <h3>Emergency Hotlines</h3>
          <ul>
            <li>All-in-One Emergency: 112</li>
            <li>Women's Helpline: 1091</li>
          </ul>
        </div>
        <div className="nt-footer-col">
          <h3>Helpful Links</h3>
          <ul>
            <li>Official District: <a href="https://tiruchirappalli.nic.in" target="_blank" rel="noreferrer">tiruchirappalli.nic.in</a></li>
            <li>City Corporation: <a href="https://trichycorporation.gov.in" target="_blank" rel="noreferrer">trichycorporation.gov.in</a></li>
          </ul>
        </div>
        <div className="nt-footer-col">
          <h3>Transport Hubs</h3>
          <ul>
            <li>Trichy Junction</li>
            <li>Central Bus Stand</li>
          </ul>
        </div>
      </div>
      <div className="nt-footer-bottom">
        <span className="nt-footer-bottom-left">© Namma Trichy</span>
        <div className="nt-footer-logo">NAMMA <span>TRICHY</span></div>
        <span className="nt-footer-bottom-right">Made with ♥ for Trichy</span>
      </div>
    </footer>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPLORE PAGE (placeholder)
// ═══════════════════════════════════════════════════════════════════════════════
function ExplorePage() {
  return (
    <div className="nt-page">
      <span className="nt-page-tag">Discover</span>
      <h1 className="nt-page-title">Explore Trichy</h1>
      <p className="nt-page-subtitle">From Rock Fort to the banks of Kaveri — discover every corner of the city.</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TICKETS PAGE COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════
const QR_SVGS = [
  <svg key="q1" className="tk-qr-svg" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg"><rect width="21" height="21" fill="white"/><rect x="1" y="1" width="7" height="7" fill="#111"/><rect x="2" y="2" width="5" height="5" fill="white"/><rect x="3" y="3" width="3" height="3" fill="#111"/><rect x="13" y="1" width="7" height="7" fill="#111"/><rect x="14" y="2" width="5" height="5" fill="white"/><rect x="15" y="3" width="3" height="3" fill="#111"/><rect x="1" y="13" width="7" height="7" fill="#111"/><rect x="2" y="14" width="5" height="5" fill="white"/><rect x="3" y="15" width="3" height="3" fill="#111"/><rect x="9" y="1" width="1" height="1" fill="#111"/><rect x="11" y="2" width="1" height="2" fill="#111"/><rect x="9" y="4" width="2" height="1" fill="#111"/><rect x="9" y="6" width="1" height="1" fill="#111"/><rect x="2" y="9" width="2" height="1" fill="#111"/><rect x="5" y="9" width="1" height="3" fill="#111"/><rect x="9" y="9" width="3" height="1" fill="#111"/><rect x="13" y="9" width="1" height="2" fill="#111"/><rect x="15" y="9" width="2" height="1" fill="#111"/><rect x="18" y="9" width="2" height="2" fill="#111"/><rect x="9" y="11" width="1" height="4" fill="#111"/><rect x="11" y="12" width="2" height="1" fill="#111"/><rect x="13" y="13" width="3" height="1" fill="#111"/><rect x="17" y="13" width="2" height="2" fill="#111"/><rect x="13" y="16" width="1" height="3" fill="#111"/><rect x="15" y="17" width="3" height="1" fill="#111"/></svg>,
  <svg key="q2" className="tk-qr-svg" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg"><rect width="21" height="21" fill="white"/><rect x="1" y="1" width="7" height="7" fill="#111"/><rect x="2" y="2" width="5" height="5" fill="white"/><rect x="3" y="3" width="3" height="3" fill="#111"/><rect x="13" y="1" width="7" height="7" fill="#111"/><rect x="14" y="2" width="5" height="5" fill="white"/><rect x="15" y="3" width="3" height="3" fill="#111"/><rect x="1" y="13" width="7" height="7" fill="#111"/><rect x="2" y="14" width="5" height="5" fill="white"/><rect x="3" y="15" width="3" height="3" fill="#111"/><rect x="10" y="1" width="1" height="2" fill="#111"/><rect x="9" y="4" width="3" height="1" fill="#111"/><rect x="9" y="6" width="2" height="2" fill="#111"/><rect x="2" y="9" width="2" height="1" fill="#111"/><rect x="5" y="9" width="1" height="3" fill="#111"/><rect x="7" y="10" width="2" height="1" fill="#111"/><rect x="10" y="9" width="2" height="2" fill="#111"/><rect x="13" y="10" width="2" height="1" fill="#111"/><rect x="16" y="9" width="1" height="1" fill="#111"/><rect x="18" y="9" width="2" height="3" fill="#111"/><rect x="10" y="12" width="3" height="1" fill="#111"/><rect x="14" y="12" width="1" height="4" fill="#111"/><rect x="16" y="13" width="2" height="1" fill="#111"/><rect x="10" y="14" width="2" height="3" fill="#111"/><rect x="13" y="17" width="3" height="2" fill="#111"/><rect x="17" y="16" width="2" height="3" fill="#111"/></svg>,
  <svg key="q3" className="tk-qr-svg" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg"><rect width="21" height="21" fill="white"/><rect x="1" y="1" width="7" height="7" fill="#111"/><rect x="2" y="2" width="5" height="5" fill="white"/><rect x="3" y="3" width="3" height="3" fill="#111"/><rect x="13" y="1" width="7" height="7" fill="#111"/><rect x="14" y="2" width="5" height="5" fill="white"/><rect x="15" y="3" width="3" height="3" fill="#111"/><rect x="1" y="13" width="7" height="7" fill="#111"/><rect x="2" y="14" width="5" height="5" fill="white"/><rect x="3" y="15" width="3" height="3" fill="#111"/><rect x="9" y="2" width="2" height="1" fill="#111"/><rect x="11" y="1" width="1" height="3" fill="#111"/><rect x="9" y="5" width="3" height="2" fill="#111"/><rect x="1" y="9" width="3" height="1" fill="#111"/><rect x="5" y="10" width="2" height="2" fill="#111"/><rect x="9" y="9" width="2" height="2" fill="#111"/><rect x="12" y="9" width="1" height="1" fill="#111"/><rect x="14" y="9" width="2" height="1" fill="#111"/><rect x="17" y="10" width="3" height="2" fill="#111"/><rect x="9" y="12" width="3" height="2" fill="#111"/><rect x="13" y="12" width="2" height="2" fill="#111"/><rect x="16" y="13" width="4" height="1" fill="#111"/><rect x="9" y="15" width="1" height="4" fill="#111"/><rect x="11" y="16" width="3" height="1" fill="#111"/><rect x="15" y="15" width="1" height="4" fill="#111"/><rect x="17" y="16" width="3" height="1" fill="#111"/></svg>,
];

function TicketCard({ ticket, idx, liveText, onQRClick }) {
  return (
    <div className="tk-ticket-card">
      <div className="tk-ticket-top">
        <div className="tk-ticket-header">
          <div className="tk-ticket-mode">
            <span className="tk-ticket-mode-icon">🚌</span>
            <span className="tk-ticket-mode-label">City Bus</span>
          </div>
          <span className="tk-ticket-ref">#{ticket.ref}</span>
        </div>
        <div className="tk-route-display">
          <div className="tk-route-point">
            <div className="tk-route-city">{ticket.from}</div>
            <div className="tk-route-time">{ticket.fromTime}</div>
          </div>
          <div className="tk-route-arrow">→</div>
          <div className="tk-route-point" style={{ textAlign: "right" }}>
            <div className="tk-route-city">{ticket.to}</div>
            <div className="tk-route-time">{ticket.toTime}</div>
          </div>
        </div>
        <div className="tk-ticket-meta">
          <div className="tk-meta-cell" style={{ paddingLeft: 0 }}><div className="tk-meta-key">Route</div><div className="tk-meta-val gold">{ticket.route}</div></div>
          <div className="tk-meta-cell" style={{ paddingLeft: 12 }}><div className="tk-meta-key">Stops</div><div className="tk-meta-val">{ticket.stops}</div></div>
          <div className="tk-meta-cell" style={{ paddingLeft: 12 }}><div className="tk-meta-key">Date</div><div className="tk-meta-val">{ticket.date}</div></div>
          <div className="tk-meta-cell" style={{ paddingLeft: 12 }}><div className="tk-meta-key">Seat</div><div className="tk-meta-val">Open</div></div>
        </div>
      </div>
      <div className="tk-tear-row">
        <div className="tk-tear-hole left" />
        <div style={{ flex: 1 }} />
        <div className="tk-tear-hole right" />
      </div>
      <div className="tk-ticket-bottom">
        <div className="tk-qr-box" onClick={() => onQRClick(ticket.ref, ticket.qrLabel)}>
          {QR_SVGS[idx]}
          <div className="tk-qr-overlay">🔍</div>
        </div>
        <div className="tk-ticket-actions-col">
          <div className="tk-live-pill">
            <div className="tk-live-pip" />
            <span className="tk-live-txt">{liveText}</span>
          </div>
          <div className="tk-ticket-price-row">
            <div className="tk-ticket-price">₹{ticket.price}</div>
            <div className="tk-ticket-price-label">per person</div>
          </div>
          <div className="tk-action-btns">
            <button className="tk-action-btn">Share</button>
            <button className="tk-action-btn">Download</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function WeekChart() {
  const max = Math.max(...WEEK_DATA);
  const bars = WEEK_DATA.map((v, i) => {
    const h = Math.round((v / max) * 72) + 6;
    const d = new Date(); d.setDate(d.getDate() - (29 - i));
    const day = DAYS[d.getDay()];
    const isToday = i === WEEK_DATA.length - 1;
    return { h, day, isToday, v };
  });
  return (
    <div className="tk-week-chart">
      {bars.map((b, i) => (
        <div key={i} className="tk-bar-col">
          <div className="tk-bar" style={{ height: b.h, background: b.isToday ? "var(--gold)" : "rgba(198,168,107,0.2)", borderTop: `2px solid ${b.isToday ? "var(--gold)" : "rgba(198,168,107,0.4)"}` }} title={`${b.v} trips`} />
          <span className="tk-bar-label" style={{ color: b.isToday ? "rgba(198,168,107,0.7)" : "rgba(255,255,255,0.15)" }}>{b.day}</span>
        </div>
      ))}
    </div>
  );
}

function TicketQRModal({ modalInfo, onClose }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (modalInfo && canvasRef.current) drawQR(canvasRef.current, 140);
  }, [modalInfo]);
  if (!modalInfo) return null;
  return (
    <div className="tk-modal-back open" onClick={(e) => e.target.classList.contains("tk-modal-back") && onClose()}>
      <div className="tk-modal-box">
        <button className="tk-modal-close-btn" onClick={onClose}>✕ Close</button>
        <div className="tk-modal-eyebrow">NAMMA TRICHY · BUS TICKET</div>
        <div className="tk-modal-title">Booking Confirmed</div>
        <div className="tk-modal-ref">#{modalInfo.ref}</div>
        <div className="tk-modal-qr-wrap"><canvas ref={canvasRef} width="140" height="140" /></div>
        <div className="tk-modal-route-lbl">{modalInfo.label}</div>
        <button className="tk-modal-done" onClick={onClose}>Done</button>
      </div>
    </div>
  );
}

function Tickets() {
  const [current, setCurrent] = useState(0);
  const [liveTexts, setLiveTexts]       = useState(LIVE_SETS.map(s => s[0]));
  const [liveHeadline, setLiveHeadline] = useState(HEADLINES[0]);
  const [modalInfo, setModalInfo]       = useState(null);

  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  const [selFrom,  setSelFrom]  = useState("");
  const [selTo,    setSelTo]    = useState("");
  const [selRoute, setSelRoute] = useState("");
  const [selPax,   setSelPax]   = useState("1");
  const [selDate,  setSelDate]  = useState(now.toISOString().slice(0, 10));
  const [selTime,  setSelTime]  = useState(now.toTimeString().slice(0, 5));

  const TOTAL = ACTIVE_TICKETS.length;
  const viewportRef = useRef(null);

  useEffect(() => {
    const id = setInterval(() => {
      setLiveTexts(LIVE_SETS.map(s => s[Math.floor(Math.random() * s.length)]));
      setLiveHeadline(HEADLINES[Math.floor(Math.random() * HEADLINES.length)]);
    }, 6000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    let sx = 0;
    const ts = (e) => { sx = e.touches[0].clientX; };
    const te = (e) => { if (Math.abs(e.changedTouches[0].clientX - sx) > 40) setCurrent(c => e.changedTouches[0].clientX < sx ? Math.min(c + 1, TOTAL - 1) : Math.max(c - 1, 0)); };
    vp.addEventListener("touchstart", ts, { passive: true });
    vp.addEventListener("touchend",   te, { passive: true });
    return () => { vp.removeEventListener("touchstart", ts); vp.removeEventListener("touchend", te); };
  }, [TOTAL]);

  const fare = selRoute && ROUTE_DATA[selRoute]
    ? { ...ROUTE_DATA[selRoute], total: ROUTE_DATA[selRoute].fare * parseInt(selPax || 1) }
    : null;

  const handleBook = async () => {
    if (!selFrom || !selTo || !selRoute) { alert("Please select From stop, To stop, and a Bus Route."); return; }
    if (selFrom === selTo) { alert("From and To stops cannot be the same."); return; }
    const fTxt = STOP_OPTIONS.find(o => o.value === selFrom)?.label || selFrom;
    const tTxt = STOP_OPTIONS.find(o => o.value === selTo)?.label   || selTo;
    const rTxt = ROUTE_OPTIONS.find(o => o.value === selRoute)?.label.split("·")[0].trim() || selRoute;
    const ref  = "TCK-" + new Date().getFullYear() + "-" + (Math.floor(Math.random() * 9000) + 1000);

    // 💾 Save to Supabase → tickets table
    await supabase.insert("tickets", {
      ref,
      from_stop:   fTxt,
      to_stop:     tTxt,
      route:       rTxt,
      passengers:  parseInt(selPax || 1),
      travel_date: selDate,
      travel_time: selTime,
      fare:        fare?.total ?? 0,
    });

    // 💾 Log bus status → buses table
    await supabase.insert("buses", {
      bus_number: selRoute.toUpperCase(),
      route:      `${fTxt} → ${tTxt}`,
      status:     "Booked",
    });

    setModalInfo({ ref, label: `${fTxt} → ${tTxt} · ${rTxt}` });
  };

  return (
    <>
      <div className="tk-layout">
        {/* LEFT PANEL */}
        <div className="tk-left-panel">
          <div className="tk-panel-hero tk-fadein">
            <div className="tk-panel-eyebrow">QR Ticketing</div>
            <div className="tk-panel-heading">My<br /><span>Tickets.</span></div>
          </div>

          {/* CAROUSEL */}
          <div className="tk-carousel-section">
            <div className="tk-carousel-label">Active Bus Tickets</div>
            <div className="tk-swipe-arrows">
              <button className="tk-arrow-btn" onClick={() => setCurrent(c => Math.max(c - 1, 0))} disabled={current === 0}>←</button>
              <button className="tk-arrow-btn" onClick={() => setCurrent(c => Math.min(c + 1, TOTAL - 1))} disabled={current === TOTAL - 1}>→</button>
            </div>
            <div className="tk-swipe-viewport" ref={viewportRef}>
              <div className="tk-swipe-track" style={{ transform: `translateX(calc(${current * -100}% - ${current * 20}px))` }}>
                {ACTIVE_TICKETS.map((ticket, i) => (
                  <TicketCard
                    key={ticket.ref}
                    ticket={ticket}
                    idx={i}
                    liveText={liveTexts[i]}
                    onQRClick={(ref, label) => setModalInfo({ ref, label })}
                  />
                ))}
              </div>
            </div>
            <div className="tk-swipe-dots">
              {ACTIVE_TICKETS.map((_, i) => (
                <button key={i} className={`tk-dot${i === current ? " active" : ""}`} onClick={() => setCurrent(i)} />
              ))}
            </div>
          </div>

          {/* BOOK NEW */}
          <div className="tk-book-section">
            <div className="tk-field-label">Book New Bus Ticket</div>
            <div className="tk-loc-row">
              <select className="tk-select" value={selFrom} onChange={e => setSelFrom(e.target.value)}>
                <option value="">📍 From (Bus Stop)</option>
                {STOP_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <select className="tk-select" value={selTo} onChange={e => setSelTo(e.target.value)}>
                <option value="">🏁 To (Bus Stop)</option>
                {STOP_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="tk-route-row">
              <select className="tk-select" value={selRoute} onChange={e => setSelRoute(e.target.value)}>
                <option value="">🚌 Select Bus Route</option>
                {ROUTE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <select className="tk-select" value={selPax} onChange={e => setSelPax(e.target.value)}>
                {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Passenger{n > 1 ? "s" : ""}</option>)}
              </select>
            </div>
            <div className="tk-time-row">
              <input className="tk-date-input" type="date" value={selDate} onChange={e => setSelDate(e.target.value)} />
              <input className="tk-time-input" type="time" value={selTime} onChange={e => setSelTime(e.target.value)} />
            </div>
            <div className="tk-fare-estimate">
              <div className="tk-fare-item"><div className={`tk-fare-num${fare ? " lit" : ""}`}>{fare ? fare.dist.toFixed(1) : "—"}</div><div className="tk-fare-key">KM</div></div>
              <div className="tk-fare-sep" />
              <div className="tk-fare-item"><div className={`tk-fare-num${fare ? " lit" : ""}`}>{fare ? fare.mins : "—"}</div><div className="tk-fare-key">MINS</div></div>
              <div className="tk-fare-sep" />
              <div className="tk-fare-item"><div className={`tk-fare-num${fare ? " lit" : ""}`}>{fare ? `₹${fare.total}` : "₹—"}</div><div className="tk-fare-key">FARE</div></div>
            </div>
            <button className="tk-book-btn" onClick={handleBook}><span>+</span> Book Ticket</button>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="tk-right-panel">
          <div className="tk-stats-row">
            <div className="tk-stat-block tk-fadein">
              <div className="tk-stat-eyebrow">This Month</div>
              <div className="tk-stat-num"><span>₹</span>692</div>
              <div className="tk-stat-sub">Total spent on bus tickets</div>
            </div>
            <div className="tk-stat-block tk-fadein" style={{ animationDelay: "0.08s" }}>
              <div className="tk-stat-eyebrow">Total Journeys</div>
              <div className="tk-stat-num">97</div>
              <div className="tk-stat-sub">Bus trips this month</div>
            </div>
            <div className="tk-stat-block tk-fadein" style={{ animationDelay: "0.16s" }}>
              <div className="tk-stat-eyebrow">Live Status of Bus</div>
              <div className="tk-stat-live">{liveHeadline}</div>
              <div className="tk-stat-sub" style={{ marginTop: 8 }}>Your next booked bus</div>
            </div>
          </div>

          <div className="tk-right-section tk-fadein" style={{ animationDelay: "0.1s" }}>
            <div className="tk-section-eyebrow">Activity</div>
            <div className="tk-section-heading">Previous Journeys</div>
            <WeekChart />
          </div>

          <div className="tk-right-section tk-fadein" style={{ animationDelay: "0.15s" }}>
            <div className="tk-section-eyebrow">Recent</div>
            <div className="tk-section-heading">Past 10 Journeys</div>
            <div className="tk-history-list">
              {HISTORY.map((h, i) => (
                <div key={i} className="tk-history-row">
                  <span className="tk-hr-icon">🚌</span>
                  <div>
                    <div className="tk-hr-route">{h.route}</div>
                    <div className="tk-hr-meta">{h.meta}</div>
                  </div>
                  <div className="tk-hr-right">
                    <div className="tk-hr-price">{h.price}</div>
                    <div className="tk-hr-date">{h.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="tk-shimmer-line" />
      {modalInfo && <TicketQRModal modalInfo={modalInfo} onClose={() => setModalInfo(null)} />}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TRANSPORT PAGE COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════
function LocationPicker({ id, placeholder, value, customValue, isCustom, onChange, onCustomChange, onReset }) {
  return (
    <div className="pt-loc-col">
      {!isCustom ? (
        <select className="pt-select" value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="">{placeholder}</option>
          <option value="__type__">Type Custom Location</option>
          {LOC_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      ) : (
        <>
          <input
            className="pt-custom-input pt-select"
            type="text"
            placeholder={`Type your ${id === "pickup" ? "pickup" : "drop"}…`}
            value={customValue}
            onChange={(e) => onCustomChange(e.target.value)}
            autoFocus
          />
          <button className="pt-back-link" onClick={onReset}>← Back to list</button>
        </>
      )}
    </div>
  );
}

function RideQRModal({ booking, onClose }) {
  const canvasRef = useRef(null);
  const refNum = useRef("TRY-" + Math.floor(100000 + Math.random() * 900000));
  useEffect(() => {
    if (booking && canvasRef.current) drawQR(canvasRef.current, 134);
  }, [booking]);
  if (!booking) return null;
  const { ride, p, d, dist, fare, mins } = booking;
  const tix = [
    { key: "From",     val: p.name.split(" ").slice(0, 3).join(" ") },
    { key: "To",       val: d.name.split(" ").slice(0, 3).join(" ") },
    { key: "Mode",     val: `${ride.emoji} ${ride.label}`           },
    { key: "Driver",   val: ride.driver                             },
    { key: "Distance", val: `${dist.toFixed(1)} KM`                 },
    { key: "ETA",      val: `~${mins} MIN`                          },
  ];
  return (
    <div className="pt-modal-back open" onClick={(e) => e.target.classList.contains("pt-modal-back") && onClose()}>
      <div className="pt-modal">
        <button className="pt-modal-close" onClick={onClose}>✕ Close</button>
        <div className="pt-modal-eyebrow">NAMMA TRICHY · ON THE GO</div>
        <div className="pt-modal-h2">Booking Confirmed</div>
        <div className="pt-qr-ref">{refNum.current}</div>
        <div className="pt-qr-wrap">
          <canvas ref={canvasRef} width="134" height="134" />
        </div>
        <div className="pt-ticket-grid">
          {tix.map((t) => (
            <div key={t.key} className="pt-tc">
              <div className="pt-tc-key">{t.key}</div>
              <div className="pt-tc-val">{t.val}</div>
            </div>
          ))}
          <div className="pt-tc" style={{ gridColumn: "1/-1" }}>
            <div className="pt-tc-key">Total Fare</div>
            <div className="pt-tc-val gold" style={{ fontSize: "22px" }}>₹{fare}</div>
          </div>
        </div>
        <button className="pt-btn-full" onClick={onClose}>Done</button>
      </div>
    </div>
  );
}

function LeafletMap({ routeData, mapRef }) {
  const containerRef = useRef(null);
  const leafletRef   = useRef(null);
  const liveMarkersRef = useRef([]);
  const liveDataRef    = useRef(LIVE_VEHICLES.map(v => ({ ...v })));
  const routeLayersRef = useRef({ line: null, mkPickup: null, mkDrop: null });

  useEffect(() => {
    const initMap = () => {
      if (leafletRef.current || !containerRef.current) return;
      const L = window.L;
      if (!L) return;
      const map = L.map(containerRef.current, { center: [10.8231, 78.6917], zoom: 13, zoomControl: false });
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", { maxZoom: 19 }).addTo(map);
      map.attributionControl.remove();
      L.control.zoom({ position: "bottomright" }).addTo(map);
      leafletRef.current = map;
      if (mapRef) mapRef.current = map;

      const mkIcon = (emoji) => L.divIcon({
        html: `<div style="width:32px;height:32px;background:rgba(8,8,8,0.85);border:1px solid rgba(198,168,107,0.4);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;">${emoji}</div>`,
        iconSize: [32, 32], iconAnchor: [16, 16], className: ""
      });
      liveDataRef.current.forEach((v) => {
        const mk = L.marker([v.lat, v.lng], { icon: mkIcon(v.emoji) }).addTo(map);
        liveMarkersRef.current.push(mk);
      });
      const interval = setInterval(() => {
        liveDataRef.current.forEach((v, i) => {
          v.lat += v.dL * (0.4 + Math.random() * 0.8);
          v.lng += v.dG * (0.4 + Math.random() * 0.8);
          if (v.lat > 10.92 || v.lat < 10.76) v.dL *= -1;
          if (v.lng > 78.76 || v.lng < 78.66) v.dG *= -1;
          liveMarkersRef.current[i]?.setLatLng([v.lat, v.lng]);
        });
      }, 2200);
      return () => clearInterval(interval);
    };

    if (window.L) { initMap(); return; }
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
    script.onload = initMap;
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    const L = window.L;
    const map = leafletRef.current;
    if (!L || !map || !routeData) return;
    const { p, d, dist, fare, mins, ride } = routeData;
    const rl = routeLayersRef.current;
    [rl.line, rl.mkPickup, rl.mkDrop].forEach(l => l && map.removeLayer(l));
    const goldIcon = (emoji) => L.divIcon({
      html: `<div style="width:36px;height:36px;background:rgba(8,8,8,0.92);border:1.5px solid #C6A86B;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 0 12px rgba(198,168,107,0.3);">${emoji}</div>`,
      iconSize: [36, 36], iconAnchor: [18, 18], className: ""
    });
    rl.mkPickup = L.marker([p.lat, p.lng], { icon: goldIcon("📍") }).addTo(map);
    rl.mkDrop   = L.marker([d.lat, d.lng], { icon: goldIcon("🏁") }).addTo(map);
    rl.line     = L.polyline([[p.lat, p.lng], [d.lat, d.lng]], { color: "#C6A86B", weight: 2.5, opacity: 0.9, dashArray: "8 6" }).addTo(map);
    map.fitBounds([[p.lat, p.lng], [d.lat, d.lng]], { padding: [70, 70] });
    rl.mkDrop.bindPopup(`
      <div class="pt-popup-inner">
        <span class="pt-pop-emoji">${ride.emoji}</span>
        <span class="pt-pop-driver">${ride.driver}</span>
        <span class="pt-pop-eyebrow">Your Driver · ${ride.label}</span>
        <span class="pt-pop-route">${p.name}<br>↓<br>${d.name}</span>
        <div class="pt-pop-divider"></div>
        <span class="pt-pop-fare">₹${fare}</span>
        <span class="pt-pop-sub">${dist.toFixed(1)} km · ~${mins} min</span>
      </div>
    `, { maxWidth: 260 }).openPopup();
    routeLayersRef.current = rl;
  }, [routeData]);

  return (
    <div className="pt-map-wrap" style={{ position: "relative" }}>
      <div ref={containerRef} id="pt-map" style={{ width: "100%", height: "100%" }} />
      {routeData && (
        <div className="pt-map-badge show">
          <div className="pt-mb-eyebrow">Active Route</div>
          <div className="pt-mb-route">
            {routeData.p.name.split(" ").slice(0, 3).join(" ")} → {routeData.d.name.split(" ").slice(0, 3).join(" ")}
          </div>
          <div className="pt-mb-meta">
            {routeData.dist.toFixed(1)} km · {routeData.mins} min · ₹{routeData.fare}
          </div>
        </div>
      )}
    </div>
  );
}

function PrivateTransport() {
  const [pickup, setPickup]                   = useState("");
  const [drop, setDrop]                       = useState("");
  const [pickupCustom, setPickupCustom]       = useState("");
  const [dropCustom, setDropCustom]           = useState("");
  const [isPickupCustom, setIsPickupCustom]   = useState(false);
  const [isDropCustom, setIsDropCustom]       = useState(false);
  const [selectedRide, setSelectedRide]       = useState("bike");
  const [routeData, setRouteData]             = useState(null);
  const [booking, setBooking]                 = useState(null);
  const mapRef = useRef(null);

  const fare = (!isPickupCustom && !isDropCustom) ? calcFare(pickup, drop, selectedRide) : null;

  const handlePickupChange = (val) => {
    if (val === "__type__") { setIsPickupCustom(true); setPickup(""); }
    else setPickup(val);
  };
  const handleDropChange = (val) => {
    if (val === "__type__") { setIsDropCustom(true); setDrop(""); }
    else setDrop(val);
  };

  const handleBookNow = async () => {
    if (!pickup || !drop) { alert("Please select both pickup and drop locations."); return; }
    if (pickup === drop)  { alert("Pickup and drop cannot be the same."); return; }
    if (isPickupCustom || isDropCustom) {
      alert("Distance calculation works for locations from the list. Custom location support coming soon!"); return;
    }
    const p = LOCS[pickup], d = LOCS[drop];
    const dist = haversine(p.lat, p.lng, d.lat, d.lng);
    const fare  = Math.round(dist * RATES[selectedRide].rate);
    const mins  = Math.round(dist * (selectedRide === "bike" ? 3 : selectedRide === "auto" ? 4 : 3.5));
    const ride  = RATES[selectedRide];
    const data  = { p, d, dist, fare, mins, ride };

    // 💾 Save to Supabase → rides table
    await supabase.insert("rides", {
      ref:         "TRY-" + Math.floor(100000 + Math.random() * 900000),
      pickup:      p.name,
      drop_loc:    d.name,
      ride_type:   ride.label,
      driver:      ride.driver,
      distance_km: parseFloat(dist.toFixed(2)),
      fare,
      eta_mins:    mins,
    });

    setRouteData(data);
    setTimeout(() => setBooking(data), 600);
  };

  return (
    <>
      <div className="pt-layout">
        {/* LEFT PANEL */}
        <div className="pt-panel">
          <div className="pt-panel-hero">
            <div className="pt-panel-heading">
              Your <span>ride.</span><br />
              Your <span>time.</span><br />
              Your <span>destination.</span>
            </div>
          </div>

          <div className="pt-panel-section">
            <div className="pt-field-label">Pickup &amp; Drop</div>
            <div className="pt-loc-row">
              <LocationPicker
                id="pickup"
                placeholder="📍 Pickup Point"
                value={pickup}
                customValue={pickupCustom}
                isCustom={isPickupCustom}
                onChange={handlePickupChange}
                onCustomChange={setPickupCustom}
                onReset={() => { setIsPickupCustom(false); setPickup(""); setPickupCustom(""); }}
              />
              <LocationPicker
                id="drop"
                placeholder="🏁 Drop Location"
                value={drop}
                customValue={dropCustom}
                isCustom={isDropCustom}
                onChange={handleDropChange}
                onCustomChange={setDropCustom}
                onReset={() => { setIsDropCustom(false); setDrop(""); setDropCustom(""); }}
              />
            </div>
          </div>

          <div className="pt-panel-section">
            <div className="pt-field-label">Travel Your Way</div>
            <div className="pt-ride-grid">
              {Object.entries(RATES).map(([type, info]) => (
                <button
                  key={type}
                  className={`pt-ride-tile${selectedRide === type ? " sel" : ""}`}
                  onClick={() => setSelectedRide(type)}
                >
                  <span className="pt-rt-emoji">{info.emoji}</span>
                  <span className="pt-rt-name">{info.label}</span>
                  <span className="pt-rt-rate">{info.rateDisplay}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-panel-section">
            <div className="pt-field-label">Fare Estimate</div>
            <div className="pt-fare-box">
              <div className="pt-fare-item">
                <div className={`pt-fare-val${fare ? " lit" : " muted"}`}>{fare ? fare.dist.toFixed(1) : "—"}</div>
                <div className="pt-fare-key">KM</div>
              </div>
              <div className="pt-fare-divider" />
              <div className="pt-fare-item">
                <div className={`pt-fare-val${fare ? " lit" : " muted"}`}>{fare ? fare.mins : "—"}</div>
                <div className="pt-fare-key">MINS</div>
              </div>
              <div className="pt-fare-divider" />
              <div className="pt-fare-item">
                <div className={`pt-fare-val${fare ? " lit" : " muted"}`}>{fare ? `₹${fare.fare}` : "₹—"}</div>
                <div className="pt-fare-key">FARE</div>
              </div>
            </div>
          </div>

          <div className="pt-panel-section">
            <div className="pt-field-label">Nearby Drivers</div>
            <div className="pt-drivers-list">
              {[
                { emoji: "🏍️", name: "C. Kumaran", meta: "Bike · ★ 4.8 · 230 trips", eta: "3 MIN" },
                { emoji: "🛺",  name: "R. Muthu",   meta: "Auto · ★ 4.6 · 410 trips", eta: "5 MIN" },
                { emoji: "🚖",  name: "S. Karthik", meta: "Cab  · ★ 4.9 · 180 trips", eta: "7 MIN" },
              ].map((d) => (
                <div key={d.name} className="pt-driver-card">
                  <span className="pt-driver-emoji">{d.emoji}</span>
                  <div className="pt-driver-info">
                    <div className="pt-driver-name">{d.name}</div>
                    <div className="pt-driver-meta">{d.meta}</div>
                  </div>
                  <span className="pt-driver-eta">{d.eta}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-panel-section" style={{ borderBottom: "none", paddingBottom: "36px" }}>
            <button className="pt-book-btn" onClick={handleBookNow}>
              <span>⚡</span> Book Now
            </button>
          </div>
        </div>

        {/* MAP */}
        <LeafletMap routeData={routeData} mapRef={mapRef} />
      </div>

      {booking && <RideQRModal booking={booking} onClose={() => setBooking(null)} />}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT APP
// ═══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [page, setPage] = useState("home");

  const navigate = (id) => {
    setPage(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPage = () => {
    switch (page) {
      case "tickets":   return <Tickets setPage={navigate} />;
      case "transport": return <PrivateTransport setPage={navigate} />;
      case "explore":   return <ExplorePage setPage={navigate} />;
      default:
        return (
          <>
            <Hero setPage={navigate} />
            <QuickAccess setPage={navigate} />
            <About />
            <FeaturesBar />
          </>
        );
    }
  };

  return (
    <>
      <StyleInjector />
      <Navbar activePage={page} setPage={navigate} />
      <main>{renderPage()}</main>
      {page === "home" && <Footer />}
    </>
  );
}
