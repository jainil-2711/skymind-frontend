import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

interface SavedSearch {
  id: string;
  origin_iata: string;
  destination_iata: string;
  depart_date: string;
  return_date: string | null;
  passengers: number;
  cabin_class: string;
  created_at: string;
}

interface RerunResult {
  result_count: number;
  min_price: number | null;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function SavedSearchCard({
  search,
  onDelete,
  isDeleting,
}: {
  search: SavedSearch;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [rerunResult, setRerunResult] = useState<RerunResult | null>(null);

  const rerunMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/saved-searches/${search.id}/rerun`, {});
      const offers = res.data.data.offers as Array<{ price: { total: string } }>;
      const prices = offers.map((o) => parseFloat(o.price.total));
      return {
        result_count: offers.length,
        min_price: prices.length > 0 ? Math.min(...prices) : null,
      };
    },
    onSuccess: (data) => setRerunResult(data),
  });

  return (
    <div className="border border-[#171717] bg-[#0a0a0a] p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {/* Route */}
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-xl font-bold text-white">{search.origin_iata}</span>
            <span className="text-[#525252] text-sm">→</span>
            <span className="text-xl font-bold text-white">{search.destination_iata}</span>
          </div>

          {/* Details */}
          <div className="flex items-center gap-3 text-xs text-[#525252] mb-3 flex-wrap">
            <span>{search.depart_date}</span>
            {search.return_date && (
              <>
                <span>·</span>
                <span>Return {search.return_date}</span>
              </>
            )}
            <span>·</span>
            <span>{search.passengers} pax</span>
            <span>·</span>
            <span className="capitalize">{search.cabin_class.toLowerCase()}</span>
            <span>·</span>
            <span>Saved {formatDate(search.created_at)}</span>
          </div>

          {/* Rerun result */}
          {rerunResult && (
            <div className="flex items-center gap-3 text-xs mb-3">
              <span className="text-[#16a34a] font-medium">
                {rerunResult.result_count} results
              </span>
              {rerunResult.min_price !== null && (
                <>
                  <span className="text-[#525252]">·</span>
                  <span className="text-white font-medium">
                    from ${rerunResult.min_price.toFixed(2)}
                  </span>
                </>
              )}
            </div>
          )}

          {rerunMutation.isError && (
            <p className="text-xs text-[#dc2626] mb-3">Rerun failed. Try again.</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex-shrink-0 flex flex-col items-end gap-2">
          <button
            onClick={() => rerunMutation.mutate()}
            disabled={rerunMutation.isPending}
            className="text-xs border border-[#262626] text-[#525252] hover:border-white hover:text-white transition-colors px-3 py-1 disabled:opacity-30"
          >
            {rerunMutation.isPending ? "Running..." : "Rerun"}
          </button>

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
                onClick={() => { onDelete(search.id); setConfirmDelete(false); }}
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

export default function SavedSearchesPage() {
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: searches, isLoading, error } = useQuery({
    queryKey: ["saved-searches"],
    queryFn: async () => {
      const res = await api.get("/saved-searches");
      return res.data.data as SavedSearch[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/saved-searches/${id}`);
    },
    onMutate: (id) => setDeletingId(id),
    onSettled: () => setDeletingId(null),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["saved-searches"] }),
  });

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Saved Searches</h1>
        <p className="text-sm text-[#525252]">Your saved flight searches — rerun anytime</p>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="border border-[#171717] bg-[#0a0a0a] p-5">
              <div className="space-y-2">
                <div className="h-6 w-40 bg-[#171717] shimmer" />
                <div className="h-3 w-56 bg-[#171717] shimmer" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && !isLoading && (
        <div className="border border-[#dc2626] bg-[#0a0a0a] p-6 text-center">
          <p className="text-[#dc2626] text-sm font-medium mb-1">Failed to load saved searches</p>
          <p className="text-[#525252] text-xs">Please refresh the page</p>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !error && searches && searches.length === 0 && (
        <div className="border border-[#171717] bg-[#0a0a0a] p-10 text-center">
          <p className="text-white text-sm font-medium mb-1">No saved searches</p>
          <p className="text-[#525252] text-xs">
            Save a search from the Flight Search page to see it here
          </p>
        </div>
      )}

      {/* List */}
      {!isLoading && !error && searches && searches.length > 0 && (
        <>
          <div className="text-xs text-[#525252] mb-4">
            {searches.length} saved search{searches.length !== 1 ? "es" : ""}
          </div>
          <div className="space-y-3">
            {searches.map((search) => (
              <SavedSearchCard
                key={search.id}
                search={search}
                onDelete={(id) => deleteMutation.mutate(id)}
                isDeleting={deletingId === search.id}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}