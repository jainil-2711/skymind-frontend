import { useState, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "../lib/api";
import { airports } from "../data/airports";

interface ItineraryLeg {
  order: number;
  origin_iata: string;
  destination_iata: string;
  depart_date: string;
  duration_min: number;
  estimated_price_usd: number;
  cabin_class: string;
  notes: string | null;
}

interface Itinerary {
  id: string;
  prompt: string;
  destinations: ItineraryLeg[];
  total_budget_usd: number;
  duration_days: number;
  llm_model: string | null;
  created_at: string;
  total_legs: number;
  total_estimated_price_usd: number;
  total_duration_min: number;
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function cityName(iata: string): string {
  return airports[iata] ?? iata;
}

function buildRevealText(itinerary: Itinerary): string {
  const route = itinerary.destinations
    .map((d, i) => {
      if (i === 0) return `${d.origin_iata} → ${d.destination_iata}`;
      return d.destination_iata;
    })
    .join(" → ");
  return `${route}  ·  ${itinerary.total_legs} legs  ·  $${itinerary.total_estimated_price_usd.toFixed(0)} estimated  ·  ${itinerary.duration_days} days`;
}

function RevealText({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState("");
  const indexRef = useRef(0);

  useEffect(() => {
    indexRef.current = 0;
    const interval = setInterval(() => {
      if (indexRef.current >= text.length) {
        clearInterval(interval);
        return;
      }
      setDisplayed(text.slice(0, indexRef.current + 1));
      indexRef.current += 1;
    }, 18);
    return () => clearInterval(interval);
  }, [text]);

  return (
    <span>
      {displayed}
      {displayed.length < text.length && (
        <span className="animate-pulse text-[#525252]">|</span>
      )}
    </span>
  );
}

function Timeline({ itinerary }: { itinerary: Itinerary }) {
  return (
    <div className="mt-6">
      {itinerary.destinations.map((leg, i) => (
        <div key={leg.order} className="flex gap-4">
          {/* Dot and line */}
          <div className="flex flex-col items-center">
            <div className="w-2 h-2 rounded-full bg-white flex-shrink-0 mt-1" />
            {i < itinerary.destinations.length - 1 && (
              <div className="w-px flex-1 bg-[#262626] my-1" />
            )}
          </div>

          {/* Leg content */}
          <div className="pb-6 flex-1">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-lg font-bold text-white">{leg.origin_iata}</span>
              <span className="text-[#525252] text-sm">→</span>
              <span className="text-lg font-bold text-white">{leg.destination_iata}</span>
              <span className="text-xs text-[#525252]">
                {cityName(leg.origin_iata)} → {cityName(leg.destination_iata)}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-[#525252] flex-wrap">
              <span>{leg.depart_date}</span>
              <span>·</span>
              <span>{formatDuration(leg.duration_min)}</span>
              <span>·</span>
              <span className="capitalize">{leg.cabin_class.toLowerCase()}</span>
              <span>·</span>
              <span className="text-white font-medium">${leg.estimated_price_usd.toFixed(0)}</span>
            </div>
            {leg.notes && (
              <p className="text-xs text-[#525252] mt-1 italic">{leg.notes}</p>
            )}
          </div>
        </div>
      ))}

      {/* Totals bar */}
      <div className="border-t border-[#171717] pt-4 mt-2 flex items-center gap-6 flex-wrap">
        <div>
          <span className="text-xs text-[#525252] uppercase tracking-widest">Total Cost</span>
          <p className="text-white font-bold">${itinerary.total_estimated_price_usd.toFixed(0)}</p>
        </div>
        <div>
          <span className="text-xs text-[#525252] uppercase tracking-widest">Duration</span>
          <p className="text-white font-bold">{formatDuration(itinerary.total_duration_min)}</p>
        </div>
        <div>
          <span className="text-xs text-[#525252] uppercase tracking-widest">Legs</span>
          <p className="text-white font-bold">{itinerary.total_legs}</p>
        </div>
        <div>
          <span className="text-xs text-[#525252] uppercase tracking-widest">Days</span>
          <p className="text-white font-bold">{itinerary.duration_days}</p>
        </div>
        {itinerary.llm_model && (
          <div className="ml-auto">
            <span className="text-xs text-[#525252]">via {itinerary.llm_model}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PlannerPage() {
  const [prompt, setPrompt] = useState("");
  const [budgetUsd, setBudgetUsd] = useState("");
  const [durationDays, setDurationDays] = useState("");
  const [result, setResult] = useState<Itinerary | null>(null);

  const { mutate, isPending, error, reset } = useMutation({
    mutationFn: async () => {
      const body: Record<string, unknown> = { prompt };
      if (budgetUsd.trim()) body.budget_usd = parseFloat(budgetUsd);
      if (durationDays.trim()) body.duration_days = parseInt(durationDays);
      const res = await api.post("/planner/generate", body);
      return res.data.data as Itinerary;
    },
    onSuccess: (data) => setResult(data),
    onError: () => setResult(null),
  });

  const isRateLimit =
    error && (error as { response?: { status?: number } }).response?.status === 429;

  const canSubmit = prompt.trim().length > 0 && !isPending;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    reset();
    setResult(null);
    mutate();
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      {/* Heading */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-1">AI Planner</h1>
        <p className="text-sm text-[#525252]">
          Describe your trip in plain language — we'll build the itinerary
        </p>
      </div>

      {/* Form */}
      <div className="border border-[#171717] bg-[#0a0a0a] p-6 mb-8">
        <form onSubmit={handleSubmit}>
          {/* Prompt */}
          <div className="mb-6">
            <label className="block text-xs text-[#525252] uppercase tracking-widest mb-2">
              Your Trip
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="10 days in Europe from Dubai, visit London, Paris and Rome, economy class, budget $2000"
              rows={4}
              className="w-full bg-black border border-[#262626] text-white px-4 py-3 placeholder-[#525252] focus:outline-none focus:border-white transition-colors text-sm resize-none"
            />
            <p className="text-xs text-[#525252] mt-1">
              {prompt.length} characters
            </p>
          </div>

          {/* Optional fields */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <label className="block text-xs text-[#525252] uppercase tracking-widest mb-2">
                Budget (USD) — optional
              </label>
              <input
                type="number"
                min="1"
                value={budgetUsd}
                onChange={(e) => setBudgetUsd(e.target.value)}
                placeholder="2000"
                className="w-full bg-black border border-[#262626] text-white px-4 py-3 placeholder-[#525252] focus:outline-none focus:border-white transition-colors text-sm"
                style={{ colorScheme: "dark" }}
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-[#525252] uppercase tracking-widest mb-2">
                Duration (days) — optional
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
                placeholder="10"
                className="w-full bg-black border border-[#262626] text-white px-4 py-3 placeholder-[#525252] focus:outline-none focus:border-white transition-colors text-sm"
                style={{ colorScheme: "dark" }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full py-3 bg-white text-black font-semibold text-sm tracking-wide hover:bg-[#e5e5e5] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? "Planning your trip..." : "Generate Itinerary"}
          </button>
        </form>
      </div>

      {/* Loading state */}
      {isPending && (
        <div className="border border-[#171717] bg-[#0a0a0a] p-8 text-center">
          <div className="flex items-center justify-center gap-2 text-[#525252] text-sm">
            <span className="animate-pulse">●</span>
            <span>AI is planning your trip</span>
            <span className="animate-pulse">●</span>
          </div>
        </div>
      )}

      {/* Rate limit error */}
      {isRateLimit && !isPending && (
        <div className="border border-[#d97706] bg-[#0a0a0a] p-6 text-center">
          <p className="text-[#d97706] text-sm font-medium mb-1">Rate limit reached</p>
          <p className="text-[#525252] text-xs">
            This endpoint allows 5 requests per minute. Please wait and try again.
          </p>
        </div>
      )}

      {/* General error */}
      {error && !isPending && !isRateLimit && (
        <div className="border border-[#dc2626] bg-[#0a0a0a] p-6 text-center">
          <p className="text-[#dc2626] text-sm font-medium mb-1">Generation failed</p>
          <p className="text-[#525252] text-xs">Please try again with a different prompt</p>
        </div>
      )}

      {/* Result */}
      {result && !isPending && (
        <div className="border border-[#171717] bg-[#0a0a0a] p-6">
          {/* Reveal header */}
          <div className="mb-6 pb-6 border-b border-[#171717]">
            <p className="text-xs text-[#525252] uppercase tracking-widest mb-2">
              Your Itinerary
            </p>
            <p className="text-white font-medium text-sm">
              <RevealText text={buildRevealText(result)} />
            </p>
            <p className="text-xs text-[#525252] mt-2 italic">"{result.prompt}"</p>
          </div>

          {/* Timeline */}
          <Timeline itinerary={result} />
        </div>
      )}
    </div>
  );
}