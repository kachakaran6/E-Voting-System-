import { useCallback, useEffect, useMemo, useState } from "react";
import { Download, MapPin, Pause, Play, Plus, RefreshCw, ShieldCheck, SquareSlash } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Skeleton } from "../../components/ui/Skeleton";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { useAdminSocket } from "../../hooks/useAdminSocket";
import { api } from "../../services/api";
import { formatDateTime } from "../../utils/format";
import { STATES } from "../../utils/constants";

type Election = {
  _id: string;
  title: string;
  state: string;
  startDate: string;
  endDate: string;
  status: "upcoming" | "active" | "paused" | "closed";
  locked: boolean;
};

function getStatusTone(status: Election["status"]) {
  switch (status) {
    case "active": return "success";
    case "paused": return "warning";
    case "closed": return "danger";
    default: return "secondary";
  }
}

export function ElectionsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [items, setItems] = useState<Election[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [selectedFilterState, setSelectedFilterState] = useState("");

  const [title, setTitle] = useState("");
  const [stateName, setStateName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const canManage = useMemo(() => user?.role === "ADMIN" || user?.role === "SUPER_ADMIN", [user]);

  useEffect(() => {
    if (showAddForm && user?.role === "ADMIN" && user.state) {
      setStateName(user.state);
    }
  }, [user, showAddForm]);

  const filteredItems = useMemo(() => {
    if (!selectedFilterState) return items;
    return items.filter(i => i.state === selectedFilterState);
  }, [items, selectedFilterState]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/api/elections");
      setItems(res.data.elections);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Unable to load elections");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useAdminSocket(useCallback(() => { load(); }, [load]));

  async function save() {
    setError(null);
    setSaving(true);
    try {
      const payload = { 
        title, 
        state: stateName, 
        startDate: new Date(startDate).toISOString(), 
        endDate: new Date(endDate).toISOString() 
      };

      if (editingId) {
        const res = await api.put(`/api/elections/${editingId}`, payload);
        setItems(s => s.map(i => i._id === editingId ? res.data.election : i));
        showToast({ tone: "success", title: "Updated", description: "Changes saved." });
      } else {
        const res = await api.post("/api/elections", payload);
        setItems((s) => [res.data.election, ...s]);
        showToast({ tone: "success", title: "Created", description: "Cycle registered." });
      }

      setTitle("");
      setStateName(user?.role === "ADMIN" ? user.state || "" : "");
      setStartDate("");
      setEndDate("");
      setShowAddForm(false);
      setEditingId(null);
    } catch (err: any) {
      const message = err?.response?.data?.message || "Action failed";
      setError(message);
      showToast({ tone: "error", title: "Failed", description: message });
    } finally {
      setSaving(false);
    }
  }

  function startEdit(election: Election) {
    setTitle(election.title);
    setStateName(election.state);
    const start = new Date(election.startDate);
    const end = new Date(election.endDate);
    setStartDate(new Date(start.getTime() - start.getTimezoneOffset() * 60000).toISOString().slice(0, 16));
    setEndDate(new Date(end.getTime() - end.getTimezoneOffset() * 60000).toISOString().slice(0, 16));
    setEditingId(election._id);
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function action(id: string, act: "pause" | "resume" | "end-early") {
    setError(null);
    setActionId(`${id}-${act}`);
    try {
      await api.post(`/api/elections/${id}/${act}`);
      await load();
      showToast({ tone: "success", title: "Updated", description: `Cycle ${act}d.` });
    } catch (err: any) {
      const message = err?.response?.data?.message || "Action failed";
      setError(message);
      showToast({ tone: "error", title: "Failed", description: message });
    } finally {
      setActionId(null);
    }
  }

  return (
    <div className="grid gap-6">
      {showAddForm && canManage && (
        <Card className="border-neutral-100 shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-4">
          <div className="bg-white p-6 sm:p-8">
            <h2 className="text-xl font-bold text-neutral-900 mb-6 uppercase tracking-tight">{editingId ? "Edit Cycle" : "New Cycle"}</h2>
            <div className="grid gap-6 lg:grid-cols-4">
              <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. 2026 Lok Sabha" className="!rounded-lg" />
              {user?.role === "SUPER_ADMIN" ? (
                <Select label="Jurisdiction" value={stateName} onChange={(e) => setStateName(e.target.value)}>
                  <option value="">Select State</option>
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </Select>
              ) : (
                <div className="space-y-2">
                  <div className="ml-1 text-[11px] font-bold text-neutral-400 uppercase tracking-widest">Jurisdiction</div>
                  <div className="h-10 w-full flex items-center px-4 rounded-xl border border-neutral-100 bg-neutral-50 text-xs font-bold text-neutral-900">{user?.state}</div>
                </div>
              )}
              <Input label="Start" type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="!rounded-lg" />
              <Input label="End" type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="!rounded-lg" />
            </div>
            <div className="mt-8 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => { setShowAddForm(false); setEditingId(null); setTitle(""); setStartDate(""); setEndDate(""); }} className="!rounded-lg font-bold">Discard</Button>
              <Button onClick={save} loading={saving} disabled={!title || !stateName || !startDate || !endDate} className="min-w-[150px] !rounded-lg font-bold bg-brand-950">Register</Button>
            </div>
          </div>
        </Card>
      )}

      {error ? <div className="rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-xs font-bold text-danger-800 uppercase">{error}</div> : null}

      <Card className="border-neutral-100 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between mb-10 pb-8 border-b border-neutral-50">
            <div className="flex items-center gap-4">
              <h3 className="text-2xl font-bold text-neutral-900 uppercase tracking-tight">Election Registry</h3>
              <Badge tone="brand" className="h-6 !px-3 !rounded-lg font-bold">{filteredItems.length}</Badge>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center bg-neutral-50 px-3 py-1 rounded-xl border border-neutral-100">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest pr-3 border-r border-neutral-200 mr-3">Region</span>
                <Select value={selectedFilterState} onChange={(e) => setSelectedFilterState(e.target.value)} className="!w-40 !h-8 !bg-transparent !border-none !shadow-none !text-[11px] font-bold">
                  <option value="">All Regions</option>
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </Select>
              </div>

              <div className="flex items-center gap-2 border-l border-neutral-100 pl-3">
                <Button size="icon" variant="secondary" onClick={load} loading={loading} className="!rounded-lg border-neutral-100 shadow-sm transition-all hover:bg-neutral-50" title="Refresh List">
                  <RefreshCw className="h-5 w-5 text-neutral-600" />
                </Button>
                {canManage && (
                  <Button onClick={() => setShowAddForm(!showAddForm)} className="!rounded-lg h-9 font-bold bg-brand-950 text-xs px-4">
                    <Plus className="h-3.5 w-3.5" />
                    <span>{showAddForm ? "Close Form" : "New Election"}</span>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {loading ? (
             <div className="grid gap-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex h-20 items-center justify-between border-b border-neutral-50 pr-4">
                  <div className="space-y-2"><Skeleton className="h-4 w-48" /><Skeleton className="h-3 w-32" /></div>
                  <Skeleton className="h-8 w-24" />
                </div>
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-12"><EmptyState icon={ShieldCheck} title="No cycles found" description="Start by adding your first election cycle." /></div>
          ) : (
            <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-neutral-100">
                      <th className="py-4 pr-4 text-[10px] font-bold uppercase tracking-widest text-neutral-400 text-left">Internal Context</th>
                      <th className="py-4 pr-4 text-[10px] font-bold uppercase tracking-widest text-neutral-400 text-left">State</th>
                      <th className="py-4 pr-4 text-[10px] font-bold uppercase tracking-widest text-neutral-400 text-left">Status</th>
                      <th className="py-4 pr-4 text-[10px] font-bold uppercase tracking-widest text-neutral-400 text-left">Schedule</th>
                      <th className="py-4 text-[10px] font-bold uppercase tracking-widest text-neutral-400 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-50">
                    {filteredItems.map((e) => (
                      <tr key={e._id} className="group hover:bg-neutral-50/50 transition-colors">
                        <td className="py-5 pr-4">
                          <div className="text-sm font-bold text-neutral-900 uppercase tracking-tight">{e.title}</div>
                          <div className="mt-1 text-[10px] font-bold text-neutral-400 uppercase">#{e._id.slice(-8)}</div>
                        </td>
                        <td className="py-5 pr-4">
                          <div className="flex items-center gap-2 text-sm font-bold text-neutral-600"><MapPin className="h-3.5 w-3.5" />{e.state}</div>
                        </td>
                        <td className="py-5 pr-4">
                          <Badge tone={getStatusTone(e.status)} className="!rounded-md font-bold uppercase text-[9px] tracking-wider">{e.status}</Badge>
                        </td>
                        <td className="py-5 pr-4">
                          <div className="text-[11px] font-bold text-neutral-500 space-y-1.5">
                            <div className="flex items-center gap-3">
                              <span className="w-12 uppercase text-[9px] font-extrabold text-neutral-400 tracking-wider">Start</span>
                              <span className="text-neutral-700">{formatDateTime(e.startDate)}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="w-12 uppercase text-[9px] font-extrabold text-neutral-400 tracking-wider">End</span>
                              <span className="text-neutral-700">{formatDateTime(e.endDate)}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-5 text-right">
                          <div className="flex justify-end gap-2">
                             {!e.locked && e.status !== "closed" && (
                               <Button size="icon" variant="secondary" className="!rounded-lg border-neutral-200" onClick={() => startEdit(e)} title="Edit"><RefreshCw className="h-5 w-5" /></Button>
                             )}
                             {e.status === "active" ? (
                               <Button size="icon" variant="secondary" className="!rounded-lg border-neutral-200" loading={actionId === `${e._id}-pause`} onClick={() => action(e._id, "pause")} disabled={e.locked} title="Pause"><Pause className="h-5 w-5" /></Button>
                             ) : (
                               <Button size="icon" variant="secondary" className="!rounded-lg border-neutral-200" loading={actionId === `${e._id}-resume`} onClick={() => action(e._id, "resume")} disabled={e.locked || e.status === "closed"} title="Resume"><Play className="h-5 w-5" /></Button>
                             )}
                             <Button size="icon" variant="secondary" className="!rounded-lg border-neutral-200 text-brand-700" onClick={() => { const token = localStorage.getItem("securevote_token") || ""; window.open(`${api.defaults.baseURL}/api/elections/${e._id}/download?token=${token}`, "_blank"); }} title="Download"><Download className="h-5 w-5" /></Button>
                             <Button size="icon" variant="danger" className="!rounded-lg" loading={actionId === `${e._id}-end-early`} onClick={() => action(e._id, "end-early")} disabled={e.locked || e.status === "closed"} title="Terminate"><SquareSlash className="h-5 w-5" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
