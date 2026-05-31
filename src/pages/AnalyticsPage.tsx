import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface SearchHistory {
  id: string;
  origin_iata: string;
  destination_iata: string;
  result_count: number;
  min_price_usd: number;
  cache_hit: boolean;
  searched_at: string;
}

interface TopRoute {
  origin_iata: string;
  destination_iata: string;
  search_count: number;
  lowest_price_seen: number;
  last_searched_at: string;
}

interface PriceTrend {
  origin_iata: string;
  destination_iata: string;
  search_count: number;
  avg_price_usd: number;
  min_price_usd: number;
  max_price_usd: number;
}

interface ChartEntry {
  index: number;
  date: string;
  price: number;
  route: string;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-bold text-white">{title}</h2>
      {subtitle && <p className="text-xs text-[#525252]">{subtitle}</p>}
    </div>
  );
}

function LoadingBlock() {
  return (
    <div className="border border-[#171717] bg-[#0a0a0a] p-6 space-y-3">
      <div className="h-4 w-32 bg-[#171717] shimmer" />
      <div className="h-32 bg-[#171717] shimmer" />
    </div>
  );
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; payload: ChartEntry }[]; label?: string }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{ background: "#0a0a0a", border: "1px solid #262626", padding: "8px 12px", fontSize: 12 }}>
      <p style={{ color: "#525252", marginBottom: 4 }}>{label}</p>
      <p style={{ color: "#ffffff" }}>{payload[0].payload.route} — ${payload[0].value.toFixed(2)}</p>
    </div>
  );
}

