import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "../lib/api";
import { airports } from "../data/airports";

interface CabinResult {
  cabin_class: string;
  co2_per_passenger_kg: number;
  co2_total_kg: number;
  emission_factor: number;
  trees_to_offset: number;
}

interface CarbonResult {
  origin_iata: string;
  destination_iata: string;
  distance_km: number;
  passengers: number;
  requested: CabinResult;
  comparison: {
    ECONOMY: CabinResult;
    BUSINESS: CabinResult;
    FIRST: CabinResult;
  };
  economy_saving_kg: number;
}

const CABIN_OPTIONS = ["economy", "business", "first"] as const;

function formatCO2(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toFixed(2)} t`;
  return `${kg.toFixed(0)} kg`;
}

function CabinBar({
  label,
  value,
  maxValue,
  isSelected,
}: {
  label: string;
  value: number;
  maxValue: number;
  isSelected: boolean;
}) {
  const width = (value / maxValue) * 100;
  return (
    <div className="mb-4">
      <div className="flex justify-between text-xs mb-1">
        <span className={isSelected ? "text-white font-medium" : "text-[#525252]"}>
          {label}
        </span>
        <span className={isSelected ? "text-white font-medium" : "text-[#525252]"}>
          {formatCO2(value)}
        </span>
      </div>
      <div className="h-2 bg-[#171717] w-full">
        <div
          className={`h-2 transition-all duration-700 ease-out ${isSelected ? "bg-white" : "bg-[#262626]"}`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

export default function CarbonPage() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [cabin, setCabin] = useState<"economy" | "business" | "first">("economy");
  const [passengers, setPassengers] = useState(1);
  const [result, setResult] = useState<CarbonResult | null>(null);

  const { mutate, isPending, error, reset } = useMutation({
    mutationFn: async () => {
      const res = await api.post("/flights/carbon", {
        origin_iata: origin.toUpperCase(),
        destination_iata: destination.toUpperCase(),
        passengers,
        cabin_class: cabin,
      });
      return res.data.data as CarbonResult;
    },
    onSuccess: (data) => setResult(data),
    onError: () => setResult(null),
  });

  const canSubmit =
    origin.trim().length === 3 &&
    destination.trim().length === 3 &&
    !isPending;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    reset();
    setResult(null);
    mutate();
  }

  const maxCO2 = result
    ? Math.max(
        result.comparison.ECONOMY.co2_total_kg,
        result.comparison.BUSINESS.co2_total_kg,
        result.comparison.FIRST.co2_total_kg
      )
    : 1;

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Carbon Footprint</h1>
        <p className="text-sm text-[#525252]">
          Estimate CO₂ emissions for your flight
        </p>
      </div>

      {/* Form */}
      <div className="border border-[#171717] bg-[#0a0a0a] p-6 mb-8">
        <form onSubmit={handleSubmit}>
          {/* Route */}
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

          {/* Cabin + Passengers */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
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
            {isPending ? "Calculating..." : "Calculate Carbon"}
          </button>
        </form>
      </div>

      {/* Loading */}
      {isPending && (
        <div className="border border-[#171717] bg-[#0a0a0a] p-6 space-y-4">
          <div className="h-20 bg-[#171717] shimmer" />
          <div className="h-4 bg-[#171717] shimmer" />
          <div className="h-4 bg-[#171717] shimmer" />
          <div className="h-4 bg-[#171717] shimmer" />
        </div>
      )}

      {/* Error */}
      {error && !isPending && (
        <div className="border border-[#dc2626] bg-[#0a0a0a] p-6 text-center">
          <p className="text-[#dc2626] text-sm font-medium mb-1">Calculation failed</p>
          <p className="text-[#525252] text-xs">Check your IATA codes and try again</p>
        </div>
      )}

      {/* Result */}
      {result && !isPending && (
        <div className="border border-[#171717] bg-[#0a0a0a] p-6">
          {/* Main result */}
          <div className="mb-6 pb-6 border-b border-[#171717]">
            <p className="text-xs text-[#525252] uppercase tracking-widest mb-3">
              Your Flight — {result.requested.cabin_class.charAt(0) + result.requested.cabin_class.slice(1).toLowerCase()}
            </p>
            <div className="flex items-end gap-6 flex-wrap">
              <div>
                <p className="text-4xl font-bold text-white">
                  {formatCO2(result.requested.co2_total_kg)}
                </p>
                <p className="text-xs text-[#525252] mt-1">
                  CO₂ total · {result.passengers} passenger{result.passengers > 1 ? "s" : ""}
                </p>
              </div>
              <div>
                <p className="text-xl font-bold text-white">
                  {formatCO2(result.requested.co2_per_passenger_kg)}
                </p>
                <p className="text-xs text-[#525252] mt-1">per passenger</p>
              </div>
              <div>
                <p className="text-xl font-bold text-white">{result.requested.trees_to_offset}</p>
                <p className="text-xs text-[#525252] mt-1">trees to offset</p>
              </div>
            </div>
          </div>

          {/* Route info */}
          <div className="mb-6 pb-6 border-b border-[#171717] flex items-center gap-6 flex-wrap text-xs text-[#525252]">
            <span>
              <span className="text-white font-medium">{result.origin_iata}</span>
              {" → "}
              <span className="text-white font-medium">{result.destination_iata}</span>
            </span>
            <span>·</span>
            <span>{result.distance_km.toLocaleString()} km</span>
            <span>·</span>
            <span>DEFRA 2023 + RFI 1.9</span>
          </div>

          {/* Cabin comparison */}
          <div className="mb-6 pb-6 border-b border-[#171717]">
            <p className="text-xs text-[#525252] uppercase tracking-widest mb-4">
              Cabin Comparison
            </p>
            {(["ECONOMY", "BUSINESS", "FIRST"] as const).map((c) => (
              <CabinBar
                key={c}
                label={c.charAt(0) + c.slice(1).toLowerCase()}
                value={result.comparison[c].co2_total_kg}
                maxValue={maxCO2}
                isSelected={result.requested.cabin_class === c}
              />
            ))}
          </div>

          {/* Economy saving */}
          {result.requested.cabin_class !== "ECONOMY" && (
            <div>
              <p className="text-xs text-[#525252] uppercase tracking-widest mb-1">
                vs Economy
              </p>
              <p className="text-white font-bold">
                +{formatCO2(result.economy_saving_kg)} extra CO₂
              </p>
              <p className="text-xs text-[#525252] mt-1">
                compared to flying economy class
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}