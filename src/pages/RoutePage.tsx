import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { airports } from "../data/airports";

interface Segment {
  from: string;
  to: string;
  distance_km: number;
  duration_min: number;
  avg_price_usd: number;
}

interface OptimalRoute {
  origin: string;
  destination: string;
  path: string[];
  hops: number;
  segments: Segment[];
  total_distance_km: number;
  total_duration_min: number;
  total_avg_price_usd: number;
  summary: string;
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function cityName(iata: string): string {
  return airports[iata] ?? iata;
}

export default function RoutePage() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [queryOrigin, setQueryOrigin] = useState("");
  const [queryDest, setQueryDest] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["optimal-route", queryOrigin, queryDest],
    queryFn: async () => {
      const res = await api.get(`/routes/optimal?origin=${queryOrigin}&destination=${queryDest}`);
      return res.data.data as OptimalRoute;
    },
    enabled: submitted && queryOrigin.length === 3 && queryDest.length === 3,
    retry: false,
  });

  const canSubmit = origin.trim().length === 3 && destination.trim().length === 3 && !isLoading;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setQueryOrigin(origin.toUpperCase());
    setQueryDest(destination.toUpperCase());
    setSubmitted(true);
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Optimal Route</h1>
        <p className="text-sm text-[#525252]">Find the shortest path between two airports</p>
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
              <p className="text-xs text-[#525252] mt-1 h-4">{airports[origin.toUpperCase()] ?? ""}</p>
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
              <p className="text-xs text-[#525252] mt-1 h-4">{airports[destination.toUpperCase()] ?? ""}</p>
            </div>
          </div>
          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full py-3 bg-white text-black font-semibold text-sm tracking-wide hover:bg-[#e5e5e5] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? "Finding route..." : "Find Optimal Route"}
          </button>
        </form>
      </div>

      {isLoading && (
        <div className="border border-[#171717] bg-[#0a0a0a] p-6">
          <div className="space-y-3">
            {[0, 1].map((i) => <div key={i} className="h-16 bg-[#171717] shimmer" />)}
          </div>
        </div>
      )}

      {error && !isLoading && (
        <div className="border border-[#dc2626] bg-[#0a0a0a] p-6 text-center">
          <p className="text-[#dc2626] text-sm font-medium mb-1">Route not found</p>
          <p className="text-[#525252] text-xs">Check your IATA codes and try again</p>
        </div>
      )}

      {data && !isLoading && (
        <div className="border border-[#171717] bg-[#0a0a0a] p-6">
          <div className="mb-6 pb-6 border-b border-[#171717]">
            <p className="text-xs text-[#525252] uppercase tracking-widest mb-2">Route Summary</p>
            <p className="text-white font-medium text-sm">{data.summary}</p>
          </div>

          <div className="mb-6 pb-6 border-b border-[#171717]">
            <p className="text-xs text-[#525252] uppercase tracking-widest mb-4">Path</p>
            <div className="flex items-center flex-wrap gap-0">
              {data.path.map((iata, i) => (
                <div key={i} className="flex items-center">
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">{iata}</div>
                    <div className="text-xs text-[#525252]">{cityName(iata)}</div>
                  </div>
                  {i < data.path.length - 1 && (
                    <div className="flex items-center mx-3">
                      <div className="h-px w-8 bg-[#262626]" />
                      <span className="text-[#525252] text-xs mx-1">→</span>
                      <div className="h-px w-8 bg-[#262626]" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6 pb-6 border-b border-[#171717]">
            <p className="text-xs text-[#525252] uppercase tracking-widest mb-4">Segments</p>
            <div className="space-y-3">
              {data.segments.map((seg, i) => (
                <div key={i} className="flex items-center justify-between border border-[#171717] p-4">
                  <div>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-white font-bold">{seg.from}</span>
                      <span className="text-[#525252] text-xs">→</span>
                      <span className="text-white font-bold">{seg.to}</span>
                      <span className="text-xs text-[#525252]">{cityName(seg.from)} → {cityName(seg.to)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[#525252]">
                      <span>{seg.distance_km.toLocaleString()} km</span>
                      <span>·</span>
                      <span>{formatDuration(seg.duration_min)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold">${seg.avg_price_usd.toFixed(0)}</div>
                    <div className="text-xs text-[#525252]">avg price</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-8 flex-wrap">
            <div>
              <span className="text-xs text-[#525252] uppercase tracking-widest">Total Distance</span>
              <p className="text-white font-bold">{data.total_distance_km.toLocaleString()} km</p>
            </div>
            <div>
              <span className="text-xs text-[#525252] uppercase tracking-widest">Total Duration</span>
              <p className="text-white font-bold">{formatDuration(data.total_duration_min)}</p>
            </div>
            <div>
              <span className="text-xs text-[#525252] uppercase tracking-widest">Avg Price</span>
              <p className="text-white font-bold">${data.total_avg_price_usd.toFixed(0)}</p>
            </div>
            <div>
              <span className="text-xs text-[#525252] uppercase tracking-widest">Stops</span>
              <p className="text-white font-bold">{data.hops}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}