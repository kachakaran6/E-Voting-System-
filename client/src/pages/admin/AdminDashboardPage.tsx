import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Activity, ArrowRight, BarChart3, ShieldCheck, Users, Vote } from "lucide-react";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Badge } from "../../components/ui/Badge";
import { Select } from "../../components/ui/Select";
import { STATES } from "../../utils/constants";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { PageHeader } from "../../components/ui/PageHeader";
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

  useAdminSocket(
    useCallback(() => {
      load();
    }, [load])
  );

  if (!user) return null;

  if (user.role === "VOTER") {
    return (
      <div className="grid gap-6">
        <PageHeader
          eyebrow="Portal"
          title="Voter Dashboard"
          description="Track your voting participation and access election results."
          actions={
            <Link to="/app/ballot">
              <Button className="!rounded-lg shadow-lg shadow-brand-950/20 font-bold bg-brand-950">
                <span>Go to Ballot</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          }
        />

        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="p-8 border-neutral-100 shadow-sm hover:shadow-md transition-all">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand-950 shadow-sm border border-brand-100">
              <Vote className="h-6 w-6" />
            </div>
            <h3 className="mt-6 text-xl font-bold text-neutral-900">Secure Voting</h3>
            <p className="mt-2 text-sm font-medium leading-relaxed text-neutral-500">
              Participate in secure online elections. Your voice matters, and our platform ensures every vote is counted accurately.
            </p>
          </Card>

          <Card className="p-8 border-neutral-100 shadow-sm hover:shadow-md transition-all">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-success-50 text-success-700 shadow-sm border border-success-100">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="mt-6 text-xl font-bold text-neutral-900">Verified Results</h3>
            <p className="mt-2 text-sm font-medium leading-relaxed text-neutral-500">
              All votes are cryptographically secured. You'll receive a digital receipt after voting for personal verification.
            </p>
          </Card>
        </div>
      </div>
    );
  }

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
      <PageHeader
        eyebrow="Dashboard"
        title="Platform Overview"
        description="Monitor current election activity and system statistics."
        actions={
          user.role === "SUPER_ADMIN" ? (
            <div className="flex items-center gap-3 bg-white p-1.5 pl-4 rounded-xl border border-neutral-100 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">STATE:</span>
              <Select 
                value={selectedState} 
                onChange={e => setSelectedState(e.target.value)}
                className="!h-8 !border-none !shadow-none !bg-transparent !w-40 font-bold text-neutral-900"
              >
                <option value="">National (All)</option>
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </Select>
            </div>
          ) : undefined
        }
      />

      {error ? (
        <div className="rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-xs font-bold text-danger-800 uppercase">
          {error}
        </div>
      ) : null}

      {loading && !metrics ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="p-6 border-neutral-100 shadow-sm animate-pulse">
                <div className="h-4 w-28 bg-neutral-100 rounded" />
                <div className="mt-5 h-10 w-24 bg-neutral-100 rounded" />
                <div className="mt-4 h-12 w-12 bg-neutral-50 rounded-lg" />
              </Card>
            ))}
          </div>
          <Card className="p-8 border-neutral-100 shadow-sm animate-pulse">
             <div className="h-6 w-48 bg-neutral-100 rounded" />
             <div className="mt-3 h-4 w-72 bg-neutral-100 rounded" />
             <div className="mt-8 h-80 w-full bg-neutral-50 rounded-lg" />
          </Card>
        </>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total Votes"
              value={metrics?.totalVotes ?? 0}
              detail="Ballots cast"
              icon={Vote}
              accent="brand"
            />
            <StatCard
              label="Active Elections"
              value={metrics?.activeElections ?? 0}
              detail="Live elections"
              icon={Activity}
              accent="success"
            />
            <StatCard
              label="Total Elections"
              value={metrics?.totalElections ?? 0}
              detail="Total cycles"
              icon={ShieldCheck}
              accent="secondary"
            />
            <StatCard
              label="Total Candidates"
              value={metrics?.totalCandidates ?? 0}
              detail="Certified candidates"
              icon={Users}
              accent="warning"
            />
          </div>

          <Card className="border-neutral-100 shadow-sm overflow-hidden">
            <div className="bg-white p-6 sm:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-50 pb-6 mb-8">
                <div>
                  <h3 className="text-xl font-bold text-neutral-900">Platform Statistics</h3>
                  <p className="mt-1 text-sm font-medium text-neutral-500">
                    Live performance indicators across the system.
                  </p>
                </div>
                <Badge tone="brand" className="h-7 !px-4 !rounded-lg font-bold">Live</Badge>
              </div>

              <div className="h-80 w-full">
                {chartData.length === 0 ? (
                  <EmptyState
                    icon={BarChart3}
                    title="No activity yet"
                    description="Statistics will appear once elections are created and voting begins."
                  />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                      <XAxis 
                        dataKey="name" 
                        tickLine={false} 
                        axisLine={false} 
                        tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                        dy={10}
                      />
                      <YAxis 
                        tickLine={false} 
                        axisLine={false} 
                        tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          borderRadius: '12px', 
                          border: 'none',
                          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          padding: '12px'
                        }}
                        cursor={{ fill: '#f8fafc' }}
                      />
                      <Bar 
                        dataKey="value" 
                        radius={[6, 6, 6, 6]} 
                        barSize={60}
                      >
                         {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
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
