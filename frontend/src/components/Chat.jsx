"use client";
import { useEffect, useRef, useState } from "react";
import { useAIStore } from "@/store/aiStore";
import { formatINR } from "@/lib/format";
import { addToCartWithToast } from "./Card";

const SUGGESTIONS = [
  "Outfit for a girl at a wedding in Hyderabad",
  "Boy, college fest, something casual",
  "Eid outfit for a boy",
  "Formal look for a client meeting, I'm a girl",
];

// Renders **bold** segments from the assistant text without using innerHTML.
const Rich = ({ text }) =>
  text.split("\n").map((line, i) => (
    <p key={i} className={line ? "" : "h-2"}>
      {line.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
        part.startsWith("**") ? <strong key={j}>{part.slice(2, -2)}</strong> : <span key={j}>{part}</span>
      )}
    </p>
  ));

export const Chat = ({ close }) => {
  const { getFashionRecommendation, fashionLoading } = useAIStore();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hi! I'm Aizy's AI stylist. Tell me who it's for and the occasion, and I'll suggest outfits." },
  ]);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView?.({ behavior: "smooth", block: "end" });
  }, [messages, fashionLoading]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && close(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  const send = async (text) => {
    const prompt = (text ?? input).trim();
    if (!prompt || fashionLoading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: prompt }]);
    try {
      const res = await getFashionRecommendation(prompt);
      setMessages((m) => [
        ...m,
        { role: "ai", text: res.recommendation || "I couldn't find a match.", products: res.products || [] },
      ]);
    } catch (err) {
      setMessages((m) => [...m, { role: "ai", error: true, text: err.message }]);
    }
  };

  return (
    <div className="fixed inset-0 sm:inset-auto sm:bottom-24 sm:right-6 z-[70] sm:w-[400px] sm:h-[600px] sm:max-h-[80vh] bg-[#fffcf6] sm:rounded-2xl shadow-2xl border border-[#3c6ca8]/20 flex flex-col overflow-hidden" role="dialog" aria-label="AI stylist">
      <div className="flex items-center justify-between px-4 py-3 bg-[#3c6ca8] text-white">
        <div>
          <p className="font-semibold">AI Stylist</p>
          <p className="text-xs opacity-80">Outfit ideas for any occasion</p>
        </div>
        <button onClick={() => close(false)} aria-label="Close chat" className="w-8 h-8 rounded-full hover:bg-white/20">✕</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3" aria-live="polite">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${m.role === "user" ? "bg-[#3c6ca8] text-white rounded-br-sm" : m.error ? "bg-red-50 text-red-700 border border-red-200 rounded-bl-sm" : "bg-white text-gray-800 border border-[#3c6ca8]/15 rounded-bl-sm"}`}>
              <Rich text={m.text} />
              {m.products?.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {m.products.map((p) => (
                    <li key={p._id} className="flex items-center gap-2 bg-[#fffcf6] border border-[#3c6ca8]/15 rounded-xl p-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.image} alt="" className="w-12 h-12 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800 truncate">{p.name}</p>
                        <p className="text-xs text-[#3c6ca8] font-semibold">{formatINR(p.price)}</p>
                      </div>
                      <button onClick={() => addToCartWithToast(p)} disabled={p.count <= 0} className="text-xs px-2.5 py-1.5 rounded-lg bg-[#3c6ca8] text-white hover:bg-[#2c5f8c] disabled:bg-gray-300">Add</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
        {fashionLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-[#3c6ca8]/15 rounded-2xl px-4 py-3 flex gap-1" aria-label="Thinking">
              {[0, 1, 2].map((d) => (
                <span key={d} className="w-2 h-2 rounded-full bg-[#3c6ca8]/60 animate-bounce" style={{ animationDelay: `${d * 120}ms` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {messages.length === 1 && (
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button key={s} onClick={() => send(s)} className="text-xs px-3 py-1.5 rounded-full border border-[#3c6ca8]/30 text-[#3c6ca8] hover:bg-[#3c6ca8]/10 text-left">{s}</button>
          ))}
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); send(); }} className="p-3 border-t border-[#3c6ca8]/15 flex gap-2 bg-white">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={500}
          placeholder="e.g. girl, birthday party"
          aria-label="Describe the occasion"
          className="flex-1 px-3 py-2 rounded-lg border border-[#3c6ca8]/30 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#3c6ca8]"
        />
        <button type="submit" disabled={fashionLoading || !input.trim()} className="px-4 py-2 rounded-lg bg-[#3c6ca8] text-white text-sm font-semibold hover:bg-[#2c5f8c] disabled:opacity-50">Send</button>
      </form>
    </div>
  );
};
