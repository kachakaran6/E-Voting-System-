import { useCallback, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Activity, BarChart3, RefreshCw, ShieldCheck, Users, Vote } from "lucide-react";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Badge } from "../../components/ui/Badge";
import { Select } from "../../components/ui/Select";
import { Button } from "../../components/ui/Button";
import { STATES } from "../../utils/constants";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { StatCard } from "../../components/ui/StatCard";
import { useAuth } from "../../contexts/AuthContext";
import { useAdminSocket } from "../../hooks/useAdminSocket";
import { api } from "../../services/api";

type Metrics = {
  totalVotes: number;
  activeElections: number;
  totalElections: number;
  totalCandidates: number;
};

export function AdminDashboardPage() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState("");

  const load = useCallback(async () => {
    if (!user || user.role === "VOTER") {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const stateParam = selectedState ? `?state=${selectedState}` : "";
      const res = await api.get(`/api/monitoring/dashboard${stateParam}`);
      setMetrics(res.data.metrics);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Unable to load dashboard metrics");
    } finally {
      setLoading(false);
    }
  }, [user, selectedState]);

  useEffect(() => {
    load();
  }, [load]);

  useAdminSocket(useCallback(() => { load(); }, [load]));

  if (!user) return null;
  if (user.role === "VOTER") return <Navigate to="/app/ballot" replace />;

  const chartData = metrics
    ? [
        { name: "Total Votes", value: metrics.totalVotes, fill: "#0f172a" },
        { name: "Candidates", value: metrics.totalCandidates, fill: "#2563eb" },
        { name: "Active Elections", value: metrics.activeElections, fill: "#10b981" },
        { name: "Total Elections", value: metrics.totalElections, fill: "#64748b" },
      ]
    : [];

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between mb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-neutral-900 uppercase tracking-tight">Operations Dashboard</h2>
          <Badge tone="brand" className="h-2 w-2 !p-0 !rounded-full animate-pulse border-0 shadow-sm shadow-brand-500/50">Dot</Badge>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {user.role === "SUPER_ADMIN" && (
            <div className="flex items-center bg-white px-3 py-1 rounded-xl border border-neutral-100 shadow-sm">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest pr-3 border-r border-neutral-200 mr-3">Region</span>
                <Select value={selectedState} onChange={(e) => setSelectedState(e.target.value)} className="!w-40 !h-8 !bg-transparent !border-none !shadow-none !text-[11px] font-bold">
                    <option value="">National</option>
                    {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </Select>
            </div>
          )}
          
          <div className="flex items-center gap-2 border-l border-neutral-100 pl-3">
            <Button size="icon" variant="secondary" onClick={load} loading={loading} className="!rounded-lg h-10 w-10 border-neutral-100 shadow-sm bg-white" title="Refresh Live Data">
              <RefreshCw className="h-5 w-5 text-neutral-600" />
            </Button>
          </div>
        </div>
      </div>

      {error ? <div className="rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-xs font-bold text-danger-800 uppercase">{error}</div> : null}

      {loading && !metrics ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => <Card key={index} className="p-6 border-neutral-100 shadow-sm animate-pulse"><div className="h-4 w-28 bg-neutral-100 rounded" /><div className="mt-5 h-10 w-24 bg-neutral-100 rounded" /></Card>)}
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total Ballots" value={metrics?.totalVotes ?? 0} icon={Vote} accent="brand" />
            <StatCard label="Live Cycles" value={metrics?.activeElections ?? 0} icon={Activity} accent="success" />
            <StatCard label="Registry Size" value={metrics?.totalElections ?? 0} icon={ShieldCheck} accent="secondary" />
            <StatCard label="Candidates" value={metrics?.totalCandidates ?? 0} icon={Users} accent="warning" />
          </div>

          <Card className="border-neutral-100 shadow-sm overflow-hidden mt-2">
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between border-b border-neutral-50 pb-6 mb-8 uppercase tracking-tight font-bold text-neutral-900">
                System Distribution
              </div>
              <div className="h-80 w-full">
                {chartData.length === 0 ? <EmptyState icon={BarChart3} title="No metrics active" description="Operational data will populate once cycles begin." /> : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                      <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} dy={10} />
                      <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '11px', fontWeight: 'bold' }} cursor={{ fill: '#f8fafc' }} />
                      <Bar dataKey="value" radius={[6, 6, 6, 6]} barSize={60}>
                         {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
