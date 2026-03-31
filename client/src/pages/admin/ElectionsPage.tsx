import { useCallback, useEffect, useMemo, useState } from "react";
import { Download, MapPin, Pause, Play, Plus, RefreshCw, ShieldCheck, SquareSlash } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { PageHeader } from "../../components/ui/PageHeader";
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
    case "active":
      return "success";
    case "paused":
      return "warning";
    case "closed":
      return "danger";
    default:
      return "secondary";
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

  // Set default state for non-super-admins when form opens or user changes
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

  useEffect(() => {
    load();
  }, [load]);

  useAdminSocket(
    useCallback(() => {
      load();
    }, [load])
  );

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
        showToast({ tone: "success", title: "Election updated", description: "Changes have been saved." });
      } else {
        const res = await api.post("/api/elections", payload);
        setItems((s) => [res.data.election, ...s]);
        showToast({ tone: "success", title: "Election created", description: "The new election is now registered." });
      }

      setTitle("");
      setStateName(user?.role === "ADMIN" ? user.state || "" : "");
      setStartDate("");
      setEndDate("");
      setShowAddForm(false);
      setEditingId(null);
    } catch (err: any) {
      const message = err?.response?.data?.message || "Operation failed";
      setError(message);
      showToast({ tone: "error", title: "Action failed", description: message });
    } finally {
      setSaving(false);
    }
  }

  function startEdit(election: Election) {
    setTitle(election.title);
    setStateName(election.state);
    // Convert ISO to local datetime string format required by input (YYYY-MM-DDTHH:mm)
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
      showToast({ tone: "success", title: "Election updated", description: `Cycle successfully ${act === 'end-early' ? 'terminated' : act + 'd'}.` });
    } catch (err: any) {
      const message = err?.response?.data?.message || "Action failed";
      setError(message);
      showToast({ tone: "error", title: "Update failed", description: message });
    } finally {
      setActionId(null);
    }
  }

  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="Registry"
        title="Manage Elections"
        description="Configure election cycles and track polling Windows."
        actions={
          <div className="flex items-center gap-3">
             <Button variant="secondary" onClick={load} loading={loading} className="!rounded-lg h-10 border-neutral-200">
              <RefreshCw className="h-4 w-4" />
            </Button>
            {user?.role === "SUPER_ADMIN" && selectedFilterState && (
              <Button 
                variant="secondary" 
                className="!rounded-lg h-10 border-brand-200 text-brand-900 bg-brand-50 hover:bg-brand-100"
                onClick={() => {
                  const token = localStorage.getItem("securevote_token") || "";
                  window.open(`${api.defaults.baseURL}/api/elections/state/${selectedFilterState}/download?token=${token}`, "_blank");
                }}
              >
                <Download className="h-4 w-4" />
                <span>State Report</span>
              </Button>
            )}
            {canManage && (
              <Button onClick={() => setShowAddForm(!showAddForm)} className="!rounded-lg h-10 font-bold bg-brand-950">
                <Plus className="h-4 w-4" />
                <span>{showAddForm ? "Cancel" : "Add Election"}</span>
              </Button>
            )}
          </div>
        }
      />

      {showAddForm && canManage && (
        <Card className="border-neutral-100 shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-4">
          <div className="bg-white p-6 sm:p-8">
            <h2 className="text-xl font-bold text-neutral-900 mb-6">{editingId ? "Edit Election Cycle" : "Create New Election"}</h2>
            <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
              <Input label="Election Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. 2026 Lok Sabha" className="!rounded-lg" />
              {user?.role === "SUPER_ADMIN" ? (
                <Select 
                  label="Target Jurisdiction" 
                  value={stateName} 
                  onChange={(e) => setStateName(e.target.value)}
                  hint="Global visibility active"
                >
                  <option value="">Select State</option>
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </Select>
              ) : (
                <div className="space-y-2">
                  <div className="ml-1 text-sm font-semibold text-slate-700">Target Jurisdiction</div>
                  <div className="h-12 w-full flex items-center px-4 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-bold text-slate-900 shadow-sm">
                    {user?.state || "Not Assigned"}
                  </div>
                  <div className="ml-1 text-xs font-medium text-slate-500">Restricted to your assigned state</div>
                </div>
              )}
              <Input label="Start Date" type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="!rounded-lg" />
              <Input label="End Date" type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="!rounded-lg" />
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <Button 
                variant="secondary" 
                onClick={() => {
                  setShowAddForm(false);
                  setEditingId(null);
                  setTitle("");
                  setStartDate("");
                  setEndDate("");
                }} 
                className="!rounded-lg font-bold"
              >
                Discard
              </Button>
              <Button onClick={save} loading={saving} disabled={!title || !stateName || !startDate || !endDate} className="min-w-[150px] !rounded-lg font-bold bg-brand-950">
                {editingId ? "Save Changes" : "Register Cycle"}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {error ? (
        <div className="rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-xs font-bold text-danger-800 uppercase">
          {error}
        </div>
      ) : null}

      <Card className="border-neutral-100 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-neutral-900">Election Registry</h3>
              <p className="mt-1 text-sm font-medium text-neutral-500">Official list of all recognized election cycles.</p>
            </div>
            <div className="flex items-center gap-3">
               <Select 
                value={selectedFilterState} 
                onChange={(e) => setSelectedFilterState(e.target.value)}
                className="w-48 !h-9 !text-[12px]"
              >
                <option value="">All States</option>
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </Select>
              <Badge tone="brand" className="h-7 !px-4 !rounded-lg font-bold">{filteredItems.length} Cycles</Badge>
            </div>
          </div>

          {loading ? (
             <div className="grid gap-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex h-20 items-center justify-between border-b border-neutral-50 pr-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-8 w-24" />
                </div>
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-12">
              <EmptyState
                icon={ShieldCheck}
                title="No elections found"
                description={selectedFilterState ? `No elections registered for ${selectedFilterState}.` : "Start by adding your first election cycle."}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-neutral-100">
                      <th className="py-4 pr-4 text-[10px] font-bold uppercase tracking-widest text-neutral-400 text-left">Election Details</th>
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
                          <div className="text-sm font-bold text-neutral-900">{e.title}</div>
                          <div className="mt-1 text-[10px] font-bold text-neutral-400 uppercase tracking-tight">#{e._id.slice(-8).toUpperCase()}</div>
                        </td>
                        <td className="py-5 pr-4">
                          <div className="flex items-center gap-2 text-sm font-bold text-neutral-600">
                            <MapPin className="h-3.5 w-3.5" />
                            {e.state}
                          </div>
                        </td>
                        <td className="py-5 pr-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge tone={getStatusTone(e.status)} className="!rounded-md font-bold uppercase text-[9px] tracking-wider">{e.status}</Badge>
                            {e.locked ? <Badge tone="danger" className="!rounded-md">Locked</Badge> : null}
                          </div>
                        </td>
                        <td className="py-5 pr-4">
                          <div className="text-[11px] font-bold text-neutral-500 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="w-5 uppercase text-[9px] font-bold text-neutral-400">Start</span>
                              {formatDateTime(e.startDate)}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-5 uppercase text-[9px] font-bold text-neutral-400">End</span>
                              {formatDateTime(e.endDate)}
                            </div>
                          </div>
                        </td>
                        <td className="py-5 text-right">
                          <div className="flex justify-end gap-2">
                            {!e.locked && e.status !== "closed" && (
                              <Button
                                size="icon"
                                variant="secondary"
                                className="!h-9 !w-9 !rounded-lg border-neutral-200"
                                onClick={() => startEdit(e)}
                                title="Edit Schedule"
                              >
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                            )}
                            {e.status === "active" ? (
                              <Button
                                size="icon"
                                variant="secondary"
                                className="!h-9 !w-9 !rounded-lg border-neutral-200"
                                loading={actionId === `${e._id}-pause`}
                                onClick={() => action(e._id, "pause")}
                                disabled={e.locked}
                              >
                                <Pause className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button
                                size="icon"
                                variant="secondary"
                                className="!h-9 !w-9 !rounded-lg border-neutral-200"
                                loading={actionId === `${e._id}-resume`}
                                onClick={() => action(e._id, "resume")}
                                disabled={e.locked || e.status === "closed"}
                              >
                                <Play className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              size="icon"
                              variant="secondary"
                              className="!h-9 !w-9 !rounded-lg border-neutral-200 text-brand-700 hover:text-brand-900"
                              onClick={() => {
                                const token = localStorage.getItem("securevote_token") || "";
                                window.open(`${api.defaults.baseURL}/api/elections/${e._id}/download?token=${token}`, "_blank");
                              }}
                              title="Download Results"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="danger"
                              className="!h-9 !w-9 !rounded-lg"
                              loading={actionId === `${e._id}-end-early`}
                              onClick={() => action(e._id, "end-early")}
                              disabled={e.locked || e.status === "closed"}
                            >
                              <SquareSlash className="h-4 w-4" />
                            </Button>
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
