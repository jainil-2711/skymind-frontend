import { useState, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "../lib/api";
import { FlightCard } from "../components/ui/FlightCard";
import type { Flight } from "../components/ui/FlightCard";
import { airports } from "../data/airports";

type SortKey = "score" | "price" | "duration";

const CABIN_OPTIONS = ["economy", "business", "first"] as const;

function parseDurationMin(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return 0;
  return (parseInt(match[1] ?? "0") * 60) + parseInt(match[2] ?? "0");
}

function SkeletonCard() {
  return (
    <div className="border border-[#171717] bg-[#0a0a0a] p-5">
      <div className="flex items-center gap-6">
        <div className="w-[68px] h-[68px] rounded-full bg-[#171717] shimmer flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-6 w-40 bg-[#171717] shimmer" />
          <div className="h-4 w-64 bg-[#171717] shimmer" />
        </div>
        <div className="flex-shrink-0 space-y-2">
          <div className="h-6 w-20 bg-[#171717] shimmer" />
          <div className="h-3 w-12 bg-[#171717] shimmer ml-auto" />
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [cabin, setCabin] = useState<"economy" | "business" | "first">("economy");
  const [passengers, setPassengers] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>("score");
  const [results, setResults] = useState<Flight[] | null>(null);

  const { mutate, isPending, error, reset } = useMutation({
    mutationFn: async () => {
      const res = await api.post("/flights/search", {
        origin: origin.toUpperCase(),
        destination: destination.toUpperCase(),
        departure_date: date,
        passengers,
        cabin_class: cabin,
      });
      return res.data.data as Flight[];
    },
    onSuccess: (data) => setResults(data),
    onError: () => setResults(null),
  });

  const sorted = useMemo(() => {
    if (!results) return [];
    return [...results].sort((a, b) => {
      if (sortKey === "score") return b.score - a.score;
      if (sortKey === "price") return parseFloat(a.price.total) - parseFloat(b.price.total);
      return parseDurationMin(a.itineraries[0].duration) - parseDurationMin(b.itineraries[0].duration);
    });
  }, [results, sortKey]);

  const originCity = airports[origin.toUpperCase()];
  const destCity = airports[destination.toUpperCase()];

  const canSubmit =
    origin.trim().length === 3 &&
    destination.trim().length === 3 &&
    date.length > 0 &&
    !isPending;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    reset();
    setResults(null);
    mutate();
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Flight Search</h1>
        <p className="text-sm text-[#525252]">Enter IATA codes to find and score flights</p>
      </div>

      <div className="border border-[#171717] bg-[#0a0a0a] p-6 mb-8">
        <form onSubmit={handleSubmit}>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <label className="block text-xs text-[#525252] uppercase tracking-widest mb-2">From</label>
              <input
                type="text"
                maxLength={3}
                value={origin}
                onChange={(e) => setOrigin(e.target.value.toUpperCase())}
                placeholder="DXB"
                className="w-full bg-black border border-[#262626] text-white text-2xl font-bold tracking-widest px-4 py-3 uppercase placeholder-[#525252] focus:outline-none focus:border-white transition-colors"
              />
              <p className="text-xs text-[#525252] mt-1 h-4">{originCity ?? ""}</p>
            </div>

            <div className="flex items-center pt-6 text-[#525252] text-xl">→</div>

            <div className="flex-1">
              <label className="block text-xs text-[#525252] uppercase tracking-widest mb-2">To</label>
              <input
                type="text"
                maxLength={3}
                value={destination}
                onChange={(e) => setDestination(e.target.value.toUpperCase())}
                placeholder="LHR"
                className="w-full bg-black border border-[#262626] text-white text-2xl font-bold tracking-widest px-4 py-3 uppercase placeholder-[#525252] focus:outline-none focus:border-white transition-colors"
              />
              <p className="text-xs text-[#525252] mt-1 h-4">{destCity ?? ""}</p>
            </div>
          </div>

          <div className="flex gap-4 mb-6 flex-wrap">
            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs text-[#525252] uppercase tracking-widest mb-2">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-black border border-[#262626] text-white px-4 py-3 focus:outline-none focus:border-white transition-colors text-sm"
                style={{ colorScheme: "dark" }}
              />
            </div>

            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs text-[#525252] uppercase tracking-widest mb-2">Cabin</label>
              <select
                value={cabin}
                onChange={(e) => setCabin(e.target.value as typeof cabin)}
                className="w-full bg-black border border-[#262626] text-white px-4 py-3 focus:outline-none focus:border-white transition-colors text-sm appearance-none"
              >
                {CABIN_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-[#525252] uppercase tracking-widest mb-2">Passengers</label>
              <div className="flex items-center border border-[#262626] h-[46px]">
                <button
                  type="button"
                  onClick={() => setPassengers((p) => Math.max(1, p - 1))}
                  className="px-4 h-full text-white hover:bg-[#171717] transition-colors text-lg"
                >
                  −
                </button>
                <span className="px-4 text-white text-sm w-8 text-center">{passengers}</span>
                <button
                  type="button"
                  onClick={() => setPassengers((p) => Math.min(9, p + 1))}
                  className="px-4 h-full text-white hover:bg-[#171717] transition-colors text-lg"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full py-3 bg-white text-black font-semibold text-sm tracking-wide hover:bg-[#e5e5e5] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? "Searching..." : "Search Flights"}
          </button>
        </form>
      </div>

      {results && results.length > 0 && (
        <div className="flex items-center gap-2 mb-6">
          <span className="text-xs text-[#525252] uppercase tracking-widest mr-2">Sort</span>
          {(["score", "price", "duration"] as SortKey[]).map((key) => (
            <button
              key={key}
              onClick={() => setSortKey(key)}
              className={`px-3 py-1 text-xs border transition-colors capitalize ${
                sortKey === key
                  ? "border-white text-white"
                  : "border-[#262626] text-[#525252] hover:border-[#525252]"
              }`}
            >
              {key}
            </button>
          ))}
          <span className="ml-auto text-xs text-[#525252]">
            {results.length} result{results.length !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      {isPending && (
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {error && !isPending && (
        <div className="border border-[#dc2626] bg-[#0a0a0a] p-6 text-center">
          <p className="text-[#dc2626] text-sm font-medium mb-1">Search failed</p>
          <p className="text-[#525252] text-xs">Check your IATA codes and try again</p>
        </div>
      )}

      {results && results.length === 0 && !isPending && (
        <div className="border border-[#171717] bg-[#0a0a0a] p-10 text-center">
          <p className="text-white text-sm font-medium mb-1">No flights found</p>
          <p className="text-[#525252] text-xs">Try a different route or date</p>
        </div>
      )}

      {!isPending && sorted.length > 0 && (
        <div className="space-y-3">
          {sorted.map((flight, i) => (
            <FlightCard key={flight.id} flight={flight} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}