import { useCallback, useEffect, useMemo, useState } from "react";
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BarChart3, Download, PieChart as PieChartIcon, RefreshCw, Trophy, Vote } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { PageHeader } from "../../components/ui/PageHeader";
import { Select } from "../../components/ui/Select";
import { Skeleton } from "../../components/ui/Skeleton";
import { StatCard } from "../../components/ui/StatCard";
import { useAdminSocket } from "../../hooks/useAdminSocket";
import { useAuth } from "../../contexts/AuthContext";
import { api } from "../../services/api";

type Election = { _id: string; title: string; state: string; status: string };
type CandidateStat = { _id: string; candidateName: string; partyName: string; voteCount: number };

const COLORS = ["#0f172a", "#2563eb", "#10b981", "#f59e0b", "#f43f5e", "#8b5cf6", "#ec4899"];

const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", 
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", 
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", 
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

export function ResultsPage() {
  const { user } = useAuth();
  const [elections, setElections] = useState<Election[]>([]);
  const [selectedState, setSelectedState] = useState("");
  const [electionId, setElectionId] = useState("");
  const [totalVotes, setTotalVotes] = useState(0);
  const [byCandidate, setByCandidate] = useState<CandidateStat[]>([]);
  const [loadingElections, setLoadingElections] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filteredElections = useMemo(() => {
    if (!selectedState) return elections;
    return elections.filter(e => e.state === selectedState);
  }, [elections, selectedState]);

  const loadElections = useCallback(async () => {
    setLoadingElections(true);
    try {
      const res = await api.get("/api/elections");
      setElections(res.data.elections);
      if (!electionId && res.data.elections?.[0]?._id) {
        setElectionId(res.data.elections[0]._id);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Unable to load elections");
    } finally {
      setLoadingElections(false);
    }
  }, [electionId]);

  const loadStats = useCallback(async () => {
    if (!electionId) {
      setLoadingStats(false);
      return;
    }

    setLoadingStats(true);
    setError(null);
    try {
      const res = await api.get(`/api/monitoring/elections/${electionId}`);
      setTotalVotes(res.data.totalVotes);
      setByCandidate(res.data.byCandidate);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Unable to load result analytics");
    } finally {
      setLoadingStats(false);
    }
  }, [electionId]);

  useEffect(() => {
    loadElections();
  }, [loadElections]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // When filtered elections change and current electionId is not in it, reset it
  useEffect(() => {
    if (selectedState && filteredElections.length > 0 && !filteredElections.find(e => e._id === electionId)) {
      setElectionId(filteredElections[0]._id);
    }
  }, [filteredElections, selectedState, electionId]);

  useAdminSocket(
    useCallback(
      (event, payload) => {
        if (event === "vote_cast" && payload?.electionId === electionId) loadStats();
      },
      [electionId, loadStats]
    )
  );

  const activeElection = elections.find((e) => e._id === electionId) || null;
  const pieData = useMemo(() => byCandidate.map((c) => ({ name: c.candidateName, value: c.voteCount })), [byCandidate]);
  const leadingCandidate = byCandidate[0] || null;

  const handleDownloadPDF = async () => {
    if (!activeElection) return;
    try {
      const res = await api.get(`/api/elections/${activeElection._id}/download`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `results-${activeElection._id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to download PDF");
    }
  };

  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="Results"
        title="Election Results"
        description="View live standings and download official reports."
        actions={
          <div className="flex w-full min-w-[300px] flex-col gap-3 sm:w-auto sm:flex-row sm:items-end">
            {user?.role === "SUPER_ADMIN" && (
              <div className="w-full sm:w-48">
                <Select 
                  label="State" 
                  value={selectedState} 
                  onChange={(e) => setSelectedState(e.target.value)}
                >
                  <option value="">All States</option>
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </Select>
              </div>
            )}
            <div className="w-full min-w-[200px] sm:w-64">
              <Select label="Select Election" value={electionId} onChange={(e) => setElectionId(e.target.value)} disabled={loadingElections}>
                {filteredElections.length === 0 ? (
                  <option value="">No elections found</option>
                ) : (
                  filteredElections.map((e) => (
                    <option key={e._id} value={e._id}>
                      {e.title} {!selectedState && `(${e.state})`}
                    </option>
                  ))
                )}
              </Select>
            </div>
            <Button variant="secondary" onClick={loadStats} loading={loadingStats} className="!h-11 !rounded-lg border-neutral-200">
              <RefreshCw className="h-4 w-4" />
            </Button>
            {activeElection && byCandidate.length > 0 && (
              <Button onClick={handleDownloadPDF} className="!h-11 !rounded-lg bg-brand-950 font-bold">
                <Download className="h-4 w-4" />
                <span>PDF</span>
              </Button>
            )}
          </div>
        }
      />

      {error ? (
        <div className="rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-xs font-bold text-danger-800">
          ERROR: {error}
        </div>
      ) : null}

      {loadingStats ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="p-6 border-neutral-100 shadow-sm">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="mt-5 h-10 w-24" />
              <Skeleton className="mt-4 h-12 w-12 !rounded-lg" />
            </Card>
          ))}
        </div>
      ) : !activeElection ? (
        <EmptyState
          icon={BarChart3}
          title="No results to show"
          description="Select an election to view the current standings."
        />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <StatCard
              label="Votes Cast"
              value={totalVotes}
              detail="Total verified ballots"
              icon={Vote}
              accent="brand"
            />
            <StatCard
              label="Candidates"
              value={byCandidate.length}
              detail={`Status: ${activeElection.status.toUpperCase()}`}
              icon={PieChartIcon}
              accent="secondary"
            />
            <StatCard
              label="Leader"
              value={leadingCandidate ? leadingCandidate.candidateName : "--"}
              detail={leadingCandidate ? `${leadingCandidate.voteCount} Votes` : "No votes yet"}
              icon={Trophy}
              accent="success"
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card className="border-neutral-100 shadow-sm overflow-hidden">
              <div className="p-6 sm:p-8">
                <h3 className="text-xl font-bold text-neutral-900 mb-6">Vote Distribution</h3>
                <div className="h-80 w-full">
                  {pieData.length === 0 ? (
                    <EmptyState
                      icon={PieChartIcon}
                      title="No data"
                      description="Voting data will appear here once the first ballot is cast."
                    />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Tooltip 
                          contentStyle={{ 
                            borderRadius: '12px', 
                            border: 'none',
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}
                        />
                        <Pie 
                          data={pieData} 
                          dataKey="value" 
                          nameKey="name" 
                          outerRadius={100} 
                          innerRadius={60}
                          paddingAngle={5}
                        >
                          {pieData.map((_, idx) => (
                            <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </Card>

            <Card className="border-neutral-100 shadow-sm overflow-hidden">
               <div className="p-6 sm:p-8">
                <h3 className="text-xl font-bold text-neutral-900 mb-6">Standings</h3>
                <div className="h-80 w-full">
                  {byCandidate.length === 0 ? (
                    <EmptyState
                      icon={BarChart3}
                      title="No data"
                      description="Standing will appear here as votes are tabulated."
                    />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={byCandidate} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                        <XAxis 
                          dataKey="candidateName" 
                          tickLine={false} 
                          axisLine={false} 
                          tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
                          dy={10}
                        />
                        <YAxis 
                          tickLine={false} 
                          axisLine={false} 
                          tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            borderRadius: '12px', 
                            border: 'none',
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}
                          cursor={{ fill: '#f1f5f9' }}
                        />
                        <Bar 
                          dataKey="voteCount" 
                          fill="#0f172a" 
                          radius={[4, 4, 4, 4]} 
                          barSize={40}
                        >
                           {byCandidate.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </Card>
          </div>

          <Card className="border-neutral-100 shadow-sm overflow-hidden">
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-neutral-900">Detailed Results</h3>
                <Badge tone="brand" className="h-7 !px-4 !rounded-lg uppercase font-bold text-[10px] tracking-wider">
                  {activeElection.status}
                </Badge>
              </div>

              {byCandidate.length === 0 ? (
                <div className="py-12">
                  <EmptyState
                    icon={Trophy}
                    title="No Rankings Available"
                    description="Formal rankings will populate once the cycle has registered ballots."
                  />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-neutral-100">
                        <th className="py-4 pr-4 text-[10px] font-bold uppercase tracking-widest text-neutral-400 text-left">Rank</th>
                        <th className="py-4 pr-4 text-[10px] font-bold uppercase tracking-widest text-neutral-400 text-left">Candidate</th>
                        <th className="py-4 pr-4 text-[10px] font-bold uppercase tracking-widest text-neutral-400 text-left">Party</th>
                        <th className="py-4 pr-4 text-[10px] font-bold uppercase tracking-widest text-neutral-400 text-left">Votes</th>
                        <th className="py-4 text-[10px] font-bold uppercase tracking-widest text-neutral-400 text-right">Share</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-50">
                      {byCandidate.map((candidate, index) => {
                        const share = totalVotes > 0 ? ((candidate.voteCount / totalVotes) * 100).toFixed(1) : "0.0";
                        return (
                          <tr key={candidate._id} className="group hover:bg-neutral-50/50 transition-colors">
                            <td className="py-5 pr-4">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 text-sm font-bold text-neutral-600 group-hover:bg-brand-950 group-hover:text-white transition-all">
                                {index + 1}
                              </div>
                            </td>
                            <td className="py-5 pr-4">
                              <div className="text-sm font-bold text-neutral-900">{candidate.candidateName}</div>
                            </td>
                            <td className="py-5 pr-4">
                              <div className="text-xs font-bold text-neutral-400 uppercase tracking-widest">{candidate.partyName}</div>
                            </td>
                            <td className="py-5 pr-4">
                              <div className="text-sm font-bold text-neutral-800">{candidate.voteCount.toLocaleString()}</div>
                            </td>
                            <td className="py-5 text-right">
                              <div className="inline-flex items-center gap-2">
                                <div className="h-1.5 w-16 overflow-hidden rounded-full bg-neutral-100 hidden sm:block">
                                  <div 
                                    className="h-full bg-brand-950 transition-all duration-1000" 
                                    style={{ width: `${share}%` }}
                                  />
                                </div>
                                <span className="text-sm font-bold text-brand-950 w-12">{share}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
