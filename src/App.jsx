import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Heart, Stars, Sparkles, Send, Loader2, PartyPopper, Calendar, Clock } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Day Pass Wheel Data — 10 coupons from Mrinal to Sakshi
// ─────────────────────────────────────────────────────────────────────────────
const PASSES = [
  {
    emoji: "🚗", name: "Long Drive",
    desc: "Sakshi, tonight I'm driving wherever you point — windows down, your playlist on full blast, just us! 🌅",
    color: "#FF6B9D", light: "#FFB3D1",
  },
  {
    emoji: "💆", name: "Body Massage",
    desc: "Sakshi, you relax completely — I take over. No interruptions, no phones, full 60-minute massage from me! ✨",
    color: "#FBBF24", light: "#FDE68A",
  },
  {
    emoji: "🦶", name: "Foot Spa",
    desc: "Sakshi, put those feet up — literally. Today they get the royal treatment they absolutely deserve! 👑",
    color: "#A78BFA", light: "#DDD6FE",
  },
  {
    emoji: "👶", name: "Kids-Free Day",
    desc: "Sakshi, I've got the little one ALL day — you do exactly whatever your heart wants, zero guilt! 🌸",
    color: "#34D399", light: "#A7F3D0",
  },
  {
    emoji: "🛏️", name: "Breakfast in Bed",
    desc: "Sakshi, don't move a single muscle. Your favourite breakfast is coming straight to you in bed! ☕",
    color: "#FB923C", light: "#FED7AA",
  },
  {
    emoji: "🎬", name: "Movie Night",
    desc: "Sakshi, your pick, your snacks, your rules — I won't complain about the movie even once, I promise! 🍿",
    color: "#60A5FA", light: "#BFDBFE",
  },
  {
    emoji: "🛍️", name: "Shopping Spree",
    desc: "Sakshi, just point and I'll nod — today I am literally your personal, very happy shopping cart! 😄",
    color: "#F472B6", light: "#FBCFE8",
  },
  {
    emoji: "💅", name: "Spa Day",
    desc: "Sakshi, I'm booking your favourite spa, handling the bill, and managing everything else while you glow! 💖",
    color: "#4ADE80", light: "#BBF7D0",
  },
  {
    emoji: "🌙", name: "Stargazing",
    desc: "Sakshi, a blanket, hot chocolate, and just the two of us under the Lucknow sky tonight! 🌟",
    color: "#818CF8", light: "#C7D2FE",
  },
  {
    emoji: "🍳", name: "I Cook All Day",
    desc: "Sakshi, from your morning chai to your midnight snack — Chef Mrinal is fully at your service! 👨‍🍳",
    color: "#F87171", light: "#FECACA",
  },
];

const N = PASSES.length; // 10
const SEG = 360 / N;       // 36° per segment

// ── SVG helpers — angles measured clockwise from 12 o'clock ──────────────────
const toRad = (deg) => ((deg - 90) * Math.PI) / 180;
const pt = (r, deg) => [
  200 + r * Math.cos(toRad(deg)),
  200 + r * Math.sin(toRad(deg)),
];
const arc = (r, s, e) => {
  const [sx, sy] = pt(r, s), [ex, ey] = pt(r, e);
  return `M200,200 L${sx},${sy} A${r},${r} 0 0,1 ${ex},${ey}Z`;
};

