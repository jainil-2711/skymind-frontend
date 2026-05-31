import { useState } from "react";
import { api } from "../lib/api";

interface AdminStats {
  total_users: number;
  total_searches: number;
  total_alerts: number;
  triggered_alerts: number;
  alert_trigger_rate: number;
  total_itineraries: number;
  ai_itineraries: number;
  cache_hits: number;
  cache_hit_rate: number;
}

interface TopRoute {
  origin_iata: string;
  destination_iata: string;
  search_count: number;
  lowest_price_usd: number;
  avg_price_usd: number;
}

interface AlertStats {
  total_alerts: number;
  active_alerts: number;
  triggered_alerts: number;
  inactive_alerts: number;
  trigger_rate_pct: number;
  avg_target_price_usd: number;
}

interface AdminData {
  stats: AdminStats;
  topRoutes: TopRoute[];
  alertStats: AlertStats;
}

function KpiCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border border-[#171717] bg-[#0a0a0a] p-4">
      <p className="text-xs text-[#525252] uppercase tracking-widest mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

export default function AdminPage() {
  const [token, setToken] = useState(
    () => sessionStorage.getItem("admin-token") ?? ""
  );
  const [tokenInput, setTokenInput] = useState(token);
  const [data, setData] = useState<AdminData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const t = tokenInput.trim();
    if (!t) return;

    setIsLoading(true);
    setError(null);
    setData(null);

    try {
      const headers = { "X-Admin-Token": t };

      const [statsRes, routesRes, alertsRes] = await Promise.all([
        api.get("/admin/stats", { headers }),
        api.get("/admin/top-routes", { headers }),
        api.get("/admin/alert-stats", { headers }),
      ]);

      setData({
        stats: statsRes.data.data as AdminStats,
        topRoutes: routesRes.data.data as TopRoute[],
        alertStats: alertsRes.data.data as AlertStats,
      });

      sessionStorage.setItem("admin-token", t);
      setToken(t);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } }).response?.status;
      if (status === 401 || status === 403) {
        setError("Invalid admin token.");
      } else {
        setError("Failed to load admin data. Check your token and try again.");
      }
      sessionStorage.removeItem("admin-token");
      setToken("");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Admin</h1>
        <p className="text-sm text-[#525252]">Platform-wide statistics — requires admin token</p>
      </div>

      {/* Token form */}
      <div className="border border-[#171717] bg-[#0a0a0a] p-6 mb-8">
        <form onSubmit={handleSubmit}>
          <label className="block text-xs text-[#525252] uppercase tracking-widest mb-2">
            Admin Token
          </label>
          <div className="flex gap-3">
            <input
              type="password"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="Enter admin token"
              className="flex-1 bg-black border border-[#262626] text-white px-4 py-3 placeholder-[#525252] focus:outline-none focus:border-white transition-colors text-sm"
            />
            <button
              type="submit"
              disabled={!tokenInput.trim() || isLoading}
              className="px-6 py-3 bg-white text-black font-semibold text-sm hover:bg-[#e5e5e5] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "Loading..." : "Load"}
            </button>
          </div>
          {error && (
            <p className="text-xs text-[#dc2626] mt-3">{error}</p>
          )}
        </form>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="border border-[#171717] bg-[#0a0a0a] p-4 h-20 shimmer" />
            ))}
          </div>
        </div>
      )}

      {/* Data */}
      {data && !isLoading && (
        <div className="space-y-8">
          {/* Platform stats */}
          <div>
            <p className="text-xs text-[#525252] uppercase tracking-widest mb-4">Platform Stats</p>
            <div className="grid grid-cols-3 gap-3">
              <KpiCard label="Total Users" value={data.stats.total_users} />
              <KpiCard label="Total Searches" value={data.stats.total_searches} />
              <KpiCard label="Total Itineraries" value={data.stats.total_itineraries} />
              <KpiCard label="AI Itineraries" value={data.stats.ai_itineraries} />
              <KpiCard label="Cache Hit Rate" value={`${data.stats.cache_hit_rate.toFixed(1)}%`} />
              <KpiCard label="Cache Hits" value={data.stats.cache_hits} />
            </div>
          </div>

          {/* Top routes */}
          <div>
            <p className="text-xs text-[#525252] uppercase tracking-widest mb-4">Top Routes</p>
            <div className="border border-[#171717] bg-[#0a0a0a]">
              <div className="grid grid-cols-5 px-4 py-2 border-b border-[#171717]">
                {["Route", "Searches", "Lowest Price", "Avg Price", ""].map((h, i) => (
                  <span key={i} className="text-xs text-[#525252] uppercase tracking-widest">{h}</span>
                ))}
              </div>
              {data.topRoutes.map((route, i) => (
                <div key={i} className="grid grid-cols-5 px-4 py-3 border-b border-[#171717] last:border-0">
                  <span className="text-white font-medium text-sm">
                    {route.origin_iata} → {route.destination_iata}
                  </span>
                  <span className="text-[#525252] text-sm">{route.search_count}</span>
                  <span className="text-white text-sm">${route.lowest_price_usd.toFixed(2)}</span>
                  <span className="text-[#525252] text-sm">${route.avg_price_usd.toFixed(2)}</span>
                  <span />
                </div>
              ))}
            </div>
          </div>

          {/* Alert stats */}
          <div>
            <p className="text-xs text-[#525252] uppercase tracking-widest mb-4">Alert Stats</p>
            <div className="grid grid-cols-3 gap-3">
              <KpiCard label="Total Alerts" value={data.alertStats.total_alerts} />
              <KpiCard label="Active Alerts" value={data.alertStats.active_alerts} />
              <KpiCard label="Triggered Alerts" value={data.alertStats.triggered_alerts} />
              <KpiCard label="Inactive Alerts" value={data.alertStats.inactive_alerts} />
              <KpiCard label="Trigger Rate" value={`${data.alertStats.trigger_rate_pct.toFixed(1)}%`} />
              <KpiCard label="Avg Target Price" value={`$${data.alertStats.avg_target_price_usd.toFixed(0)}`} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}