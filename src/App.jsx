import React, { useState, useMemo } from "react";
import { Heart, Stars, Sparkles, Send, Loader2, PartyPopper, Calendar, Clock } from "lucide-react";

// ─── Palette A: Warm Gold + Blush ───────────────────────────────────────────
// bg: amber-50  primary: amber-600  accent: rose-400
// ────────────────────────────────────────────────────────────────────────────

export default function App() {
  const [noCount, setNoCount] = useState(0);
  const [yesPressed, setYesPressed] = useState(false);

  // AI State
  const [aiReason, setAiReason]       = useState("");
  const [loadingReason, setLoadingReason] = useState(false);

  // Date planner — now takes date + time instead of a vibe string
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [datePlan, setDatePlan]         = useState(null); // { romantic, fun, cozy }
  const [loadingPlan, setLoadingPlan]   = useState(false);

  // Starts at 20px to match the No button, then grows with each No click
  const yesButtonSize = noCount * 20 + 20;

  // ── Secure API helper — routes through /api/gemini serverless function ──
  const callGemini = async (prompt, retryCount = 0) => {
    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return data.text || "Couldn't think of something, but the love is real! 💛";
    } catch (error) {
      if (retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
        return callGemini(prompt, retryCount + 1);
      }
      console.error("API Error:", error);
      return "Oops, something went wrong. Try again! 💛";
    }
  };

  // ── "Need convincing?" button — Mrinal convinces Sakshi, romantic & cheesy ──
  const handleConvinceMe = async () => {
    setLoadingReason(true);
    const prompt =
      "You are Mrinal, deeply in love with his wife Sakshi. Write ONE line that Mrinal says directly to Sakshi to convince her she loves him back. " +
      "Be romantic, corny, over-the-top cheesy, and personal — like a Bollywood hero. " +
      "Address her directly as 'Sakshi'. Max 20 words. End with exactly one emoji. " +
      "Examples of the tone: 'Sakshi, you are the reason my heart has Wi-Fi 💕', 'Sakshi, even my heartbeat spells your name 🥺'. " +
      "Now write a DIFFERENT, fresh, equally cheesy line.";
    const text = await callGemini(prompt);
    setAiReason(text);
    setLoadingReason(false);
  };

  // ── 75 "No" button phrases — shuffled randomly on every page load ──
  const shuffledNoPhrases = useMemo(() => {
    const pool = [
      "Are you sure? 🥺",
      "Really sure?",
      "Think again!",
      "But… I love you! 💕",
      "Please? 🙏",
      "That can't be right!",
      "Give it another thought!",
      "Are you absolutely certain?",
      "You'll hurt my feelings 😢",
      "Have a heart!",
      "Don't be so cold!",
      "Change of heart? 💛",
      "Wouldn't you reconsider?",
      "Is that your final answer?",
      "You're breaking my heart ;(",
      "Plsss? :(",
      "But I made chai for you! ☕",
      "Okay but… what if yes? 🤔",
      "My heart says otherwise 💔",
      "Even the stars say yes ✨",
      "Try the other button 😅",
      "Wrong button, surely?",
      "The WiFi says yes 📶",
      "Ek baar aur soch lo",
      "Arey yaar! 😩",
      "Main ro dunga 😭",
      "You're my favourite person!",
      "Google Maps says go together 🗺️",
      "My mom likes you 😅",
      "But I remembered your birthday! 🎂",
      "I'll make Maggi for you 🍜",
      "Last chance, I promise!",
      "Even the moon is judging you 🌙",
      "Plot twist: click Yes",
      "Error 404: No not found 🤖",
      "Are you pranking me? 😏",
      "My heart just skipped 💓",
      "Ek chance toh do yaar",
      "Even Alexa agrees with me 😂",
      "Retry? 🔄",
      "Nahi toh nahi… but please?",
      "I googled it: Yes is better",
      "Press Yes for good luck 🍀",
      "What if I said please nicely? 🥹",
      "This button is broken, try Yes",
      "But I'm really cute tho 🐻",
      "Even Siri agrees with me 📱",
      "You're making the bear cry 🐻",
      "The stars aligned for Yes ⭐",
      "Main wait karoonga… forever",
      "Still here. Still hoping. 💕",
      "Your heart knows the answer",
      "Dil toh pagal hai 🎵",
      "Ab toh haan bol do!",
      "I'll never stop asking 😄",
      "You're legally obligated to say Yes",
      "Science says love > No 🔬",
      "My plants believe in us 🌿",
      "Destiny called. It wants Yes.",
      "Tum hi ho 🎵",
      "The universe is watching 👀",
      "Say yes and I'll do dishes 🍽️",
      "Yes = unlimited hugs 🤗",
      "You're my person, you know that?",
      "Meri jaan, please? 🥹",
      "Fine. But I'll be sad. 😔",
      "Plot twist: you always meant Yes",
      "I'll write a poem if you say Yes",
      "Okay last time. Promise. Maybe. 😅",
      "You're literally my sunshine ☀️",
      "Even traffic agrees with me 🚗",
      "Zindagi na milegi dobara 🎬",
      "I saved your favourite snack for this",
      "This button is working against us 😤",
      "Pehli fursat mein haan bol do",
      "Okay but consider: Yes 🌸"
    ];
    // Fisher-Yates shuffle
    const arr = [...pool];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, []); // shuffled once on mount, stable for the session

  // ── Parse AI response into 3 date idea cards ──
  const parseThreePlans = (raw) => {
    // Try to split on the emoji section headers
    const sections = { romantic: "", fun: "", cozy: "" };
    const blocks = raw.split(/\n(?=💕|🎉|☕)/);
    blocks.forEach((block) => {
      const trimmed = block.trim();
      if (trimmed.startsWith("💕")) sections.romantic = trimmed.replace(/^💕\s*(Romantic:?)?/i, "💕 Romantic\n").trim();
      else if (trimmed.startsWith("🎉")) sections.fun = trimmed.replace(/^🎉\s*(Fun:?)?/i, "🎉 Fun\n").trim();
      else if (trimmed.startsWith("☕")) sections.cozy = trimmed.replace(/^☕\s*(Cozy:?)?/i, "☕ Cozy\n").trim();
    });
    // Fallback: if parsing failed, dump everything into romantic
    if (!sections.romantic && !sections.fun && !sections.cozy) {
      sections.romantic = raw;
    }
    return sections;
  };

  // ── Birthday Date Planner — picks date + time, returns 3 idea types ──
  const handlePlanDate = async () => {
    if (!selectedDate || !selectedTime) return;
    setLoadingPlan(true);

    // Format date nicely e.g. "Saturday, 6 September 2026"
    const dateObj = new Date(`${selectedDate}T${selectedTime}`);
    const formattedDate = dateObj.toLocaleDateString("en-IN", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    });
    const formattedTime = dateObj.toLocaleTimeString("en-IN", {
      hour: "2-digit", minute: "2-digit", hour12: true,
    });

    const prompt = `Generate 3 birthday date ideas in Noida or Delhi for ${formattedDate} starting at ${formattedTime}.
Give one of each type. For every idea mention a SPECIFIC real place in Noida or Delhi, what to do there, and timing details. Keep each idea to 3 sentences max. Use emojis.

Format your reply EXACTLY like this (keep the emoji headers):

💕 Romantic:
[your idea here]

🎉 Fun:
[your idea here]

☕ Cozy:
[your idea here]`;

    const raw = await callGemini(prompt);
    setDatePlan(parseThreePlans(raw));
    setLoadingPlan(false);
  };

  const handleNoClick = () => setNoCount(noCount + 1);

  const getNoButtonText = () => {
    if (noCount === 0) return "No";
    // After first click cycle through the shuffled pool; clamp at last item
    return shuffledNoPhrases[Math.min(noCount - 1, shuffledNoPhrases.length - 1)];
  };

  // ── Date card config ──
  const cardConfig = {
    romantic: { label: "💕 Romantic",  border: "border-rose-200",  bg: "bg-rose-50",  heading: "text-rose-600"  },
    fun:      { label: "🎉 Fun",        border: "border-amber-200", bg: "bg-amber-50", heading: "text-amber-600" },
    cozy:     { label: "☕ Cozy",       border: "border-green-200", bg: "bg-green-50", heading: "text-green-700" },
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-amber-50 selection:bg-amber-200 overflow-hidden font-sans p-4">
      {yesPressed ? (
        // ── Success / Birthday Reveal View ────────────────────────────────
        <div className="flex flex-col items-center justify-center gap-6 animate-fade-in w-full max-w-lg text-center pb-12">

          {/* Photo */}
          <img
            src="/Mri.jpeg"
            alt="A photo of us 💛"
            className="w-full max-w-[200px] md:max-w-[300px] h-auto rounded-xl shadow-lg border-4 border-amber-300 object-cover"
          />

          {/* Celebration heading */}
          <div className="text-4xl md:text-6xl font-bold text-amber-600 flex items-center justify-center gap-3">
            Yay!!! <PartyPopper className="text-amber-500 animate-bounce" />
          </div>

          {/* Birthday message from Mrinal */}
          <div className="space-y-2 px-2">
            <p className="text-2xl md:text-3xl font-bold text-amber-700">
              Happy Birthday, Sakshi! 🎂
            </p>
            <p className="text-base md:text-lg text-amber-800 font-medium leading-relaxed">
              You deserve all the love in the world today — and every single day. ✨
            </p>
            <p className="text-base md:text-lg text-rose-500 font-medium">
              I love you more than words. Now let's make today unforgettable! 💛
            </p>
            <p className="text-sm text-amber-500 font-semibold mt-1">— Mrinal</p>
          </div>

          {/* ── Date Planner ── */}
          <div className="mt-4 bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-xl w-full border border-amber-200">
            <h3 className="text-xl font-bold text-amber-600 mb-1 flex items-center justify-center gap-2">
              <Sparkles size={20} /> Plan Our Date in Noida / Delhi
            </h3>
            <p className="text-amber-500 text-sm mb-5">
              Pick a date & time — I'll give you 3 ideas: Romantic 💕, Fun 🎉, and Cozy ☕
            </p>

            {/* Date + Time inputs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="flex items-center gap-2 flex-1 border-2 border-amber-200 rounded-lg px-3 py-2 bg-white/80 focus-within:border-amber-400 transition-colors">
                <Calendar size={16} className="text-amber-400 shrink-0" />
                <input
                  id="date-input"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="flex-1 bg-transparent focus:outline-none text-amber-700 text-sm"
                />
              </div>
              <div className="flex items-center gap-2 flex-1 border-2 border-amber-200 rounded-lg px-3 py-2 bg-white/80 focus-within:border-amber-400 transition-colors">
                <Clock size={16} className="text-amber-400 shrink-0" />
                <input
                  id="time-input"
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
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
                    <div
                      key={key}
                      className={`p-4 rounded-xl border-2 ${cfg.border} ${cfg.bg} shadow-sm`}
                    >
                      <p className={`font-bold text-sm mb-1 ${cfg.heading}`}>{cfg.label}</p>
                      <p className="text-gray-700 text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                        {datePlan[key]
                          .replace(/^💕\s*Romantic\n/i, "")
                          .replace(/^🎉\s*Fun\n/i, "")
                          .replace(/^☕\s*Cozy\n/i, "")
                          .trim()}
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
        <div className="flex flex-col items-center gap-6 w-full max-w-2xl text-center relative z-10">
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

          <h1 className="text-4xl md:text-5xl font-extrabold text-rose-500 drop-shadow-sm leading-tight px-4">
            Sakshi… do you love me? 🥺
          </h1>

          <div className="flex flex-wrap justify-center items-center gap-4 w-full px-4">
            {/* Yes button — grows with every No click */}
            <button
              id="yes-btn"
              className="rounded-xl bg-rose-400 px-8 py-4 font-bold text-white shadow-lg hover:bg-rose-500 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-rose-300 active:scale-95 z-50"
              style={{ fontSize: yesButtonSize }}
              onClick={() => setYesPressed(true)}
            >
              Of course! 💕
            </button>

            <button
              id="no-btn"
              onClick={handleNoClick}
              className="rounded-xl bg-amber-400 px-8 py-4 font-bold text-white shadow-lg hover:bg-amber-500 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-amber-300 active:scale-95 text-xl"
            >
              {noCount === 0 ? "No" : getNoButtonText()}
            </button>
          </div>

          {/* AI "Need convincing?" button */}
          <button
            id="convince-btn"
            onClick={handleConvinceMe}
            disabled={loadingReason}
            className="mt-6 text-rose-400 hover:text-rose-600 underline decoration-rose-200 underline-offset-4 text-sm font-medium flex items-center gap-1 transition-colors hover:scale-105 transform duration-200"
          >
            {loadingReason ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Sparkles size={16} />
            )}
            {loadingReason ? "Thinking..." : "Need convincing? ✨"}
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