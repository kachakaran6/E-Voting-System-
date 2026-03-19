import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ImagePlus,
  Plus,
  RefreshCw,
  Trash2,
  UserSquare2,
  Users,
} from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { Input } from "../../components/ui/Input";
import { PageHeader } from "../../components/ui/PageHeader";
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
      setShowAddForm(false);
      await load();
      showToast({
        tone: "success",
        title: "Candidate added",
        description: "The candidate has been registered.",
      });
    } catch (err: any) {
      const message =
        err?.response?.data?.message || "Failed to create candidate";
      setError(message);
      showToast({
        tone: "error",
        title: "Registration failed",
        description: message,
      });
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    setError(null);
    setDeletingId(id);
    try {
      await api.delete(`/api/candidates/${id}`);
      await load();
      showToast({
        tone: "success",
        title: "Candidate removed",
        description: "Profile deleted.",
      });
    } catch (err: any) {
      const message =
        err?.response?.data?.message || "Failed to delete candidate";
      setError(message);
      showToast({
        tone: "error",
        title: "Action failed",
        description: message,
      });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="Registry"
        title="Manage Candidates"
        description="Maintain official candidate records and party branding."
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              onClick={load}
              loading={loading}
              className="!rounded-lg h-10 border-neutral-200"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            {canManage && (
              <Button
                onClick={() => setShowAddForm(!showAddForm)}
                className="!rounded-lg h-10 font-bold bg-brand-950"
              >
                <Plus className="h-4 w-4" />
                <span>{showAddForm ? "Cancel" : "Add Candidate"}</span>
              </Button>
            )}
          </div>
        }
      />

      {showAddForm && canManage && (
        <Card className="border-neutral-100 shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-4">
          <div className="bg-white p-6 sm:p-8">
            <h2 className="text-xl font-bold text-neutral-900 mb-6">
              Add Candidate
            </h2>
            <div className="grid gap-6 lg:grid-cols-2">
              <Input
                label="Full Name"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                placeholder="e.g. Robert Stevenson"
                className="!rounded-lg"
              />
              <Input
                label="Party Name"
                value={partyName}
                onChange={(e) => setPartyName(e.target.value)}
                placeholder="e.g. Independent"
                className="!rounded-lg"
              />
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
                  <option key={e._id} value={e._id}>
                    {e.title} ({e.state})
                  </option>
                ))}
              </Select>
              <Select
                label="State"
                value={stateName}
                onChange={(e) => setStateName(e.target.value)}
              >
                <option value="">Select State</option>
                {STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <label className="group block cursor-pointer">
                <div className="mb-2 ml-1 text-[11px] font-bold uppercase tracking-widest text-neutral-400">
                  Portrait Image
                </div>
                <div className="rounded-xl border border-dashed border-neutral-200 bg-white p-6 transition hover:border-brand-950 hover:bg-neutral-50">
                  <div className="flex items-center gap-4">
                    <div className="grid h-12 w-12 place-items-center rounded-xl bg-neutral-100 text-brand-950 shadow-sm group-hover:bg-white">
                      <ImagePlus className="h-6 w-6" />
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-sm font-bold text-neutral-900 truncate">
                        {candidateImage ? candidateImage.name : "Choose file"}
                      </div>
                      <div className="mt-0.5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                        Portrait Picture
                      </div>
                    </div>
                  </div>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) =>
                    setCandidateImage(e.target.files?.[0] || null)
                  }
                />
              </label>

              <label className="group block cursor-pointer">
                <div className="mb-2 ml-1 text-[11px] font-bold uppercase tracking-widest text-neutral-400">
                  Party Logo
                </div>
                <div className="rounded-xl border border-dashed border-neutral-200 bg-white p-6 transition hover:border-brand-950 hover:bg-neutral-50">
                  <div className="flex items-center gap-4">
                    <div className="grid h-12 w-12 place-items-center rounded-xl bg-neutral-100 text-brand-950 shadow-sm group-hover:bg-white">
                      <ImagePlus className="h-6 w-6" />
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-sm font-bold text-neutral-900 truncate">
                        {partyLogo ? partyLogo.name : "Choose file"}
                      </div>
                      <div className="mt-0.5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                        Official Logo
                      </div>
                    </div>
                  </div>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => setPartyLogo(e.target.files?.[0] || null)}
                />
              </label>
            </div>

            <div className="mt-8 flex justify-end">
              <Button
                onClick={create}
                loading={saving}
                disabled={
                  !candidateName || !partyName || !electionId || !stateName
                }
                className="min-w-[150px] !rounded-lg font-bold bg-brand-950"
              >
                Register Candidate
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

      <Card className="border-neutral-100 shadow-sm">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between mb-8 pb-8 border-b border-neutral-50">
            <div>
              <h3 className="text-xl font-bold text-neutral-900">
                Candidate Roster
              </h3>
              <p className="mt-1 text-sm font-medium text-neutral-500">
                Official list of certified candidates.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4 w-full max-w-2xl">
              <div className="flex-1 min-w-[200px]">
                <Select
                  label="Filter by Election"
                  value={filterElectionId}
                  onChange={(e) => setFilterElectionId(e.target.value)}
                >
                  <option value="">All Elections</option>
                  {elections.map((e) => (
                    <option key={e._id} value={e._id}>
                      {e.title} ({e.state})
                    </option>
                  ))}
                </Select>
              </div>
              <div className="flex-1 min-w-[200px]">
                <Select
                  label="Filter by State"
                  value={filterState}
                  onChange={(e) => setFilterState(e.target.value)}
                >
                  <option value="">All States</option>
                  {STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </div>
              <Badge
                tone="brand"
                className="h-7 !px-4 !rounded-lg font-bold shrink-0"
              >
                {filteredCandidates.length} Registered
              </Badge>
            </div>
          </div>

          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Card
                  key={index}
                  className="p-6 border-neutral-50 shadow-sm animate-pulse"
                >
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
              <EmptyState
                icon={UserSquare2}
                title="No candidates found"
                description="Try adjusting your filters or add a new candidate."
              />
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredCandidates.map((candidate) => {
                const election = electionsById.get(candidate.electionId);
                return (
                  <Card
                    key={candidate._id}
                    className="group border-neutral-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-4 mb-6">
                        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-neutral-100 ring-2 ring-neutral-50 group-hover:ring-brand-950/10 transition-all">
                          {candidate.candidateImagePath ? (
                            <img
                              src={resolveAssetUrl(
                                candidate.candidateImagePath,
                              )}
                              alt={candidate.candidateName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-neutral-300">
                              <Users className="h-8 w-8" />
                            </div>
                          )}
                        </div>
                        {candidate.partyLogoPath ? (
                          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-white border border-neutral-100 p-1 shadow-sm">
                            <img
                              src={resolveAssetUrl(candidate.partyLogoPath)}
                              alt={candidate.partyName}
                              className="h-full w-full object-contain"
                            />
                          </div>
                        ) : null}
                      </div>

                      <div className="min-w-0">
                        <h4 className="text-base font-bold text-neutral-900 truncate group-hover:text-brand-950 transition-colors uppercase tracking-tight">
                          {candidate.candidateName}
                        </h4>
                        <p className="mt-1 text-xs font-bold text-neutral-400 uppercase tracking-widest line-clamp-1">
                          {candidate.partyName}
                        </p>

                        <div className="mt-6 flex flex-wrap items-center gap-2">
                          <Badge
                            tone="secondary"
                            className="!bg-neutral-100 !text-neutral-600 font-bold border-none"
                          >
                            {candidate.state}
                          </Badge>
                          <Badge tone="brand" className="font-bold">
                            {candidate.voteCount} Votes
                          </Badge>
                        </div>
                        {election && (
                          <div className="mt-4 text-[10px] font-bold text-neutral-400 uppercase tracking-widest truncate">
                            Cycle: {election.title}
                          </div>
                        )}
                      </div>

                      {canManage ? (
                        <div className="mt-6 pt-6 border-t border-neutral-50 flex justify-end">
                          <Button
                            size="sm"
                            variant="danger"
                            className="!rounded-lg h-9 px-4 font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                            loading={deletingId === candidate._id}
                            onClick={() => remove(candidate._id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Delete</span>
                          </Button>
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
    </div>
  );
}
