import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

interface Alert {
  id: string;
  origin_iata: string;
  destination_iata: string;
  target_price_usd: number;
  departure_date: string | null;
  is_active: boolean;
  last_checked_at: string | null;
  triggered_at: string | null;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function StatusDot({ alert }: { alert: Alert }) {
  const isTriggered = alert.triggered_at !== null;
  if (isTriggered) {
    return (
      <span className="flex items-center gap-1.5 text-xs text-[#d97706]">
        <span className="w-2 h-2 rounded-full bg-[#d97706] animate-pulse inline-block" />
        Triggered
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 text-xs text-[#16a34a]">
      <span className="w-2 h-2 rounded-full bg-[#16a34a] animate-pulse inline-block" />
      Watching
    </span>
  );
}

function AlertCard({
  alert,
  onDelete,
  isDeleting,
}: {
  alert: Alert;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="border border-[#171717] bg-[#0a0a0a] p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-xl font-bold text-white">{alert.origin_iata}</span>
            <span className="text-[#525252] text-sm">→</span>
            <span className="text-xl font-bold text-white">{alert.destination_iata}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-[#525252] mb-3 flex-wrap">
            <span>Target <span className="text-white font-medium">${alert.target_price_usd.toFixed(0)}</span></span>
            {alert.departure_date && (
              <>
                <span>·</span>
                <span>Depart {alert.departure_date}</span>
              </>
            )}
            <span>·</span>
            <span>Last checked {formatDate(alert.last_checked_at)}</span>
          </div>
          <StatusDot alert={alert} />
        </div>

        {/* Delete */}
        <div className="flex-shrink-0">
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="text-xs text-[#525252] hover:text-[#dc2626] transition-colors"
            >
              Delete
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#525252]">Sure?</span>
              <button
                onClick={() => { onDelete(alert.id); setConfirmDelete(false); }}
                disabled={isDeleting}
                className="text-xs text-[#dc2626] hover:text-white transition-colors disabled:opacity-50"
              >
                {isDeleting ? "..." : "Yes"}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-xs text-[#525252] hover:text-white transition-colors"
              >
                No
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AlertsPage() {
  const queryClient = useQueryClient();
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState(false);

  const { data: alerts, isLoading } = useQuery({
    queryKey: ["alerts"],
    queryFn: async () => {
      const res = await api.get("/alerts");
      return res.data.data as Alert[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const body: Record<string, unknown> = {
        origin: origin.toUpperCase(),
        destination: destination.toUpperCase(),
        target_price_usd: parseFloat(targetPrice),
      };
      if (departureDate.trim()) body.departure_date = departureDate;
      await api.post("/alerts", body);
    },
    onSuccess: () => {
      setOrigin("");
      setDestination("");
      setTargetPrice("");
      setDepartureDate("");
      setCreateSuccess(true);
      setTimeout(() => setCreateSuccess(false), 3000);
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/alerts/${id}`);
    },
    onMutate: (id) => setDeletingId(id),
    onSettled: () => setDeletingId(null),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["alerts"] }),
  });

  const canSubmit =
    origin.trim().length === 3 &&
    destination.trim().length === 3 &&
    targetPrice.trim().length > 0 &&
    parseFloat(targetPrice) > 0 &&
    !createMutation.isPending;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    createMutation.mutate();
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Price Alerts</h1>
        <p className="text-sm text-[#525252]">
          Get notified when prices drop below your target
        </p>
      </div>

      {/* Create form */}
      <div className="border border-[#171717] bg-[#0a0a0a] p-6 mb-8">
        <p className="text-xs text-[#525252] uppercase tracking-widest mb-4">New Alert</p>
        <form onSubmit={handleSubmit}>
          {/* Route row */}
          <div className="flex gap-4 mb-4">
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
            </div>
          </div>

          {/* Price + Date row */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <label className="block text-xs text-[#525252] uppercase tracking-widest mb-2">Target Price (USD)</label>
              <input
                type="number"
                min="1"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                placeholder="300"
                className="w-full bg-black border border-[#262626] text-white px-4 py-3 placeholder-[#525252] focus:outline-none focus:border-white transition-colors text-sm"
                style={{ colorScheme: "dark" }}
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-[#525252] uppercase tracking-widest mb-2">Departure Date — optional</label>
              <input
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="w-full bg-black border border-[#262626] text-white px-4 py-3 focus:outline-none focus:border-white transition-colors text-sm"
                style={{ colorScheme: "dark" }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full py-3 bg-white text-black font-semibold text-sm tracking-wide hover:bg-[#e5e5e5] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            {createMutation.isPending ? "Creating..." : "Create Alert"}
          </button>

          {/* Success message */}
          {createSuccess && (
            <p className="text-xs text-[#16a34a] mt-3 text-center">
              Alert created — we'll notify you when prices drop
            </p>
          )}

          {/* Error */}
          {createMutation.isError && (
            <p className="text-xs text-[#dc2626] mt-3 text-center">
              Failed to create alert. Try again.
            </p>
          )}
        </form>
      </div>

      {/* Alerts list */}
      {isLoading && (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="border border-[#171717] bg-[#0a0a0a] p-5">
              <div className="space-y-2">
                <div className="h-6 w-36 bg-[#171717] shimmer" />
                <div className="h-3 w-52 bg-[#171717] shimmer" />
                <div className="h-3 w-20 bg-[#171717] shimmer" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && alerts && alerts.length === 0 && (
        <div className="border border-[#171717] bg-[#0a0a0a] p-10 text-center">
          <p className="text-white text-sm font-medium mb-1">No alerts yet</p>
          <p className="text-[#525252] text-xs">Create one above to start tracking prices</p>
        </div>
      )}

      {!isLoading && alerts && alerts.length > 0 && (
        <>
          <div className="text-xs text-[#525252] mb-4">
            {alerts.length} alert{alerts.length !== 1 ? "s" : ""}
          </div>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onDelete={(id) => deleteMutation.mutate(id)}
                isDeleting={deletingId === alert.id}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}