import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "../lib/api";
import { airports } from "../data/airports";

interface MultiCityLeg {
  order: number;
  origin_iata: string;
  destination_iata: string;
  distance_km: number;
  avg_duration_min: number;
  avg_price_usd: number;
}

interface MultiCityRoute {
  origin_iata: string;
  optimise_for: string;
  ordered_cities: string[];
  legs: MultiCityLeg[];
  total_price_usd: number;
  total_distance_km: number;
  total_duration_min: number;
  cities_count: number;
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function cityName(iata: string): string {
  return airports[iata] ?? iata;
}

export default function MultiCityPage() {
  const [origin, setOrigin] = useState("");
  const [cities, setCities] = useState<string[]>(["", ""]);
  const [result, setResult] = useState<MultiCityRoute | null>(null);

  const { mutate, isPending, error, reset } = useMutation({
    mutationFn: async () => {
      const res = await api.post("/routes/multi-city", {
        origin_iata: origin.toUpperCase(),
        cities: cities.map((c) => c.toUpperCase()).filter((c) => c.length === 3),
      });
      return res.data.data as MultiCityRoute;
    },
    onSuccess: (data) => setResult(data),
    onError: () => setResult(null),
  });

  function handleCityChange(index: number, value: string) {
    const updated = [...cities];
    updated[index] = value.toUpperCase();
    setCities(updated);
  }

  function addCity() {
    setCities([...cities, ""]);
  }

  function removeCity(index: number) {
    if (cities.length <= 2) return;
    setCities(cities.filter((_, i) => i !== index));
  }

  const validCities = cities.filter((c) => c.length === 3);
  const canSubmit = origin.trim().length === 3 && validCities.length >= 2 && !isPending;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    reset();
    setResult(null);
    mutate();
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Multi-City</h1>
        <p className="text-sm text-[#525252]">
          Optimise a route across multiple cities
        </p>
      </div>

      <div className="border border-[#171717] bg-[#0a0a0a] p-6 mb-8">
        <form onSubmit={handleSubmit}>
          {/* Origin */}
          <div className="mb-6">
            <label className="block text-xs text-[#525252] uppercase tracking-widest mb-2">
              Origin
            </label>
            <input
              type="text"
              maxLength={3}
              value={origin}
              onChange={(e) => setOrigin(e.target.value.toUpperCase())}
              placeholder="DXB"
              className="w-full bg-black border border-[#262626] text-white text-2xl font-bold tracking-widest px-4 py-3 uppercase placeholder-[#525252] focus:outline-none focus:border-white transition-colors"
            />
            <p className="text-xs text-[#525252] mt-1 h-4">
              {airports[origin.toUpperCase()] ?? ""}
            </p>
          </div>

          {/* Cities */}
          <div className="mb-4">
            <label className="block text-xs text-[#525252] uppercase tracking-widest mb-2">
              Cities to visit
            </label>
            <div className="space-y-2">
              {cities.map((city, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <div className="flex-shrink-0 w-6 text-center text-xs text-[#525252]">
                    {i + 1}
                  </div>
                  <input
                    type="text"
                    maxLength={3}
                    value={city}
                    onChange={(e) => handleCityChange(i, e.target.value)}
                    placeholder="LHR"
                    className="flex-1 bg-black border border-[#262626] text-white text-lg font-bold tracking-widest px-4 py-2 uppercase placeholder-[#525252] focus:outline-none focus:border-white transition-colors"
                  />
                  <div className="text-xs text-[#525252] w-20">
                    {airports[city.toUpperCase()] ?? ""}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCity(i)}
                    disabled={cities.length <= 2}
                    className="text-xs text-[#525252] hover:text-[#dc2626] transition-colors disabled:opacity-20 w-6"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Add city */}
          <button
            type="button"
            onClick={addCity}
            className="text-xs text-[#525252] hover:text-white transition-colors mb-6 border border-[#262626] px-3 py-1"
          >
            + Add city
          </button>

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full py-3 bg-white text-black font-semibold text-sm tracking-wide hover:bg-[#e5e5e5] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? "Optimising route..." : "Optimise Route"}
          </button>
        </form>
      </div>

      {/* Loading */}
      {isPending && (
        <div className="border border-[#171717] bg-[#0a0a0a] p-6 space-y-3">
          {[0, 1, 2].map((i) => <div key={i} className="h-16 bg-[#171717] shimmer" />)}
        </div>
      )}

      {/* Error */}
      {error && !isPending && (
        <div className="border border-[#dc2626] bg-[#0a0a0a] p-6 text-center">
          <p className="text-[#dc2626] text-sm font-medium mb-1">Optimisation failed</p>
          <p className="text-[#525252] text-xs">Check your IATA codes and try again</p>
        </div>
      )}

      {/* Result */}
      {result && !isPending && (
        <div className="border border-[#171717] bg-[#0a0a0a] p-6">
          {/* Header */}
          <div className="mb-6 pb-6 border-b border-[#171717]">
            <p className="text-xs text-[#525252] uppercase tracking-widest mb-2">
              Optimised for {result.optimise_for}
            </p>
            <div className="flex items-center flex-wrap gap-2">
              <span className="text-white font-bold">{result.origin_iata}</span>
              {result.ordered_cities.map((city, i) => (
                <span key={i} className="flex items-center gap-2">
                  <span className="text-[#525252]">→</span>
                  <span className="text-white font-bold">{city}</span>
                </span>
              ))}
              <span className="text-[#525252]">→</span>
              <span className="text-white font-bold">{result.origin_iata}</span>
            </div>
          </div>

          {/* Legs */}
          <div className="mb-6 pb-6 border-b border-[#171717]">
            <p className="text-xs text-[#525252] uppercase tracking-widest mb-4">Legs</p>
            <div className="space-y-0">
              {result.legs.map((leg, i) => (
                <div key={leg.order} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-white flex-shrink-0 mt-1" />
                    {i < result.legs.length - 1 && (
                      <div className="w-px flex-1 bg-[#262626] my-1" />
                    )}
                  </div>
                  <div className="pb-4 flex-1 flex items-start justify-between">
                    <div>
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-white font-bold">{leg.origin_iata}</span>
                        <span className="text-[#525252] text-xs">→</span>
                        <span className="text-white font-bold">{leg.destination_iata}</span>
                        <span className="text-xs text-[#525252]">
                          {cityName(leg.origin_iata)} → {cityName(leg.destination_iata)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-[#525252]">
                        <span>{leg.distance_km.toLocaleString()} km</span>
                        <span>·</span>
                        <span>{formatDuration(leg.avg_duration_min)}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-white font-bold">${leg.avg_price_usd.toFixed(0)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="flex items-center gap-8 flex-wrap">
            <div>
              <span className="text-xs text-[#525252] uppercase tracking-widest">Total Price</span>
              <p className="text-white font-bold">${result.total_price_usd.toFixed(0)}</p>
            </div>
            <div>
              <span className="text-xs text-[#525252] uppercase tracking-widest">Total Distance</span>
              <p className="text-white font-bold">{result.total_distance_km.toLocaleString()} km</p>
            </div>
            <div>
              <span className="text-xs text-[#525252] uppercase tracking-widest">Total Duration</span>
              <p className="text-white font-bold">{formatDuration(result.total_duration_min)}</p>
            </div>
            <div>
              <span className="text-xs text-[#525252] uppercase tracking-widest">Cities</span>
              <p className="text-white font-bold">{result.cities_count}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}