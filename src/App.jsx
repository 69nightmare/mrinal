import React, { useState } from "react";
import { Heart, Stars, Sparkles, Send, Loader2, PartyPopper } from "lucide-react";

// ─── Palette A: Warm Gold + Blush ───────────────────────────────────────────
// bg: amber-50 (#FFFBEB)  primary: amber-600  accent: rose-300
// ────────────────────────────────────────────────────────────────────────────

export default function App() {
  const [noCount, setNoCount] = useState(0);
  const [yesPressed, setYesPressed] = useState(false);

  // AI State
  const [aiReason, setAiReason] = useState("");
  const [loadingReason, setLoadingReason] = useState(false);
  const [dateVibe, setDateVibe] = useState("");
  const [datePlan, setDatePlan] = useState("");
  const [loadingPlan, setLoadingPlan] = useState(false);

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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.text || "Couldn't think of something, but the love is real! 💛";
    } catch (error) {
      if (retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
        return callGemini(prompt, retryCount + 1);
      }
      console.error("API Error:", error);
      return "Oops, the birthday connection is weak (API Error). Try again! 🎂";
    }
  };

  // ── "Need a reason to smile?" button ──
  const handleConvinceMe = async () => {
    setLoadingReason(true);
    const prompt =
      "Give me one very short, witty, sweet reason to celebrate Sakshi's birthday today. Max 15 words. Use one emoji. Keep it playful and warm.";
    const text = await callGemini(prompt);
    setAiReason(text);
    setLoadingReason(false);
  };

  // ── Birthday Day Planner for Noida ──
  const handlePlanDate = async () => {
    if (!dateVibe) return;
    setLoadingPlan(true);
    const prompt = `Create a short, sweet 3-step birthday plan in Noida for today with the vibe: "${dateVibe}". Keep each step to 2 sentences max. Use emojis. Format as a simple numbered list (1. 2. 3.).`;
    const text = await callGemini(prompt);
    setDatePlan(text);
    setLoadingPlan(false);
  };

  const handleNoClick = () => {
    setNoCount(noCount + 1);
  };

  const getNoButtonText = () => {
    const phrases = [
      "No",
      "Are you sure?",
      "Really sure?",
      "Think again!",
      "It's my BIRTHDAY! 🎂",
      "Surely not?",
      "You might regret this!",
      "Give it another thought!",
      "Are you absolutely certain?",
      "This could be a mistake!",
      "Have a heart!",
      "Don't be so mean!",
      "Change of heart?",
      "Wouldn't you reconsider?",
      "Is that your final answer?",
      "You're breaking my heart ;(",
      "Plsss? :(",
    ];
    return phrases[Math.min(noCount, phrases.length - 1)];
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-amber-50 selection:bg-amber-200 overflow-hidden font-sans p-4">
      {yesPressed ? (
        // ── Success / Reveal View ──────────────────────────────────────────
        <div className="flex flex-col items-center justify-center gap-6 animate-fade-in w-full max-w-lg text-center">
          {/* Sakshi's photo */}
          <img
            src="/Mri.jpeg"
            alt="A photo of us 💛"
            className="w-full max-w-[200px] md:max-w-[300px] h-auto rounded-xl shadow-lg border-4 border-amber-300 object-cover"
          />

          {/* Main celebration heading */}
          <div className="text-4xl md:text-6xl font-bold text-amber-600 flex items-center justify-center gap-3">
            Yay!!! <PartyPopper className="text-amber-500 animate-bounce" />
          </div>

          {/* Birthday message from Mrinal */}
          <div className="space-y-1 px-2">
            <p className="text-2xl md:text-3xl font-bold text-amber-700">
              Happy Birthday, Sakshi! 🎂
            </p>
            <p className="text-base md:text-lg text-amber-800 font-medium leading-relaxed">
              You deserve all the love in the world today — and every day.
            </p>
            <p className="text-base md:text-lg text-rose-500 font-medium">
              Get ready — your birthday adventure in Noida starts now! 💛
            </p>
            <p className="text-sm text-amber-500 font-semibold mt-1">— Mrinal</p>
          </div>

          {/* AI Birthday Day Planner */}
          <div className="mt-6 bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-xl w-full border border-amber-200">
            <h3 className="text-xl font-bold text-amber-600 mb-2 flex items-center justify-center gap-2">
              <Sparkles size={20} /> Plan My Birthday Day in Noida
            </h3>
            <p className="text-amber-500 text-sm mb-4">
              Enter a vibe (e.g., "café hopping", "spa day", "rooftop dinner") and AI
              will build your perfect birthday plan!
            </p>

            <div className="flex gap-2 mb-4">
              <input
                id="vibe-input"
                type="text"
                value={dateVibe}
                onChange={(e) => setDateVibe(e.target.value)}
                placeholder="What's the vibe?"
                className="flex-1 px-4 py-2 rounded-lg border-2 border-amber-200 focus:border-amber-400 focus:outline-none bg-white/80 text-amber-700 placeholder:text-amber-300"
                onKeyDown={(e) => e.key === "Enter" && handlePlanDate()}
              />
              <button
                id="plan-btn"
                onClick={handlePlanDate}
                disabled={loadingPlan || !dateVibe}
                className="bg-amber-500 text-white p-2 rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loadingPlan ? <Loader2 className="animate-spin" /> : <Send size={20} />}
              </button>
            </div>

            {datePlan && (
              <div
                id="date-plan-result"
                className="text-left bg-white p-4 rounded-xl border border-amber-100 text-amber-800 text-sm md:text-base whitespace-pre-wrap leading-relaxed shadow-inner"
              >
                {datePlan}
              </div>
            )}
          </div>
        </div>
      ) : (
        // ── Question View ─────────────────────────────────────────────────
        <div className="flex flex-col items-center gap-6 w-full max-w-2xl text-center relative z-10">
          <div className="relative">
            <img
              src="https://media.tenor.com/h5jR0eK8pjoAAAAi/cute-bear.gif"
              alt="Cute bear asking"
              className="w-full max-w-[200px] md:max-w-[250px] h-auto rounded-xl shadow-xl border-4 border-white"
            />
            <div className="absolute -top-6 -right-6 animate-pulse text-amber-500">
              <Stars size={40} />
            </div>

            {/* AI Reason Bubble */}
            {aiReason && (
              <div className="absolute -left-4 -bottom-8 md:-left-24 md:bottom-8 bg-white p-3 rounded-2xl rounded-tr-none shadow-lg border-2 border-amber-200 max-w-[160px] text-xs md:text-sm text-amber-700 animate-in slide-in-from-bottom-2 fade-in duration-300 z-20 transform -rotate-6">
                {aiReason}
              </div>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-amber-600 drop-shadow-sm leading-tight px-4">
            Ready for your birthday surprise, Sakshi? 🎂
          </h1>

          <div className="flex flex-wrap justify-center items-center gap-4 w-full px-4">
            {/* Yes button — grows with every No click */}
            <button
              id="yes-btn"
              className="rounded-xl bg-amber-500 px-8 py-4 font-bold text-white shadow-lg hover:bg-amber-600 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-amber-300 active:scale-95 z-50"
              style={{ fontSize: yesButtonSize }}
              onClick={() => setYesPressed(true)}
            >
              Yes! 🎉
            </button>

            <button
              id="no-btn"
              onClick={handleNoClick}
              className="rounded-xl bg-rose-400 px-8 py-4 font-bold text-white shadow-lg hover:bg-rose-500 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-rose-300 active:scale-95 text-xl"
            >
              {noCount === 0 ? "No" : getNoButtonText()}
            </button>
          </div>

          {/* AI "Need a reason to smile?" button */}
          <button
            id="convince-btn"
            onClick={handleConvinceMe}
            disabled={loadingReason}
            className="mt-6 text-amber-500 hover:text-amber-700 underline decoration-amber-300 underline-offset-4 text-sm font-medium flex items-center gap-1 transition-colors hover:scale-105 transform duration-200"
          >
            {loadingReason ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Sparkles size={16} />
            )}
            {loadingReason ? "Thinking..." : "Need a reason to smile? ✨"}
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="fixed bottom-4 text-amber-400 text-xs md:text-sm flex gap-1 z-0">
        Made with <Heart size={16} className="fill-amber-400" /> by Mrinal, for Sakshi
      </div>
    </div>
  );
}