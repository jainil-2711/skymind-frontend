import { useEffect, useRef, useState } from "react";

export interface Destination {
  iata: string;
  city: string;
  country: string;
  region: string;
  price_usd: number;
  duration_min: number;
  budget_remaining_usd: number;
  price_score: number;
  duration_score: number;
  value_score: number;
  composite_score: number;
}

interface DestinationRowProps {
  destination: Destination;
  index: number;
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function ScoreBar({ label, value, delay }: { label: string; value: number; delay: number }) {
  const [width, setWidth] = useState(0);
  const mounted = useRef(false);

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;
    const timeout = setTimeout(() => {
      setWidth(value * 100);
    }, delay);
    return () => clearTimeout(timeout);
  }, [value, delay]);

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-[#525252] w-16 flex-shrink-0">{label}</span>
      <div className="flex-1 h-[2px] bg-[#171717]">
        <div
          className="h-[2px] bg-white"
          style={{ width: `${width}%`, transition: "width 0.7s cubic-bezier(0.4,0,0.2,1)" }}
        />
      </div>
      <span className="text-xs text-[#525252] w-8 text-right flex-shrink-0">
        {Math.round(value * 100)}
      </span>
    </div>
  );
}

export function DestinationRow({ destination: d, index }: DestinationRowProps) {
  const [expanded, setExpanded] = useState(false);
  const baseDelay = 80 + index * 60;

  return (
    <div
      onClick={() => setExpanded((e) => !e)}
      style={{ animationDelay: `${index * 60}ms` }}
      className="flight-card-enter border border-[#171717] bg-[#0a0a0a] p-5 cursor-pointer hover:border-[#262626] transition-colors duration-200"
    >
      {/* Main row */}
      <div className="flex items-start gap-5">
        {/* Rank */}
        <div className="flex-shrink-0 w-8 text-center">
          <span className="text-2xl font-bold text-[#262626]">{index + 1}</span>
        </div>

        {/* City + meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-1 flex-wrap">
            <span className="text-xl font-bold text-white">{d.city}</span>
            <span className="text-sm text-[#525252]">{d.country}</span>
            <span className="text-xs border border-[#262626] text-[#525252] px-2 py-0.5">
              {d.region}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-[#525252] mb-4 flex-wrap">
            <span>${d.price_usd.toFixed(2)} flight</span>
            <span>·</span>
            <span>{formatDuration(d.duration_min)} flight time</span>
            <span>·</span>
            <span>{d.iata}</span>
          </div>

          {/* Score bars */}
          <div className="space-y-2">
            <ScoreBar label="Price" value={d.price_score} delay={baseDelay} />
            <ScoreBar label="Duration" value={d.duration_score} delay={baseDelay + 80} />
            <ScoreBar label="Value" value={d.value_score} delay={baseDelay + 160} />
          </div>
        </div>

        {/* Composite score + expand */}
        <div className="flex-shrink-0 text-right">
          <div className="text-2xl font-bold text-white">
            {Math.round(d.composite_score * 100)}
          </div>
          <div className="text-xs text-[#525252]">score</div>
          <div className="text-xs text-[#525252] mt-2">
            {expanded ? "▲" : "▼"}
          </div>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-[#171717] flex gap-6 text-xs text-[#525252]">
          <div>
            <span className="text-white font-medium">${d.budget_remaining_usd.toFixed(2)}</span>
            <span className="ml-1">budget remaining</span>
          </div>
          <div>
            <span className="text-white font-medium">{d.iata}</span>
            <span className="ml-1">airport code</span>
          </div>
          <div>
            <span className="text-white font-medium">{d.duration_min} min</span>
            <span className="ml-1">total flight time</span>
          </div>
        </div>
      )}
    </div>
  );
}