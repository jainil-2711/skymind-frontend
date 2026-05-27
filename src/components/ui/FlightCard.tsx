import { useState, useEffect, useRef } from "react";
import { airports } from "../../data/airports";

interface Segment {
  departure: { iataCode: string; at: string };
  arrival: { iataCode: string; at: string };
  carrierCode: string;
  number: string;
  duration: string;
  numberOfStops: number;
}

interface Itinerary {
  duration: string;
  segments: Segment[];
}

interface ScoreBreakdown {
  price_score: number;
  duration_score: number;
  stops_score: number;
}

export interface Flight {
  id: string;
  itineraries: Itinerary[];
  price: { currency: string; total: string; per_passenger: string };
  cabin_class: string;
  score: number;
  score_breakdown: ScoreBreakdown;
}

interface FlightCardProps {
  flight: Flight;
  index: number;
}

const RADIUS = 28;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function scoreColor(score: number): string {
  if (score >= 0.75) return "#16a34a";
  if (score >= 0.5) return "#d97706";
  return "#dc2626";
}

function parseDuration(iso: string): string {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return iso;
  const h = match[1] ? `${match[1]}h` : "";
  const m = match[2] ? ` ${match[2]}m` : "";
  return `${h}${m}`.trim();
}

function formatTime(isoDateTime: string): string {
  const date = new Date(isoDateTime);
  return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
}

export function FlightCard({ flight, index }: FlightCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [animatedOffset, setAnimatedOffset] = useState(CIRCUMFERENCE);
  const mounted = useRef(false);

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;
    const timeout = setTimeout(() => {
      setAnimatedOffset(CIRCUMFERENCE * (1 - flight.score));
    }, 100 + index * 80);
    return () => clearTimeout(timeout);
  }, [flight.score, index]);

  const itinerary = flight.itineraries[0];
  const segments = itinerary.segments;
  const firstSeg = segments[0];
  const lastSeg = segments[segments.length - 1];
  const stops = segments.length - 1;
  const originCode = firstSeg.departure.iataCode;
  const destCode = lastSeg.arrival.iataCode;
  const originCity = airports[originCode] ?? originCode;
  const destCity = airports[destCode] ?? destCode;
  const carrier = firstSeg.carrierCode;
  const flightNum = firstSeg.number;
  const color = scoreColor(flight.score);
  const price = parseFloat(flight.price.total);

  return (
    <div
      onClick={() => setExpanded((e) => !e)}
      style={{ animationDelay: `${index * 80}ms` }}
      className="flight-card-enter border border-[#171717] bg-[#0a0a0a] p-5 cursor-pointer hover:border-[#262626] transition-colors duration-200"
    >
      {/* Main row */}
      <div className="flex items-center gap-6">
        {/* Score ring */}
        <div className="flex-shrink-0">
          <svg width="68" height="68" viewBox="0 0 68 68">
            <circle cx="34" cy="34" r={RADIUS} fill="none" stroke="#171717" strokeWidth="4" />
            <circle
              cx="34" cy="34" r={RADIUS}
              fill="none"
              stroke={color}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={animatedOffset}
              transform="rotate(-90 34 34)"
              style={{ transition: "stroke-dashoffset 0.9s cubic-bezier(0.4,0,0.2,1)" }}
            />
            <text
              x="34" y="34"
              textAnchor="middle"
              dominantBaseline="central"
              fill="#ffffff"
              fontSize="12"
              fontFamily="Inter, sans-serif"
              fontWeight="600"
            >
              {Math.round(flight.score * 100)}
            </text>
          </svg>
        </div>

        {/* Route + details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl font-bold tracking-tight text-white">{originCode}</span>
            <span className="text-[#525252] text-sm">→</span>
            <span className="text-2xl font-bold tracking-tight text-white">{destCode}</span>
            <span className="text-[#525252] text-xs ml-1">{originCity} → {destCity}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-[#525252] flex-wrap">
            <span>{carrier} {flightNum}</span>
            <span>·</span>
            <span>{formatTime(firstSeg.departure.at)} → {formatTime(lastSeg.arrival.at)}</span>
            <span>·</span>
            <span>{parseDuration(itinerary.duration)}</span>
            <span>·</span>
            <span>{stops === 0 ? "Nonstop" : `${stops} stop${stops > 1 ? "s" : ""}`}</span>
            <span>·</span>
            <span className="capitalize">{flight.cabin_class.toLowerCase()}</span>
          </div>
        </div>

        {/* Price + expand hint */}
        <div className="flex-shrink-0 text-right">
          <div className="text-xl font-bold text-white">${price.toLocaleString()}</div>
          <div className="text-xs text-[#525252] mt-1">{expanded ? "▲ less" : "▼ details"}</div>
        </div>
      </div>

      {/* Expanded breakdown */}
      {expanded && (
        <div className="mt-5 pt-5 border-t border-[#171717] space-y-3">
          <p className="text-xs text-[#525252] uppercase tracking-widest mb-3">Score Breakdown</p>
          {[
            { label: "Price", value: flight.score_breakdown.price_score },
            { label: "Duration", value: flight.score_breakdown.duration_score },
            { label: "Stops", value: flight.score_breakdown.stops_score },
          ].map(({ label, value }) => (
            <div key={label}>
              <div className="flex justify-between text-xs text-[#525252] mb-1">
                <span>{label}</span>
                <span>{Math.round(value * 100)}</span>
              </div>
              <div className="h-1 bg-[#171717] w-full">
                <div
                  className="h-1 bg-white"
                  style={{ width: `${value * 100}%`, transition: "width 0.6s ease" }}
                />
              </div>
            </div>
          ))}

          {/* Segment detail for multi-stop */}
          {stops > 0 && (
            <div className="mt-4 pt-4 border-t border-[#171717] space-y-2">
              <p className="text-xs text-[#525252] uppercase tracking-widest mb-2">Segments</p>
              {segments.map((seg, i) => (
                <div key={i} className="flex items-center gap-3 text-xs text-[#525252]">
                  <span className="text-white font-medium">{seg.departure.iataCode}</span>
                  <span>→</span>
                  <span className="text-white font-medium">{seg.arrival.iataCode}</span>
                  <span>·</span>
                  <span>{seg.carrierCode} {seg.number}</span>
                  <span>·</span>
                  <span>{formatTime(seg.departure.at)} → {formatTime(seg.arrival.at)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}