export default function AnalyticsPage() {
  const { data: searchData, isLoading: searchLoading } = useQuery({
    queryKey: ["my-searches"],
    queryFn: async () => {
      const res = await api.get("/analytics/my-searches");
      return res.data.data as SearchHistory[];
    },
  });

  const { data: topRoutes, isLoading: routesLoading } = useQuery({
    queryKey: ["top-routes"],
    queryFn: async () => {
      const res = await api.get("/analytics/top-routes");
      return res.data.data as TopRoute[];
    },
  });

  const { data: priceTrends, isLoading: trendsLoading } = useQuery({
    queryKey: ["price-trends"],
    queryFn: async () => {
      const res = await api.get("/analytics/price-trends");
      return res.data.data as PriceTrend[];
    },
  });

  const chartData: ChartEntry[] = searchData
    ? [...searchData]
        .reverse()
        .slice(-20)
        .map((s, i) => ({
          index: i + 1,
          date: formatDate(s.searched_at),
          price: s.min_price_usd,
          route: `${s.origin_iata}→${s.destination_iata}`,
        }))
    : [];

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Analytics</h1>
        <p className="text-sm text-[#525252]">Your search history and price trends</p>
      </div>

      {/* KPI cards */}
      {searchData && topRoutes && (
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="border border-[#171717] bg-[#0a0a0a] p-4">
            <p className="text-xs text-[#525252] uppercase tracking-widest mb-1">Total Searches</p>
            <p className="text-2xl font-bold text-white">{searchData.length}</p>
          </div>
          <div className="border border-[#171717] bg-[#0a0a0a] p-4">
            <p className="text-xs text-[#525252] uppercase tracking-widest mb-1">Top Route</p>
            <p className="text-2xl font-bold text-white">
              {topRoutes[0] ? `${topRoutes[0].origin_iata}→${topRoutes[0].destination_iata}` : "—"}
            </p>
          </div>
          <div className="border border-[#171717] bg-[#0a0a0a] p-4">
            <p className="text-xs text-[#525252] uppercase tracking-widest mb-1">Best Price Seen</p>
            <p className="text-2xl font-bold text-white">
              {topRoutes[0] ? `$${topRoutes[0].lowest_price_seen.toFixed(0)}` : "—"}
            </p>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="mb-8">
        <SectionHeader title="Price History" subtitle="Minimum price per search over time" />
        {searchLoading && <LoadingBlock />}
        {!searchLoading && chartData.length > 0 && (
          <div className="border border-[#171717] bg-[#0a0a0a] p-6">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#525252", fontSize: 11 }}
                  axisLine={{ stroke: "#171717" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#525252", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `$${v}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#ffffff"
                  strokeWidth={1.5}
                  dot={{ fill: "#ffffff", r: 3, strokeWidth: 0 }}
                  activeDot={{ fill: "#ffffff", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        {!searchLoading && chartData.length === 0 && (
          <div className="border border-[#171717] bg-[#0a0a0a] p-8 text-center">
            <p className="text-[#525252] text-sm">No search history yet</p>
          </div>
        )}
      </div>

      {/* Top routes */}
      <div className="mb-8">
        <SectionHeader title="Top Routes" subtitle="Your most searched routes" />
        {routesLoading && <LoadingBlock />}
        {!routesLoading && topRoutes && topRoutes.length > 0 && (
          <div className="border border-[#171717] bg-[#0a0a0a]">
            <div className="grid grid-cols-4 px-4 py-2 border-b border-[#171717]">
              {["Route", "Searches", "Best Price", "Last Searched"].map((h) => (
                <span key={h} className="text-xs text-[#525252] uppercase tracking-widest">{h}</span>
              ))}
            </div>
            {topRoutes.map((route, i) => (
              <div key={i} className="grid grid-cols-4 px-4 py-3 border-b border-[#171717] last:border-0">
                <span className="text-white font-medium text-sm">{route.origin_iata} → {route.destination_iata}</span>
                <span className="text-[#525252] text-sm">{route.search_count}</span>
                <span className="text-white text-sm font-medium">${route.lowest_price_seen.toFixed(2)}</span>
                <span className="text-[#525252] text-sm">{formatDate(route.last_searched_at)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Price trends */}
      <div className="mb-8">
        <SectionHeader title="Price Trends" subtitle="Average, min and max prices per route" />
        {trendsLoading && <LoadingBlock />}
        {!trendsLoading && priceTrends && priceTrends.length > 0 && (
          <div className="border border-[#171717] bg-[#0a0a0a]">
            <div className="grid grid-cols-5 px-4 py-2 border-b border-[#171717]">
              {["Route", "Searches", "Avg", "Min", "Max"].map((h) => (
                <span key={h} className="text-xs text-[#525252] uppercase tracking-widest">{h}</span>
              ))}
            </div>
            {priceTrends.map((trend, i) => (
              <div key={i} className="grid grid-cols-5 px-4 py-3 border-b border-[#171717] last:border-0">
                <span className="text-white font-medium text-sm">{trend.origin_iata} → {trend.destination_iata}</span>
                <span className="text-[#525252] text-sm">{trend.search_count}</span>
                <span className="text-white text-sm">${trend.avg_price_usd.toFixed(2)}</span>
                <span className="text-[#525252] text-sm">${trend.min_price_usd.toFixed(2)}</span>
                <span className="text-[#525252] text-sm">${trend.max_price_usd.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent searches */}
      <div>
        <SectionHeader title="Recent Searches" subtitle="Last 20 flight searches" />
        {searchLoading && <LoadingBlock />}
        {!searchLoading && searchData && searchData.length > 0 && (
          <div className="border border-[#171717] bg-[#0a0a0a]">
            <div className="grid grid-cols-5 px-4 py-2 border-b border-[#171717]">
              {["Route", "Results", "Min Price", "Cache", "Date"].map((h) => (
                <span key={h} className="text-xs text-[#525252] uppercase tracking-widest">{h}</span>
              ))}
            </div>
            {searchData.slice(0, 20).map((s) => (
              <div key={s.id} className="grid grid-cols-5 px-4 py-3 border-b border-[#171717] last:border-0">
                <span className="text-white text-sm font-medium">{s.origin_iata} → {s.destination_iata}</span>
                <span className="text-[#525252] text-sm">{s.result_count}</span>
                <span className="text-white text-sm">${s.min_price_usd.toFixed(2)}</span>
                <span className={`text-sm ${s.cache_hit ? "text-[#16a34a]" : "text-[#525252]"}`}>
                  {s.cache_hit ? "Hit" : "Miss"}
                </span>
                <span className="text-[#525252] text-sm">{formatDate(s.searched_at)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}