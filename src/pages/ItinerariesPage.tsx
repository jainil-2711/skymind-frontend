import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function cityName(iata: string): string {
  return airports[iata] ?? iata;
}

function ItineraryCard({
  itinerary,
  onDelete,
  isDeleting,
}: {
  itinerary: Itinerary;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const routeSummary = itinerary.destinations
    .map((d, i) => (i === 0 ? d.origin_iata : d.destination_iata))
    .join(" → ");

  const displayPrompt =
    itinerary.prompt.trim().length > 0
      ? itinerary.prompt.length > 80
        ? itinerary.prompt.slice(0, 80) + "..."
        : itinerary.prompt
      : "No prompt";

  return (
    <div className="border border-[#171717] bg-[#0a0a0a]">
      {/* Card header */}
      <div
        className="p-5 cursor-pointer hover:border-[#262626] transition-colors"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="flex items-start gap-4">
          <div className="flex-1 min-w-0">
            {/* Route */}
            <p className="text-white font-bold text-lg tracking-tight mb-1">
              {routeSummary}
            </p>
            {/* Prompt */}
            <p className="text-xs text-[#525252] mb-3 italic">"{displayPrompt}"</p>
            {/* Meta */}
            <div className="flex items-center gap-3 text-xs text-[#525252] flex-wrap">
              <span>{formatDate(itinerary.created_at)}</span>
              <span>·</span>
              <span>{itinerary.total_legs} legs</span>
              <span>·</span>
              <span>{itinerary.duration_days} days</span>
              <span>·</span>
              <span className="text-white font-medium">
                ${itinerary.total_estimated_price_usd.toFixed(0)}
              </span>
            </div>
          </div>

          {/* Right side */}
          <div className="flex-shrink-0 flex flex-col items-end gap-2">
            <span className="text-xs text-[#525252]">{expanded ? "▲" : "▼"}</span>
          </div>
        </div>
      </div>

      {/* Expanded legs */}
      {expanded && (
        <div className="border-t border-[#171717] px-5 pt-5 pb-3">
          {/* Legs timeline */}
          <div className="mb-4">
            {itinerary.destinations.map((leg, i) => (
              <div key={leg.order} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-white flex-shrink-0 mt-1" />
                  {i < itinerary.destinations.length - 1 && (
                    <div className="w-px flex-1 bg-[#262626] my-1" />
                  )}
                </div>
                <div className="pb-4 flex-1">
                  <div className="flex items-baseline gap-2 mb-0.5">
                    <span className="text-white font-bold">{leg.origin_iata}</span>
                    <span className="text-[#525252] text-xs">→</span>
                    <span className="text-white font-bold">{leg.destination_iata}</span>
                    <span className="text-xs text-[#525252]">
                      {cityName(leg.origin_iata)} → {cityName(leg.destination_iata)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#525252] flex-wrap">
                    <span>{leg.depart_date}</span>
                    <span>·</span>
                    <span>{formatDuration(leg.duration_min)}</span>
                    <span>·</span>
                    <span className="capitalize">{leg.cabin_class.toLowerCase()}</span>
                    <span>·</span>
                    <span className="text-white">${leg.estimated_price_usd.toFixed(0)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Totals bar */}
          <div className="border-t border-[#171717] pt-3 mb-4 flex items-center gap-6 flex-wrap">
            <div>
              <span className="text-xs text-[#525252] uppercase tracking-widest">Total</span>
              <p className="text-white font-bold text-sm">
                ${itinerary.total_estimated_price_usd.toFixed(0)}
              </p>
            </div>
            <div>
              <span className="text-xs text-[#525252] uppercase tracking-widest">Flight time</span>
              <p className="text-white font-bold text-sm">
                {formatDuration(itinerary.total_duration_min)}
              </p>
            </div>
            <div>
              <span className="text-xs text-[#525252] uppercase tracking-widest">Days</span>
              <p className="text-white font-bold text-sm">{itinerary.duration_days}</p>
            </div>
            {itinerary.llm_model && (
              <div className="ml-auto">
                <span className="text-xs text-[#525252]">via {itinerary.llm_model}</span>
              </div>
            )}
          </div>

          {/* Delete */}
          <div className="flex items-center gap-3 pb-2">
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="text-xs text-[#525252] hover:text-[#dc2626] transition-colors"
              >
                Delete itinerary
              </button>
            ) : (
              <>
                <span className="text-xs text-[#525252]">Are you sure?</span>
                <button
                  onClick={() => {
                    onDelete(itinerary.id);
                    setConfirmDelete(false);
                  }}
                  disabled={isDeleting}
                  className="text-xs text-[#dc2626] hover:text-white transition-colors disabled:opacity-50"
                >
                  {isDeleting ? "Deleting..." : "Yes, delete"}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="text-xs text-[#525252] hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ItinerariesPage() {
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["itineraries"],
    queryFn: async () => {
      const res = await api.get("/itineraries");
      return res.data.data as Itinerary[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/itineraries/${id}`);
    },
    onMutate: (id) => setDeletingId(id),
    onSettled: () => setDeletingId(null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["itineraries"] });
    },
  });

  const itineraries = data ?? [];

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      {/* Heading */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Itineraries</h1>
        <p className="text-sm text-[#525252]">Your saved AI-generated trip plans</p>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="border border-[#171717] bg-[#0a0a0a] p-5">
              <div className="space-y-2">
                <div className="h-5 w-48 bg-[#171717] shimmer" />
                <div className="h-3 w-64 bg-[#171717] shimmer" />
                <div className="h-3 w-40 bg-[#171717] shimmer" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && !isLoading && (
        <div className="border border-[#dc2626] bg-[#0a0a0a] p-6 text-center">
          <p className="text-[#dc2626] text-sm font-medium mb-1">Failed to load itineraries</p>
          <p className="text-[#525252] text-xs">Please refresh the page</p>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !error && itineraries.length === 0 && (
        <div className="border border-[#171717] bg-[#0a0a0a] p-10 text-center">
          <p className="text-white text-sm font-medium mb-1">No itineraries yet</p>
          <p className="text-[#525252] text-xs">
            Use the AI Planner to generate your first trip
          </p>
        </div>
      )}

      {/* List */}
      {!isLoading && !error && itineraries.length > 0 && (
        <>
          <div className="text-xs text-[#525252] mb-4">
            {itineraries.length} itinerar{itineraries.length !== 1 ? "ies" : "y"}
          </div>
          <div className="space-y-3">
            {itineraries.map((itinerary) => (
              <ItineraryCard
                key={itinerary.id}
                itinerary={itinerary}
                onDelete={(id) => deleteMutation.mutate(id)}
                isDeleting={deletingId === itinerary.id}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}