// ─────────────────────────────────────────────────────────────────────────────
// SpinWheel Component
// ─────────────────────────────────────────────────────────────────────────────
function SpinWheel({ onResult }) {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
  const [spunOnce, setSpunOnce] = useState(false);

  const SPIN_DURATION = 5000; // ms — must match CSS transition duration

  const spin = useCallback(() => {
    if (spinning) return;
    setWinner(null);
    setSpinning(true);

    const winIdx = Math.floor(Math.random() * N);

    // Rotation math:
    // Pointer is fixed at top. Wheel rotates clockwise.
    // Center of segment i in wheel frame = i*SEG + SEG/2 degrees from top.
    // For pointer (top = 0°) to point at that center after rotation R:
    //   (360 − R) % 360 = i*SEG + SEG/2
    //   R = (360 − (i*SEG + SEG/2)) % 360
    const segCenter = winIdx * SEG + SEG / 2;
    const targetMod = (360 - segCenter + 360) % 360;
    const curMod = rotation % 360;
    const delta = ((targetMod - curMod) + 360) % 360 || 360;
    const extraSpins = 7 + Math.floor(Math.random() * 5); // 7–11 full rotations
    const newRotation = rotation + extraSpins * 360 + delta;

    setRotation(newRotation);

    setTimeout(() => {
      setSpinning(false);
      setSpunOnce(true);
      const won = PASSES[winIdx];
      setWinner(won);
      onResult?.(won);
    }, SPIN_DURATION);
  }, [spinning, rotation, onResult]);

  return (
    <div className="flex flex-col items-center gap-5 w-full">

      {/* ── Wheel ─────────────────────────────────────────────────────────── */}
      <div className="relative mx-auto" style={{ width: 300, height: 300 }}>

        {/* Outer glow */}
        <div className="absolute inset-0 rounded-full"
          style={{ boxShadow: "0 0 40px 8px rgba(251,191,36,0.35), 0 0 60px 16px rgba(244,114,182,0.2)" }} />

        {/* Conic-gradient border ring */}
        <div className="absolute inset-0 rounded-full"
          style={{
            background:
              "conic-gradient(#FF6B9D 0%, #FBBF24 10%, #A78BFA 20%, #34D399 30%, #FB923C 40%, #60A5FA 50%, #F472B6 60%, #4ADE80 70%, #818CF8 80%, #F87171 90%, #FF6B9D 100%)",
            padding: 5,
          }}>
          <div className="w-full h-full rounded-full bg-amber-50" />
        </div>

        {/* Spinning segment wrapper */}
        <div
          className="absolute rounded-full overflow-hidden"
          style={{
            inset: 5,
            transform: `rotate(${rotation}deg)`,
            transition: spinning
              ? `transform ${SPIN_DURATION}ms cubic-bezier(0.23, 1, 0.32, 1)`
              : "none",
          }}
        >
          <svg viewBox="0 0 400 400" width="100%" height="100%">
            <defs>
              {PASSES.map((p, i) => (
                <radialGradient key={i} id={`rg${i}`} cx="35%" cy="35%">
                  <stop offset="0%" stopColor={p.light} />
                  <stop offset="100%" stopColor={p.color} />
                </radialGradient>
              ))}
              <filter id="txtShadow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodOpacity="0.4" />
              </filter>
            </defs>

            {/* Segments */}
            {PASSES.map((pass, i) => {
              const start = i * SEG;
              const end = (i + 1) * SEG;
              const mid = i * SEG + SEG / 2;
              const [ex, ey] = pt(155 * 0.67, mid); // emoji position (67% of radius)
              return (
                <g key={i}>
                  <path
                    d={arc(155, start, end)}
                    fill={`url(#rg${i})`}
                    stroke="white"
                    strokeWidth="1.5"
                  />
                  <text
                    x={ex} y={ey}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="22"
                    transform={`rotate(${mid}, ${ex}, ${ey})`}
                  >
                    {pass.emoji}
                  </text>
                </g>
              );
            })}

            {/* Spoke dividers */}
            {PASSES.map((_, i) => {
              const [lx, ly] = pt(155, i * SEG);
              return (
                <line key={i} x1="200" y1="200" x2={lx} y2={ly}
                  stroke="white" strokeWidth="1.5" />
              );
            })}

            {/* Center hub */}
            <circle cx="200" cy="200" r="28" fill="white" stroke="#e5e7eb" strokeWidth="2.5" />
            <text x="200" y="200" textAnchor="middle" dominantBaseline="middle" fontSize="24">🎁</text>
          </svg>
        </div>

        {/* Fixed pointer — does NOT rotate */}
        <div
          className="absolute left-1/2 z-20"
          style={{ top: -4, transform: "translateX(-50%)" }}
        >
          <svg width="22" height="32" viewBox="0 0 22 32">
            {/* Shadow layer */}
            <polygon points="11,31 0,6 22,6" fill="rgba(0,0,0,0.15)" transform="translate(1,1)" />
            {/* Main pointer */}
            <polygon points="11,30 0,5 22,5" fill="#DC2626" />
            {/* Highlight */}
            <polygon points="11,26 4,9 18,9" fill="#EF4444" />
            {/* Pin head */}
            <circle cx="11" cy="5" r="5" fill="#DC2626" />
            <circle cx="9" cy="3.5" r="2" fill="#FCA5A5" opacity="0.6" />
          </svg>
        </div>
      </div>

      {/* ── Spin Button ──────────────────────────────────────────────────── */}
      <button
        id="spin-btn"
        onClick={spin}
        disabled={spinning}
        className={[
          "px-10 py-3.5 rounded-2xl font-black text-lg shadow-xl",
          "transition-all duration-200 active:scale-95 select-none",
          spinning
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-gradient-to-r from-rose-400 to-amber-400 text-white hover:from-rose-500 hover:to-amber-500 hover:scale-105 hover:shadow-2xl",
        ].join(" ")}
      >
        {spinning ? (
          <span className="flex items-center gap-2">
            <Loader2 className="animate-spin" size={18} /> Spinning…
          </span>
        ) : spunOnce ? "🔄 Spin Again!" : "🎰 Spin the Wheel!"}
      </button>

      {/* ── Winner Card ───────────────────────────────────────────────────── */}
      {winner && !spinning && (
        <div
          id="winner-card"
          className="w-full p-5 rounded-2xl text-center shadow-xl animate-in slide-in-from-bottom-3 fade-in duration-500"
          style={{
            background: `linear-gradient(135deg, ${winner.light}80 0%, white 65%)`,
            border: `2.5px solid ${winner.color}`,
            boxShadow: `0 6px 30px ${winner.color}50`,
          }}
        >
          <div
            className="text-5xl mb-2"
            style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.15))" }}
          >
            {winner.emoji}
          </div>
          <p className="font-black text-gray-800 text-xl mb-3">{winner.name}</p>
          <div className="px-3 py-3 rounded-xl bg-white/70 backdrop-blur-sm">
            <p className="text-gray-600 text-sm leading-relaxed italic">
              "{winner.desc}"
            </p>
          </div>
          <p
            className="text-xs font-bold mt-3 tracking-widest uppercase"
            style={{ color: winner.color }}
          >
            🎀 Coupon Redeemed — Valid Today Only!
          </p>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main App
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const [noCount, setNoCount] = useState(0);
  const [yesPressed, setYesPressed] = useState(false);

  // AI State
  const [aiReason, setAiReason] = useState("");
  const [loadingReason, setLoadingReason] = useState(false);

  // Date planner
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [datePlan, setDatePlan] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(false);

  // Day Pass wheel visibility
  const [showWheel, setShowWheel] = useState(false);

  // ── Viewport tracking (for button clamping + No button placement) ──────────
  const [vw, setVw] = useState(() => window.innerWidth);
  const [vh, setVh] = useState(() => window.innerHeight);
  useEffect(() => {
    const onResize = () => { setVw(window.innerWidth); setVh(window.innerHeight); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Approximate natural button sizes (px)
  const YES_W = 190, YES_H = 60;
  const NO_W  = 160, NO_H  = 56;

  // Yes button: scale grows with clicks, clamped independently so tall screens get filled
  // Multiplier is 1.0 so by 16 clicks it reaches scale ~17 (1020px height), completely filling any mobile screen
  const rawScale   = 1 + noCount * 1.0;
  const yesScaleX  = Math.min(rawScale, (vw / YES_W) * 0.98);
  const yesScaleY  = Math.min(rawScale, (vh / YES_H) * 0.98);
  // "Covered" = scaled Yes button fills ≥85% of both dimensions
  const yesCoversX = (YES_W * yesScaleX) / vw >= 0.85;
  const yesCoversY = (YES_H * yesScaleY) / vh >= 0.85;
  const yesCoversScreen = yesCoversX && yesCoversY;

  // No button: fixed pixel position, null = no space left (hide it)
  const [noPos, setNoPos] = useState(null); // { x, y } in px

  // Find a random fixed position for No that doesn't overlap current Yes footprint
  const yesBtnRef = useRef(null);
  const findNoPos = useCallback((scaleX, scaleY) => {
    let exL, exR, exT, exB;
    if (yesBtnRef.current) {
      const rect = yesBtnRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      // Calculate new scaled width/height using the base width (without current scale)
      const baseW = rect.width / yesScaleX;
      const baseH = rect.height / yesScaleY;
      const scaledW = baseW * scaleX;
      const scaledH = baseH * scaleY;
      exL = cx - scaledW / 2;
      exR = cx + scaledW / 2;
      exT = cy - scaledH / 2;
      exB = cy + scaledH / 2;
    } else {
      // fallback
      const scaledW = YES_W * scaleX;
      const scaledH = YES_H * scaleY;
      exL = (vw - scaledW) / 2; exR = (vw + scaledW) / 2;
      const exY = vh * 0.5;
      exT = exY - (scaledH / 2); exB = exY + (scaledH / 2);
    }
    
    // Add padding so No never grazes the edge of Yes
    const pad = 16;
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * Math.max(1, vw - NO_W);
      const y = Math.random() * Math.max(1, vh - NO_H);
      const overlaps =
        x < exR + pad && x + NO_W > exL - pad &&
        y < exB + pad && y + NO_H > exT - pad;
      if (!overlaps) return { x, y };
    }
    return null; // screen is covered — No has nowhere to go
  }, [vw, vh, yesScaleX, yesScaleY]);

  // ── Secure API helper — calls /api/gemini serverless function ─────────────
  const callGemini = async (prompt, retryCount = 0) => {
    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.text || "Couldn't think of something, but the love is real! 💛";
    } catch (err) {
      if (retryCount < 3) {
        await new Promise(r => setTimeout(r, Math.pow(2, retryCount) * 1000));
        return callGemini(prompt, retryCount + 1);
      }
      console.error("API Error:", err);
      return "Oops, something went wrong. Try again! 💛";
    }
  };

  // ── "Need convincing?" — Mrinal convincing Sakshi, romantic & cheesy ──────
  const handleConvinceMe = async () => {
    setLoadingReason(true);
    const prompt =
      "You are Mrinal, deeply in love with his wife Sakshi. Write ONE line that Mrinal says directly to Sakshi to convince her she loves him back. " +
      "Be romantic, corny, over-the-top cheesy, and personal — like a Bollywood hero talking to his jaan. " +
      "Address her directly as 'Sakshi'. Max 20 words. End with exactly one emoji. " +
      "Examples of the tone: 'Sakshi, you are the reason my heart has Wi-Fi 💕', 'Sakshi, even my heartbeat spells your name 🥺'. " +
      "Now write a DIFFERENT, fresh, equally cheesy line.";
    const text = await callGemini(prompt);
    setAiReason(text);
    setLoadingReason(false);
  };

  // ── Date planner — Mrinal planning in Lucknow for Sakshi ─────────────────
  const handlePlanDate = async () => {
    if (!selectedDate || !selectedTime) return;
    setLoadingPlan(true);

    const dateObj = new Date(`${selectedDate}T${selectedTime}`);
    const formattedDate = dateObj.toLocaleDateString("en-IN", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    });
    const formattedTime = dateObj.toLocaleTimeString("en-IN", {
      hour: "2-digit", minute: "2-digit", hour12: true,
    });

    const prompt =
      `You are Mrinal, writing a birthday date plan for his wife Sakshi. ` +
      `Generate 3 date ideas in Noida or Delhi for ${formattedDate} starting at ${formattedTime}. ` +
      `Speak DIRECTLY to Sakshi in first person from Mrinal's perspective — use "I'll take you", "we'll go", "you'll love it", etc. ` +
      `Mention SPECIFIC real places in Noida or Delhi (e.g. Cyber Hub Gurgaon, Hauz Khas Village, Connaught Place, Sector 18 Noida, Janpath, Lodhi Garden, etc.). ` +
      `Keep each idea to 3 sentences. Include timing details. Be warm, romantic, and fun. Use emojis. ` +
      `Format EXACTLY like this (keep the emoji headers):\n\n` +
      `💕 Romantic:\n[Mrinal speaking to Sakshi]\n\n` +
      `🎉 Fun:\n[Mrinal speaking to Sakshi]\n\n` +
      `☕ Cozy:\n[Mrinal speaking to Sakshi]`;

    const raw = await callGemini(prompt);
    setDatePlan(parseThreePlans(raw));
    setLoadingPlan(false);
  };

  // ── Parse AI response into 3 cards ────────────────────────────────────────
  const parseThreePlans = (raw) => {
    const out = { romantic: "", fun: "", cozy: "" };
    const blocks = raw.split(/\n(?=💕|🎉|☕)/);
    blocks.forEach((block) => {
      const b = block.trim();
      if (b.startsWith("💕")) out.romantic = b.replace(/^💕[^\n]*\n?/i, "").trim();
      else if (b.startsWith("🎉")) out.fun = b.replace(/^🎉[^\n]*\n?/i, "").trim();
      else if (b.startsWith("☕")) out.cozy = b.replace(/^☕[^\n]*\n?/i, "").trim();
    });
    if (!out.romantic && !out.fun && !out.cozy) out.romantic = raw;
    return out;
  };

  // ── No button ─────────────────────────────────────────────────────────────
  const handleNoClick = () => {
    const newCount = noCount + 1;
    setNoCount(newCount);
    // Compute the scale AFTER this click so we avoid the NEW yes-button footprint
    const newRawScale = 1 + newCount * 1.0;
    const newScaleX = Math.min(newRawScale, (vw / YES_W) * 0.98);
    const newScaleY = Math.min(newRawScale, (vh / YES_H) * 0.98);
    const pos = findNoPos(newScaleX, newScaleY);
    setNoPos(pos); // null = no valid position → hide No button
  };

  // 75 phrases, shuffled once on mount
  const shuffledNoPhrases = useMemo(() => {
    const pool = [
      "Are you sure? 🥺", "Really sure?", "Think again!", "But… I love you! 💕",
      "Please? 🙏", "That can't be right!", "Give it another thought!",
      "Are you absolutely certain?", "You'll hurt my feelings 😢", "Have a heart!",
      "Don't be so cold!", "Change of heart? 💛", "Wouldn't you reconsider?",
      "Is that your final answer?", "You're breaking my heart ;(", "Plsss? :(",
      "But I made chai for you! ☕", "Okay but… what if yes? 🤔",
      "My heart says otherwise 💔", "Even the stars say yes ✨",
      "Try the other button 😅", "Wrong button, surely?", "The WiFi says yes 📶",
      "Ek baar aur soch lo", "Arey yaar! 😩", "Main ro dunga 😭",
      "You're my favourite person!", "Google Maps says go together 🗺️",
      "My mom likes you 😅", "But I remembered your birthday! 🎂",
      "I'll make Maggi for you 🍜", "Last chance, I promise!",
      "Even the moon is judging you 🌙", "Plot twist: click Yes",
      "Error 404: No not found 🤖", "Are you pranking me? 😏",
      "My heart just skipped 💓", "Ek chance toh do yaar",
      "Even Alexa agrees with me 😂", "Retry? 🔄",
      "Nahi toh nahi… but please?", "I googled it: Yes is better",
      "Press Yes for good luck 🍀", "What if I said please nicely? 🥹",
      "This button is broken, try Yes", "But I'm really cute tho 🐻",
      "Even Siri agrees with me 📱", "You're making the bear cry 🐻",
      "The stars aligned for Yes ⭐", "Main wait karoonga… forever",
      "Still here. Still hoping. 💕", "Your heart knows the answer",
      "Dil toh pagal hai 🎵", "Ab toh haan bol do!",
      "I'll never stop asking 😄", "You're legally obligated to say Yes",
      "Science says love > No 🔬", "My plants believe in us 🌿",
      "Destiny called. It wants Yes.", "Tum hi ho 🎵",
      "The universe is watching 👀", "Say yes and I'll do dishes 🍽️",
      "Yes = unlimited hugs 🤗", "You're my person, you know that?",
      "Meri jaan, please? 🥹", "Fine. But I'll be sad. 😔",
      "Plot twist: you always meant Yes", "I'll write a poem if you say Yes",
      "Okay last time. Promise. Maybe. 😅", "You're literally my sunshine ☀️",
      "Even traffic agrees with me 🚗", "Zindagi na milegi dobara 🎬",
      "I saved your favourite snack for this", "This button is working against us 😤",
      "Pehli fursat mein haan bol do", "Okay but consider: Yes 🌸",
    ];
    // Fisher-Yates shuffle
    const arr = [...pool];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, []);

  const getNoButtonText = () => {
    if (noCount === 0) return "No";
    return shuffledNoPhrases[Math.min(noCount - 1, shuffledNoPhrases.length - 1)];
  };

  // ── Date card config ───────────────────────────────────────────────────────
  const cardConfig = {
    romantic: { label: "💕 Romantic", border: "border-rose-200", bg: "bg-rose-50", head: "text-rose-600" },
    fun: { label: "🎉 Fun", border: "border-amber-200", bg: "bg-amber-50", head: "text-amber-600" },
    cozy: { label: "☕ Cozy", border: "border-green-200", bg: "bg-green-50", head: "text-green-700" },
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-amber-50 selection:bg-amber-200 overflow-hidden font-sans p-4">
      {yesPressed ? (
        // ── Success / Birthday Reveal ──────────────────────────────────────
        <div className="flex flex-col items-center gap-6 w-full max-w-lg text-center pb-16">

          {/* Photo */}
          <img
            src="/Mri.jpeg"
            alt="A photo of us 💛"
            className="w-full max-w-[200px] md:max-w-[300px] h-auto rounded-xl shadow-lg border-4 border-amber-300 object-cover mt-4"
          />

          {/* Celebration heading */}
          <div className="text-4xl md:text-6xl font-bold text-amber-600 flex items-center justify-center gap-3">
            Yay!!! <PartyPopper className="text-amber-500 animate-bounce" />
          </div>

          {/* Birthday message */}
          <div className="space-y-2 px-2">
            <p className="text-2xl md:text-3xl font-bold text-amber-700">
              Happy Birthday, Sakshi! 🎂
            </p>
            <p className="text-base md:text-lg text-amber-800 font-medium leading-relaxed">
              You deserve all the love in the world today — and every single day. ✨
            </p>
            <p className="text-base md:text-lg text-rose-500 font-medium">
              I love you more than words. Let's make today unforgettable in Lucknow! 💛
            </p>
            <p className="text-sm text-amber-500 font-semibold mt-1">— Mrinal</p>
          </div>

          {/* ── Day Pass Wheel Section ──────────────────────────────────── */}
          <div className="w-full bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-amber-200 overflow-hidden">
            <button
              id="day-pass-toggle"
              onClick={() => setShowWheel(v => !v)}
              className="w-full px-6 py-4 flex items-center justify-between text-left transition-colors hover:bg-amber-50/80"
            >
              <div>
                <p className="font-bold text-amber-700 text-lg flex items-center gap-2">
                  🎁 Spin a Day Pass!
                </p>
                <p className="text-amber-500 text-sm mt-0.5">
                  Tap to spin — win a special treat from Mrinal 🎀
                </p>
              </div>
              <span className="text-amber-400 text-2xl transition-transform duration-300"
                style={{ transform: showWheel ? "rotate(180deg)" : "rotate(0deg)" }}>
                ▾
              </span>
            </button>

            {showWheel && (
              <div className="px-4 pb-6 pt-2 border-t border-amber-100 animate-in slide-in-from-top-2 fade-in duration-300">
                <SpinWheel />
              </div>
            )}
          </div>

          {/* ── Date Planner ────────────────────────────────────────────── */}
          <div className="w-full bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-amber-200">
            <h3 className="text-xl font-bold text-amber-600 mb-1 flex items-center justify-center gap-2">
              <Sparkles size={20} /> Plan Our Date in Noida / Delhi
            </h3>
            <p className="text-amber-500 text-sm mb-5">
              Pick a date &amp; time — Mrinal will plan 3 ideas in Noida/Delhi: Romantic 💕, Fun 🎉, Cozy ☕
            </p>

            {/* Date + Time inputs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="flex items-center gap-2 flex-1 border-2 border-amber-200 rounded-lg px-3 py-2 bg-white/80 focus-within:border-amber-400 transition-colors">
                <Calendar size={16} className="text-amber-400 shrink-0" />
                <input
                  id="date-input"
                  type="date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="flex-1 bg-transparent focus:outline-none text-amber-700 text-sm"
                />
              </div>
              <div className="flex items-center gap-2 flex-1 border-2 border-amber-200 rounded-lg px-3 py-2 bg-white/80 focus-within:border-amber-400 transition-colors">
                <Clock size={16} className="text-amber-400 shrink-0" />
                <input
                  id="time-input"
                  type="time"
                  value={selectedTime}
                  onChange={e => setSelectedTime(e.target.value)}
                  className="flex-1 bg-transparent focus:outline-none text-amber-700 text-sm"
                />
              </div>
              <button
                id="plan-btn"
                onClick={handlePlanDate}
                disabled={loadingPlan || !selectedDate || !selectedTime}
                className="bg-amber-500 text-white px-5 py-2 rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-semibold text-sm shrink-0"
              >
                {loadingPlan ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                {loadingPlan ? "Planning…" : "Go!"}
              </button>
            </div>

            {/* 3 Date Idea Cards */}
            {datePlan && (
              <div id="date-plan-result" className="flex flex-col gap-3 text-left">
                {Object.entries(cardConfig).map(([key, cfg]) =>
                  datePlan[key] ? (
                    <div key={key} className={`p-4 rounded-xl border-2 ${cfg.border} ${cfg.bg} shadow-sm`}>
                      <p className={`font-bold text-sm mb-1.5 ${cfg.head}`}>{cfg.label}</p>
                      <p className="text-gray-700 text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                        {datePlan[key].trim()}
                      </p>
                    </div>
                  ) : null
                )}
              </div>
            )}
          </div>
        </div>

      ) : (
        // ── Question View ──────────────────────────────────────────────────
        <div className="flex flex-col items-center gap-6 w-full max-w-2xl text-center relative z-10 mt-8">
          
          <h1 className="text-4xl md:text-5xl font-extrabold text-rose-500 drop-shadow-sm leading-tight px-4">
            Sakshi… do you love me? 🥺
          </h1>

          <div className="relative">
            <img
              src="https://media.tenor.com/h5jR0eK8pjoAAAAi/cute-bear.gif"
              alt="Cute bear asking"
              className="w-full max-w-[200px] md:max-w-[250px] h-auto rounded-xl shadow-xl border-4 border-white"
            />
            <div className="absolute -top-6 -right-6 animate-pulse text-rose-400">
              <Stars size={40} />
            </div>

            {/* AI Reason Bubble */}
            {aiReason && (
              <div className="absolute -left-4 -bottom-8 md:-left-24 md:bottom-8 bg-white p-3 rounded-2xl rounded-tr-none shadow-lg border-2 border-rose-200 max-w-[160px] text-xs md:text-sm text-rose-600 animate-in slide-in-from-bottom-2 fade-in duration-300 z-20 transform -rotate-6">
                {aiReason}
              </div>
            )}
          </div>

          <div className="flex flex-col items-center justify-center gap-4 relative w-full mt-2">
            {/* YES — normal document flow, grows via scale */}
            <button
              id="yes-btn"
              ref={yesBtnRef}
              onClick={() => setYesPressed(true)}
              className="rounded-xl bg-rose-400 px-8 py-4 font-black text-white shadow-2xl hover:bg-rose-500 focus:outline-none text-xl whitespace-nowrap z-50 relative"
              style={{
                transform: `scale(${yesScaleX}, ${yesScaleY})`,
                transformOrigin: "center",
                transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                willChange: "transform",
              }}
            >
              Of course! 💕
            </button>

            {/* NO — before first click: normal flow; after: jumps to fixed pos */}
            {(!yesCoversScreen && noCount < 20) && (
              noCount === 0 ? (
                // Initial position — just naturally sitting below Yes
                <button
                  id="no-btn"
                  onClick={handleNoClick}
                  className="rounded-xl bg-amber-400 px-8 py-4 font-bold text-white shadow-lg hover:bg-amber-500 focus:outline-none text-xl relative z-40"
                >
                  No
                </button>
              ) : noPos ? (
                // After clicks: random fixed position dodging Yes
                <button
                  id="no-btn"
                  onClick={handleNoClick}
                  className="rounded-xl bg-amber-400 px-6 py-3 font-bold text-white shadow-lg hover:bg-amber-500 focus:outline-none text-base whitespace-nowrap"
                  style={{
                    position: "fixed",
                    left: noPos.x,
                    top: noPos.y,
                    zIndex: 40,
                  }}
                >
                  {getNoButtonText()}
                </button>
              ) : null
            )}
          </div>

          {/* AI convince button */}
          <button
            id="convince-btn"
            onClick={handleConvinceMe}
            disabled={loadingReason}
            className="mt-2 text-rose-400 hover:text-rose-600 underline decoration-rose-200 underline-offset-4 text-sm font-medium flex items-center gap-1 transition-colors hover:scale-105 transform duration-200"
          >
            {loadingReason
              ? <Loader2 className="animate-spin" size={16} />
              : <Sparkles size={16} />}
            {loadingReason ? "Thinking…" : "Need convincing? ✨"}
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="fixed bottom-4 text-amber-400 text-xs md:text-sm flex gap-1 z-0">
        Made with <Heart size={16} className="fill-rose-400" /> by Mrinal, for Sakshi
      </div>
    </div>
  );
}