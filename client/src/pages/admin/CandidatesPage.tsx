import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ImagePlus,
  Plus,
  RefreshCw,
  Trash2,
  Users,
  Edit2,
} from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { Select } from "../../components/ui/Select";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { api, resolveAssetUrl } from "../../services/api";
import { STATES } from "../../utils/constants";

type Election = { _id: string; title: string; state: string; status: string };
type Candidate = {
  _id: string;
  candidateName: string;
  partyName: string;
  state: string;
  electionId: string;
  voteCount: number;
  candidateImagePath?: string;
  partyLogoPath?: string;
  age?: number;
  constituency?: string;
  manifesto?: string;
};

export function CandidatesPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const canManage = useMemo(
    () => user?.role === "ADMIN" || user?.role === "SUPER_ADMIN",
    [user],
  );

  const [elections, setElections] = useState<Election[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filterElectionId, setFilterElectionId] = useState<string>("");
  const [filterState, setFilterState] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [candidateName, setCandidateName] = useState("");
  const [partyName, setPartyName] = useState("");
  const [electionId, setElectionId] = useState("");
  const [stateName, setStateName] = useState("");
  const [candidateImage, setCandidateImage] = useState<File | null>(null);
  const [partyLogo, setPartyLogo] = useState<File | null>(null);
  const [age, setAge] = useState("");
  const [constituency, setConstituency] = useState("");
  const [manifesto, setManifesto] = useState("");

  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editCandidateImage, setEditCandidateImage] = useState<File | null>(null);
  const [editPartyLogo, setEditPartyLogo] = useState<File | null>(null);
  const [editName, setEditName] = useState("");
  const [editParty, setEditParty] = useState("");
  const [editAge, setEditAge] = useState("");
  const [editConst, setEditConst] = useState("");
  const [editManifesto, setEditManifesto] = useState("");

  const filteredCandidates = useMemo(() => {
    let list = candidates;
    if (filterElectionId) {
      list = list.filter((c) => c.electionId === filterElectionId);
    }
    if (filterState) {
      list = list.filter((c) => c.state === filterState);
    }
    return list;
  }, [candidates, filterElectionId, filterState]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [eRes, cRes] = await Promise.all([
        api.get("/api/elections"),
        api.get("/api/candidates"),
      ]);
      setElections(eRes.data.elections);
      setCandidates(cRes.data.candidates);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Unable to load candidates");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const electionsById = useMemo(
    () => new Map(elections.map((e) => [e._id, e])),
    [elections],
  );

  async function create() {
    setError(null);
    setSaving(true);
    try {
      const fd = new FormData();
      fd.set("candidateName", candidateName);
      fd.set("partyName", partyName);
      fd.set("electionId", electionId);
      fd.set("state", stateName);
      fd.set("age", age);
      fd.set("constituency", constituency);
      fd.set("manifesto", manifesto);
      if (candidateImage) fd.set("candidateImage", candidateImage);
      if (partyLogo) fd.set("partyLogo", partyLogo);
      await api.post("/api/candidates", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setCandidateName("");
      setPartyName("");
      setStateName("");
      setElectionId("");
      setCandidateImage(null);
      setPartyLogo(null);
      setAge("");
      setConstituency("");
      setManifesto("");
      setShowAddForm(false);
      await load();
      showToast({ tone: "success", title: "Candidate added", description: "Profile registered." });
    } catch (err: any) {
      const message = err?.response?.data?.message || "Action failed";
      setError(message);
      showToast({ tone: "error", title: "Registration failed", description: message });
    } finally {
      setSaving(false);
    }
  }

  async function update() {
    if (!editingCandidate) return;
    setError(null);
    setSaving(true);
    try {
      const fd = new FormData();
      fd.set("candidateName", editName);
      fd.set("partyName", editParty);
      fd.set("age", editAge);
      fd.set("constituency", editConst);
      fd.set("manifesto", editManifesto);
      if (editCandidateImage) fd.set("candidateImage", editCandidateImage);
      if (editPartyLogo) fd.set("partyLogo", editPartyLogo);

      await api.put(`/api/candidates/${editingCandidate._id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setShowEditModal(false);
      setEditingCandidate(null);
      await load();
      showToast({ tone: "success", title: "Updated", description: "Changes saved." });
    } catch (err: any) {
      const message = err?.response?.data?.message || "Update failed";
      setError(message);
      showToast({ tone: "error", title: "Update failed", description: message });
    } finally {
      setSaving(false);
    }
  }

  function startEdit(candidate: Candidate) {
    setEditingCandidate(candidate);
    setEditName(candidate.candidateName);
    setEditParty(candidate.partyName);
    setEditAge(candidate.age?.toString() || "");
    setEditConst(candidate.constituency || "");
    setEditManifesto(candidate.manifesto || "");
    setEditCandidateImage(null);
    setEditPartyLogo(null);
    setShowEditModal(true);
  }

  async function remove(id: string) {
    setError(null);
    setDeletingId(id);
    try {
      await api.delete(`/api/candidates/${id}`);
      await load();
      showToast({ tone: "success", title: "Removed", description: "Profile deleted." });
    } catch (err: any) {
      const message = err?.response?.data?.message || "Delete failed";
      setError(message);
      showToast({ tone: "error", title: "Action failed", description: message });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="grid gap-6">
      {showAddForm && canManage && (
        <Card className="border-neutral-100 shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-4">
          <div className="bg-white p-6 sm:p-8">
            <h2 className="text-xl font-bold text-neutral-900 mb-6">Add Candidate</h2>
            <div className="grid gap-6 lg:grid-cols-2">
              <Input label="Full Name" value={candidateName} onChange={(e) => setCandidateName(e.target.value)} placeholder="e.g. Robert Stevenson" className="!rounded-lg" />
              <Input label="Party Name" value={partyName} onChange={(e) => setPartyName(e.target.value)} placeholder="e.g. Independent" className="!rounded-lg" />
              <Select
                label="Assign Election"
                value={electionId}
                onChange={(e) => {
                  const id = e.target.value;
                  setElectionId(id);
                  const election = elections.find((item) => item._id === id);
                  if (election) setStateName(election.state);
                }}
              >
                <option value="">Select Election</option>
                {elections.map((e) => (
                  <option key={e._id} value={e._id}>{e.title} ({e.state})</option>
                ))}
              </Select>
              <Select label="State" value={stateName} onChange={(e) => setStateName(e.target.value)}>
                <option value="">Select State</option>
                {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
              <Input label="Age" type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="Min 25" className="!rounded-lg" />
              <Input label="Constituency" value={constituency} onChange={(e) => setConstituency(e.target.value)} placeholder="District or Area" className="!rounded-lg" />
            </div>
            <div className="mt-6">
              <Input label="Manifesto Summary" value={manifesto} onChange={(e) => setManifesto(e.target.value)} placeholder="Key goals and promises..." className="!rounded-lg" />
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <label className="group block cursor-pointer">
                <div className="mb-2 ml-1 text-[11px] font-bold uppercase tracking-widest text-neutral-400">Portrait Image</div>
                <div className="rounded-xl border border-dashed border-neutral-200 bg-white p-6 transition hover:border-brand-950 hover:bg-neutral-50">
                  <div className="flex items-center gap-4">
                    <div className="grid h-12 w-12 place-items-center rounded-xl bg-neutral-100 text-brand-950 shadow-sm group-hover:bg-white text-brand-950">
                       <ImagePlus className="h-6 w-6" />
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-sm font-bold text-neutral-900 truncate">{candidateImage ? candidateImage.name : "Choose file"}</div>
                      <div className="mt-0.5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Portrait Picture</div>
                    </div>
                  </div>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={(e) => setCandidateImage(e.target.files?.[0] || null)} />
              </label>

              <label className="group block cursor-pointer">
                <div className="mb-2 ml-1 text-[11px] font-bold uppercase tracking-widest text-neutral-400">Party Logo</div>
                <div className="rounded-xl border border-dashed border-neutral-200 bg-white p-6 transition hover:border-brand-950 hover:bg-neutral-50">
                  <div className="flex items-center gap-4">
                    <div className="grid h-12 w-12 place-items-center rounded-xl bg-neutral-100 text-brand-950 shadow-sm group-hover:bg-white text-brand-950">
                       <ImagePlus className="h-6 w-6" />
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-sm font-bold text-neutral-900 truncate">{partyLogo ? partyLogo.name : "Choose file"}</div>
                      <div className="mt-0.5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Official Logo</div>
                    </div>
                  </div>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={(e) => setPartyLogo(e.target.files?.[0] || null)} />
              </label>
            </div>

            <div className="mt-8 flex justify-end gap-3">
               <Button variant="secondary" onClick={() => setShowAddForm(false)} className="!rounded-lg font-bold">Discard</Button>
               <Button onClick={create} loading={saving} disabled={!candidateName || !partyName || !electionId || !stateName} className="min-w-[150px] !rounded-lg font-bold bg-brand-950">Register Candidate</Button>
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
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between mb-10 pb-8 border-b border-neutral-50">
            <div className="flex items-center gap-4">
              <h3 className="text-2xl font-bold text-neutral-900 uppercase tracking-tight">Candidate Roster</h3>
              <Badge tone="brand" className="h-6 !px-3 !rounded-lg font-bold">{filteredCandidates.length}</Badge>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-3">
                   <div className="flex items-center bg-neutral-50 px-3 py-1 rounded-xl border border-neutral-100">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest pr-3 border-r border-neutral-200 mr-3">Cycle</span>
                    <Select value={filterElectionId} onChange={(e) => setFilterElectionId(e.target.value)} className="!w-40 !h-8 !bg-transparent !border-none !shadow-none !text-[11px] font-bold">
                        <option value="">All Elections</option>
                        {elections.map((e) => <option key={e._id} value={e._id}>{e.title}</option>)}
                    </Select>
                  </div>
                  <div className="flex items-center bg-neutral-50 px-3 py-1 rounded-xl border border-neutral-100">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest pr-3 border-r border-neutral-200 mr-3">State</span>
                    <Select value={filterState} onChange={(e) => setFilterState(e.target.value)} className="!w-32 !h-8 !bg-transparent !border-none !shadow-none !text-[11px] font-bold">
                        <option value="">Global</option>
                        {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </Select>
                  </div>
              </div>

              <div className="flex items-center gap-2 border-l border-neutral-100 pl-3">
                <Button 
                   size="icon"
                   variant="secondary" 
                   onClick={load} 
                   loading={loading} 
                   className="!rounded-lg border-neutral-100 shadow-sm transition-all hover:bg-neutral-50" 
                   title="Refresh"
                >
                  <RefreshCw className="h-5 w-5 text-neutral-600" />
                </Button>
                {canManage && (
                  <Button onClick={() => setShowAddForm(!showAddForm)} className="!rounded-lg h-9 font-bold bg-brand-950 text-xs px-4">
                    <Plus className="h-3.5 w-3.5" />
                    <span>{showAddForm ? "Close Form" : "New Candidate"}</span>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="p-6 border-neutral-50 shadow-sm animate-pulse">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-16 w-16 rounded-xl bg-neutral-100" />
                    <div className="flex-1 space-y-2">
                       <div className="h-4 w-32 bg-neutral-100 rounded" />
                       <div className="h-3 w-20 bg-neutral-100 rounded" />
                    </div>
                  </div>
                  <div className="h-20 w-full bg-neutral-50 rounded-lg" />
                </Card>
              ))}
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div className="py-12">
              <EmptyState icon={Users} title="No candidates found" description="Try adjusting your filters or add a new candidate profile." />
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 lg:grid-cols-2">
              {filteredCandidates.map((candidate) => {
                const election = electionsById.get(candidate.electionId);
                return (
                  <Card key={candidate._id} className="group border-neutral-100 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-4 mb-6">
                        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-neutral-100 ring-2 ring-neutral-50 group-hover:ring-brand-950/10 transition-all">
                          {candidate.candidateImagePath ? <img src={resolveAssetUrl(candidate.candidateImagePath)} alt={candidate.candidateName} className="h-full w-full object-cover" /> : <div className="h-full w-full flex items-center justify-center text-neutral-300"><Users className="h-8 w-8" /></div>}
                        </div>
                        {candidate.partyLogoPath ? <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-white border border-neutral-100 p-1 shadow-sm"><img src={resolveAssetUrl(candidate.partyLogoPath)} alt={candidate.partyName} className="h-full w-full object-contain" /></div> : null}
                      </div>

                      <div className="min-w-0">
                        <h4 className="text-base font-bold text-neutral-900 truncate group-hover:text-brand-950 transition-colors uppercase tracking-tight">{candidate.candidateName}</h4>
                        <p className="mt-1 text-xs font-bold text-neutral-400 uppercase tracking-widest line-clamp-1">{candidate.partyName}</p>
                        <div className="mt-6 flex flex-wrap items-center gap-2">
                            <Badge tone="secondary" className="!bg-neutral-100 !text-neutral-600 font-bold border-none">{candidate.state}</Badge>
                            <Badge tone="brand" className="font-bold">{candidate.voteCount} Votes</Badge>
                        </div>
                        {election && <div className="mt-4 text-[10px] font-bold text-neutral-400 uppercase tracking-widest truncate">Cycle: {election.title}</div>}
                      </div>

                      {canManage ? (
                        <div className="mt-6 pt-6 border-t border-neutral-50 flex items-center justify-end gap-2">
                          {user?.role === "SUPER_ADMIN" && <Button size="sm" variant="secondary" className="!rounded-lg h-9 px-4 font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap" onClick={() => startEdit(candidate)}><Edit2 className="h-3.5 w-3.5" /><span>Edit</span></Button>}
                          <Button size="sm" variant="danger" className="!rounded-lg h-9 px-4 font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap" loading={deletingId === candidate._id} onClick={() => remove(candidate._id)}><Trash2 className="h-3.5 w-3.5" /><span>Delete</span></Button>
                        </div>
                      ) : null}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      <Modal open={showEditModal} onClose={() => { setShowEditModal(false); setEditingCandidate(null); }} title="Edit Candidate">
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Full Name" value={editName} onChange={(e) => setEditName(e.target.value)} className="!rounded-lg" />
            <Input label="Party Name" value={editParty} onChange={(e) => setEditParty(e.target.value)} className="!rounded-lg" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Age" type="number" value={editAge} onChange={(e) => setEditAge(e.target.value)} className="!rounded-lg" />
            <Input label="Constituency" value={editConst} onChange={(e) => setEditConst(e.target.value)} className="!rounded-lg" />
          </div>
          <Input label="Manifesto" value={editManifesto} onChange={(e) => setEditManifesto(e.target.value)} className="!rounded-lg" />
          <div className="grid grid-cols-2 gap-6 mt-2">
            <label className="group block cursor-pointer">
              <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Update Portrait</div>
              <div className="rounded-xl border border-dashed border-neutral-200 p-4 transition hover:bg-neutral-50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-neutral-100"><ImagePlus className="h-5 w-5" /></div>
                  <div className="text-xs font-bold truncate max-w-[100px]">{editCandidateImage ? editCandidateImage.name : "New Image"}</div>
                </div>
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={(e) => setEditCandidateImage(e.target.files?.[0] || null)} />
            </label>
            <label className="group block cursor-pointer">
              <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Update Logo</div>
              <div className="rounded-xl border border-dashed border-neutral-200 p-4 transition hover:bg-neutral-50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-neutral-100"><ImagePlus className="h-5 w-5" /></div>
                  <div className="text-xs font-bold truncate max-w-[100px]">{editPartyLogo ? editPartyLogo.name : "New Logo"}</div>
                </div>
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={(e) => setEditPartyLogo(e.target.files?.[0] || null)} />
            </label>
          </div>
          <div className="mt-8 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowEditModal(false)} className="!rounded-lg">Cancel</Button>
            <Button onClick={update} loading={saving} className="!rounded-lg font-bold bg-brand-950">Save Changes</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
