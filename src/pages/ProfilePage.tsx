import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useAuthStore } from "../stores/authStore";

interface User {
  id: string;
  email: string;
  full_name: string;
  home_airport: string;
  currency: string;
  created_at: string;
  updated_at: string;
}

const CURRENCY_OPTIONS = ["AED", "USD", "EUR", "GBP", "SGD", "INR", "AUD"];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const fetchMe = useAuthStore((s) => s.fetchMe);

  const { data: user, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await api.get("/users/me");
      return res.data.data as User;
    },
  });

  const [fullName, setFullName] = useState("");
  const [homeAirport, setHomeAirport] = useState("");
  const [currency, setCurrency] = useState("");
  const [formInit, setFormInit] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Initialise form once user loads
  if (user && !formInit) {
    setFullName(user.full_name ?? "");
    setHomeAirport(user.home_airport ?? "");
    setCurrency(user.currency ?? "USD");
    setFormInit(true);
  }

  const updateMutation = useMutation({
    mutationFn: async () => {
      const res = await api.put("/users/me", {
        full_name: fullName,
        home_airport: homeAirport.toUpperCase(),
        currency,
      });
      return res.data.data as User;
    },
    onSuccess: () => {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      fetchMe();
    },
  });

  const canSubmit =
    fullName.trim().length > 0 &&
    homeAirport.trim().length === 3 &&
    currency.trim().length > 0 &&
    !updateMutation.isPending;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateMutation.mutate();
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4">
        <div className="mb-10">
          <div className="h-8 w-32 bg-[#171717] shimmer mb-2" />
          <div className="h-4 w-48 bg-[#171717] shimmer" />
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="border border-[#171717] bg-[#0a0a0a] p-6 space-y-4">
            {[0, 1, 2, 3, 4].map((i) => <div key={i} className="h-8 bg-[#171717] shimmer" />)}
          </div>
          <div className="border border-[#171717] bg-[#0a0a0a] p-6 space-y-4">
            {[0, 1, 2, 3].map((i) => <div key={i} className="h-10 bg-[#171717] shimmer" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Profile</h1>
        <p className="text-sm text-[#525252]">Your account details and preferences</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Left — Stats */}
        <div className="border border-[#171717] bg-[#0a0a0a] p-6">
          <p className="text-xs text-[#525252] uppercase tracking-widest mb-6">Account Info</p>

          <div className="space-y-5">
            <div>
              <p className="text-xs text-[#525252] uppercase tracking-widest mb-1">Email</p>
              <p className="text-white font-medium">{user?.email}</p>
            </div>
            <div>
              <p className="text-xs text-[#525252] uppercase tracking-widest mb-1">Full Name</p>
              <p className="text-white font-medium">{user?.full_name}</p>
            </div>
            <div>
              <p className="text-xs text-[#525252] uppercase tracking-widest mb-1">Home Airport</p>
              <p className="text-white font-medium">{user?.home_airport}</p>
            </div>
            <div>
              <p className="text-xs text-[#525252] uppercase tracking-widest mb-1">Currency</p>
              <p className="text-white font-medium">{user?.currency}</p>
            </div>
            <div>
              <p className="text-xs text-[#525252] uppercase tracking-widest mb-1">Member Since</p>
              <p className="text-white font-medium">{user ? formatDate(user.created_at) : "—"}</p>
            </div>
            <div>
              <p className="text-xs text-[#525252] uppercase tracking-widest mb-1">Last Updated</p>
              <p className="text-white font-medium">{user ? formatDate(user.updated_at) : "—"}</p>
            </div>
            <div>
              <p className="text-xs text-[#525252] uppercase tracking-widest mb-1">User ID</p>
              <p className="text-[#525252] text-xs font-mono">{user?.id}</p>
            </div>
          </div>
        </div>

        {/* Right — Edit form */}
        <div className="border border-[#171717] bg-[#0a0a0a] p-6">
          <p className="text-xs text-[#525252] uppercase tracking-widest mb-6">Edit Profile</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-[#525252] uppercase tracking-widest mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
                className="w-full bg-black border border-[#262626] text-white px-4 py-3 placeholder-[#525252] focus:outline-none focus:border-white transition-colors text-sm"
              />
            </div>

            <div>
              <label className="block text-xs text-[#525252] uppercase tracking-widest mb-2">
                Home Airport
              </label>
              <input
                type="text"
                maxLength={3}
                value={homeAirport}
                onChange={(e) => setHomeAirport(e.target.value.toUpperCase())}
                placeholder="DXB"
                className="w-full bg-black border border-[#262626] text-white text-2xl font-bold tracking-widest px-4 py-3 uppercase placeholder-[#525252] focus:outline-none focus:border-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs text-[#525252] uppercase tracking-widest mb-2">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-black border border-[#262626] text-white px-4 py-3 focus:outline-none focus:border-white transition-colors text-sm appearance-none"
              >
                {CURRENCY_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full py-3 bg-white text-black font-semibold text-sm tracking-wide hover:bg-[#e5e5e5] disabled:opacity-30 disabled:cursor-not-allowed transition-colors mt-2"
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </button>

            {saveSuccess && (
              <p className="text-xs text-[#16a34a] text-center">
                Profile updated successfully
              </p>
            )}

            {updateMutation.isError && (
              <p className="text-xs text-[#dc2626] text-center">
                Failed to update profile. Try again.
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}