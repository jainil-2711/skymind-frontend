import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "../lib/api";
import { DestinationRow } from "../components/ui/DestinationRow";
import type { Destination } from "../components/ui/DestinationRow";
import { airports } from "../data/airports";

const REGIONS = [
  "All Regions",
  "Middle East",
  "Europe",
  "South Asia",
  "Africa",
  "East Asia",
  "Americas",
  "Oceania",
];

function SkeletonRow() {
  return (
    <div className="border border-[#171717] bg-[#0a0a0a] p-5">
      <div className="flex items-start gap-5">
        <div className="w-8 h-8 bg-[#171717] shimmer flex-shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="h-5 w-36 bg-[#171717] shimmer" />
          <div className="h-3 w-52 bg-[#171717] shimmer" />
          <div className="space-y-2 pt-1">
            <div className="h-[2px] w-full bg-[#171717] shimmer" />
            <div className="h-[2px] w-full bg-[#171717] shimmer" />
            <div className="h-[2px] w-full bg-[#171717] shimmer" />
          </div>
        </div>
        <div className="flex-shrink-0 space-y-1">
          <div className="h-8 w-10 bg-[#171717] shimmer" />
          <div className="h-3 w-8 bg-[#171717] shimmer" />
        </div>
      </div>
    </div>
  );
}

export default function InspirePage() {
  const [originIata, setOriginIata] = useState("");
  const [budgetUsd, setBudgetUsd] = useState("");
  const [durationDays, setDurationDays] = useState("");
  const [region, setRegion] = useState("All Regions");
  const [results, setResults] = useState<Destination[] | null>(null);
  const [meta, setMeta] = useState<Record<string, unknown> | null>(null);

  const { mutate, isPending, error, reset } = useMutation({
    mutationFn: async () => {
      const body: Record<string, unknown> = {
        origin_iata: originIata.toUpperCase(),
        budget_usd: parseFloat(budgetUsd),
      };
      if (durationDays.trim()) body.duration_days = parseInt(durationDays);
      if (region !== "All Regions") body.region = region;

      const res = await api.post("/destinations/inspire", body);
      return res.data;
    },
    onSuccess: (data) => {
      setResults(data.data as Destination[]);
      setMeta(data.meta as Record<string, unknown>);
    },
    onError: () => {
      setResults(null);
      setMeta(null);
    },
  });

  const originCity = airports[originIata.toUpperCase()];

  const isRateLimit =
    error && (error as { response?: { status?: number } }).response?.status === 429;

  const canSubmit =
    originIata.trim().length === 3 &&
    budgetUsd.trim().length > 0 &&
    parseFloat(budgetUsd) > 0 &&
    !isPending;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    reset();
    setResults(null);
    setMeta(null);
    mutate();
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      {/* Heading */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
          Inspire Me
        </h1>
        <p className="text-sm text-[#525252]">
          Enter your budget and origin — we'll find where you can go
        </p>
      </div>

      {/* Form */}
      <div className="border border-[#171717] bg-[#0a0a0a] p-6 mb-8">
        <form onSubmit={handleSubmit}>
          {/* Origin + Budget row */}
          <div className="flex gap-4 mb-6">
            {/* Origin */}
            <div className="flex-1">
              <label className="block text-xs text-[#525252] uppercase tracking-widest mb-2">
                From
              </label>
              <input
                type="text"
                maxLength={3}
                value={originIata}
                onChange={(e) => setOriginIata(e.target.value.toUpperCase())}
                placeholder="DXB"
                className="w-full bg-black border border-[#262626] text-white text-2xl font-bold tracking-widest px-4 py-3 uppercase placeholder-[#525252] focus:outline-none focus:border-white transition-colors"
              />
              <p className="text-xs text-[#525252] mt-1 h-4">{originCity ?? ""}</p>
            </div>

            {/* Budget */}
            <div className="flex-1">
              <label className="block text-xs text-[#525252] uppercase tracking-widest mb-2">
                Budget (USD)
              </label>
              <input
                type="number"
                min="1"
                value={budgetUsd}
                onChange={(e) => setBudgetUsd(e.target.value)}
                placeholder="2000"
                className="w-full bg-black border border-[#262626] text-white text-2xl font-bold px-4 py-3 placeholder-[#525252] focus:outline-none focus:border-white transition-colors"
                style={{ colorScheme: "dark" }}
              />
              <p className="text-xs text-[#525252] mt-1 h-4">total trip budget</p>
            </div>
          </div>

          {/* Duration + Region row */}
          <div className="flex gap-4 mb-6">
            {/* Duration */}
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
                placeholder="7"
                className="w-full bg-black border border-[#262626] text-white px-4 py-3 placeholder-[#525252] focus:outline-none focus:border-white transition-colors text-sm"
                style={{ colorScheme: "dark" }}
              />
            </div>

            {/* Region */}
            <div className="flex-1">
              <label className="block text-xs text-[#525252] uppercase tracking-widest mb-2">
                Region — optional
              </label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full bg-black border border-[#262626] text-white px-4 py-3 focus:outline-none focus:border-white transition-colors text-sm appearance-none"
              >
                {REGIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full py-3 bg-white text-black font-semibold text-sm tracking-wide hover:bg-[#e5e5e5] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? "Finding destinations..." : "Find Destinations"}
          </button>
        </form>
      </div>

      {/* Meta info bar */}
      {meta && results && results.length > 0 && (
        <div className="flex items-center gap-4 mb-6 text-xs text-[#525252]">
          <span>
            Showing{" "}
            <span className="text-white font-medium">{results.length}</span>{" "}
            destinations
          </span>
          <span>·</span>
          <span>
            Scored from{" "}
            <span className="text-white font-medium">
              {meta.total_candidates as number}
            </span>{" "}
            candidates
          </span>
          <span>·</span>
          <span>Sorted by composite score</span>
        </div>
      )}

      {/* Loading skeletons */}
      {isPending && (
        <div className="space-y-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      )}

      {/* Rate limit error */}
      {isRateLimit && !isPending && (
        <div className="border border-[#d97706] bg-[#0a0a0a] p-6 text-center">
          <p className="text-[#d97706] text-sm font-medium mb-1">
            Rate limit reached
          </p>
          <p className="text-[#525252] text-xs">
            This endpoint allows 20 requests per minute. Please wait and try
            again.
          </p>
        </div>
      )}

      {/* General error */}
      {error && !isPending && !isRateLimit && (
        <div className="border border-[#dc2626] bg-[#0a0a0a] p-6 text-center">
          <p className="text-[#dc2626] text-sm font-medium mb-1">
            Request failed
          </p>
          <p className="text-[#525252] text-xs">
            Check your origin code and try again
          </p>
        </div>
      )}

      {/* Empty state */}
      {results && results.length === 0 && !isPending && (
        <div className="border border-[#171717] bg-[#0a0a0a] p-10 text-center">
          <p className="text-white text-sm font-medium mb-1">
            No destinations found
          </p>
          <p className="text-[#525252] text-xs">
            Try increasing your budget or removing the region filter
          </p>
        </div>
      )}

      {/* Results */}
      {!isPending && results && results.length > 0 && (
        <div className="space-y-3">
          {results.map((destination, i) => (
            <DestinationRow
              key={destination.iata}
              destination={destination}
              index={i}
            />
          ))}
        </div>
      )}
    </div>
  );
}