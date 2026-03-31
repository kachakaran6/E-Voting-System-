import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  MapPin,
  ShieldCheck,
  Vote,
  Users,
} from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { Modal } from "../../components/ui/Modal";
import { PageHeader } from "../../components/ui/PageHeader";
import { Select } from "../../components/ui/Select";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { api, resolveAssetUrl } from "../../services/api";
import { formatDateTime } from "../../utils/format";

type Election = {
  _id: string;
  title: string;
  state: string;
  status: string;
  startDate: string;
  endDate: string;
};
type Candidate = {
  _id: string;
  candidateName: string;
  partyName: string;
  candidateImagePath?: string;
  partyLogoPath?: string;
};

function getStatusTone(status: string) {
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

export function BallotPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [elections, setElections] = useState<Election[]>([]);
  const [electionId, setElectionId] = useState("");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selected, setSelected] = useState<Candidate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<any | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [loadingElections, setLoadingElections] = useState(true);
  const [loadingCandidates, setLoadingCandidates] = useState(true);

  const activeElection = useMemo(
    () => elections.find((e) => e._id === electionId) || null,
    [elections, electionId],
  );

  const load = useCallback(async () => {
    setLoadingElections(true);
    try {
      const eRes = await api.get("/api/elections");
      setElections(eRes.data.elections);
      const defaultId =
        electionId ||
        eRes.data.elections?.find((e: Election) => e.status === "active")
          ?._id ||
        eRes.data.elections?.[0]?._id;
      if (defaultId) setElectionId(defaultId);
    } finally {
      setLoadingElections(false);
    }
  }, [electionId]);

  const loadCandidates = useCallback(async () => {
    if (!electionId) {
      setLoadingCandidates(false);
      setCandidates([]);
      return;
    }

    setLoadingCandidates(true);
    try {
      const cRes = await api.get("/api/candidates", { params: { electionId } });
      setCandidates(cRes.data.candidates);
    } finally {
      setLoadingCandidates(false);
    }
  }, [electionId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    loadCandidates();
  }, [loadCandidates]);

  async function submitVote() {
    if (!selected || !electionId) return;
    setError(null);
    setConfirming(true);
    try {
      const res = await api.post("/api/votes/confirm", {
        electionId,
        candidateId: selected._id,
        confirm: true,
      });
      setReceipt(res.data.receipt);
      setSelected(null);
      showToast({
        tone: "success",
        title: "Success",
        description: "Your vote has been cast. Download your receipt below.",
      });
    } catch (err: any) {
      const message = err?.response?.data?.message || "Vote failed";
      setError(message);
      showToast({
        tone: "error",
        title: "Submission failed",
        description: message,
      });
    } finally {
      setConfirming(false);
    }
  }

  const handleDownloadPDF = () => {
    if (!receipt) return;
    const token = localStorage.getItem("securevote_token") || "";
    window.open(`${api.defaults.baseURL}/api/votes/receipt/${receipt.receiptId}?token=${token}`, "_blank");
  };

  if (!user) return null;

  if (receipt) {
    return (
      <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <PageHeader
          eyebrow="Success"
          title="Vote Cast Successfully"
          description="Your vote has been securely recorded. Please download your official receipt for your records."
        />

        <Card className="mx-auto w-full max-w-2xl border-neutral-100 shadow-xl overflow-hidden">
          <div className="bg-brand-950 p-8 text-center text-white">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-white/20 text-white ring-8 ring-white/5">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h2 className="mt-6 text-2xl font-bold tracking-tight">
              Receipt Generated
            </h2>
            <p className="mt-2 text-sm text-brand-200/80 font-bold uppercase tracking-wider">
              {receipt.electionName}
            </p>
          </div>

          <div className="p-8">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                  Receipt ID
                </div>
                <div className="text-sm font-bold text-neutral-900 border-b border-neutral-50 pb-2 truncate">
                  #{receipt.receiptId.toUpperCase()}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                  Timestamp
                </div>
                <div className="text-sm font-bold text-neutral-900 border-b border-neutral-50 pb-2">
                  {formatDateTime(receipt.date)}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                  Status
                </div>
                <div className="pt-1">
                  <Badge
                    tone="success"
                    className="!rounded-md uppercase font-bold text-[9px] tracking-widest"
                  >
                    Signed & Verified
                  </Badge>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                  System
                </div>
                <div className="text-sm font-bold text-neutral-900 border-b border-neutral-50 pb-2 truncate">
                  SECURE-VOTE-SERVER
                </div>
              </div>
            </div>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button
                variant="secondary"
                onClick={() => setReceipt(null)}
                className="flex-1 max-w-[200px] !rounded-lg font-bold border-neutral-200"
              >
                Back to Home
              </Button>
              <Button
                className="flex-1 max-w-[240px] !rounded-lg font-bold bg-brand-950"
                onClick={handleDownloadPDF}
              >
                <Download className="h-4 w-4" />
                <span>Download PDF Receipt</span>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="Portal"
        title={activeElection?.title || "Cast Your Vote"}
        description="Select a candidate and cast your secure ballot."
        actions={
          activeElection ? (
            <Badge
              tone={getStatusTone(activeElection.status)}
              className="h-7 !px-4 !rounded-lg font-bold uppercase text-[10px] tracking-widest"
            >
              {activeElection.status}
            </Badge>
          ) : null
        }
      />

      <Card className="border-neutral-100 shadow-sm">
        <div className="p-6 lg:p-8">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] items-start">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="brand" className="font-bold">
                  VERIFIED VOTER
                </Badge>
                {user.state ? (
                  <Badge
                    tone="secondary"
                    className="!bg-neutral-50 !text-neutral-500 border-neutral-100 uppercase font-bold text-[10px]"
                  >
                    {user.state}
                  </Badge>
                ) : null}
              </div>
              <h2 className="mt-5 text-2xl font-bold tracking-tight text-neutral-900">
                {activeElection?.title || "No Election Selected"}
              </h2>
              <p className="mt-2 text-sm font-medium leading-relaxed text-neutral-500 max-w-xl">
                Please review candidates carefully before casting your ballot.
                One submission per registered citizen is allowed.
              </p>

              {activeElection ? (
                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-xl border border-neutral-50 bg-neutral-50/30 p-4">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 leading-none mb-2">
                      State
                    </div>
                    <div className="flex items-center gap-2 text-sm font-bold text-neutral-900 truncate">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{activeElection.state}</span>
                    </div>
                  </div>
                  <div className="rounded-xl border border-neutral-50 bg-neutral-50/30 p-4">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 leading-none mb-2">
                      Opens
                    </div>
                    <div className="text-sm font-bold text-neutral-900">
                      {formatDateTime(activeElection.startDate)}
                    </div>
                  </div>
                  <div className="rounded-xl border border-neutral-50 bg-neutral-50/30 p-4">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 leading-none mb-2">
                      Closes
                    </div>
                    <div className="text-sm font-bold text-neutral-900">
                      {formatDateTime(activeElection.endDate)}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="lg:pl-8 lg:border-l border-neutral-100">
              <Select
                label="Select Election Cycle"
                value={electionId}
                onChange={(e) => setElectionId(e.target.value)}
                disabled={loadingElections}
              >
                {elections.map((e) => (
                  <option key={e._id} value={e._id}>
                    {e.title} ({e.status.toUpperCase()})
                  </option>
                ))}
              </Select>
              <div className="mt-4 p-4 rounded-xl bg-brand-50/50 border border-brand-100">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-brand-700 shrink-0 mt-0.5" />
                  <p className="text-[11px] font-bold text-brand-900 leading-relaxed uppercase tracking-tight">
                    Your identity is verified against the State Voter Registry.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {error ? (
        <div className="rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-xs font-bold text-danger-800 uppercase animate-in fade-in slide-in-from-top-4">
          Error: {error}
        </div>
      ) : null}

      <div className="mt-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8 pb-4 border-b border-neutral-50">
          <div>
            <h3 className="text-xl font-bold text-neutral-900">
              Certified Candidates
            </h3>
            <p className="mt-1 text-sm font-medium text-neutral-500">
              Official candidates for your constituency.
            </p>
          </div>
          <Badge tone="brand" className="h-7 !px-4 !rounded-lg font-bold">
            {candidates.length} Available
          </Badge>
        </div>

        {loadingCandidates ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card
                key={index}
                className="p-6 border-neutral-50 shadow-sm animate-pulse"
              >
                <div className="h-24 w-24 rounded-xl bg-neutral-100 mb-6" />
                <div className="h-5 w-40 bg-neutral-100 rounded mb-2" />
                <div className="h-4 w-24 bg-neutral-100 rounded mb-6" />
                <div className="h-12 w-full bg-neutral-50 rounded-lg" />
              </Card>
            ))}
          </div>
        ) : candidates.length === 0 ? (
          <EmptyState
            icon={Vote}
            title="No Candidates Found"
            description="No certified candidates are available for this election cycle."
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {candidates.map((candidate) => (
              <Card
                key={candidate._id}
                className="group border-neutral-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
              >
                <div className="p-6 flex flex-col h-full">
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-neutral-100 ring-2 ring-neutral-50 group-hover:ring-brand-950/10 transition-all">
                      {candidate.candidateImagePath ? (
                        <img
                          src={resolveAssetUrl(candidate.candidateImagePath)}
                          alt={candidate.candidateName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-neutral-300">
                          <Users className="h-10 w-10" />
                        </div>
                      )}
                    </div>
                    {candidate.partyLogoPath ? (
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-white border border-neutral-100 p-1 shadow-sm">
                        <img
                          src={resolveAssetUrl(candidate.partyLogoPath)}
                          alt={candidate.partyName}
                          className="h-full w-full object-contain"
                        />
                      </div>
                    ) : null}
                  </div>

                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-neutral-900 group-hover:text-brand-950 transition-colors uppercase tracking-tight">
                      {candidate.candidateName}
                    </h4>
                    <p className="mt-1 text-xs font-bold text-neutral-400 uppercase tracking-widest">
                      {candidate.partyName}
                    </p>
                    <div className="mt-6 p-4 rounded-xl bg-neutral-50/50 border border-neutral-100 group-hover:bg-brand-50/50 group-hover:border-brand-100 transition-all">
                      <p className="text-xs font-medium text-neutral-400 italic">
                        "Official candidate for {activeElection?.title}."
                      </p>
                    </div>
                  </div>

                  <Button
                    className="mt-8 w-full justify-center !rounded-lg font-bold h-12 shadow-sm bg-brand-950"
                    onClick={() => setSelected(candidate)}
                    disabled={activeElection?.status !== "active"}
                    variant={
                      activeElection?.status === "active"
                        ? "primary"
                        : "secondary"
                    }
                  >
                    <Vote className="h-4 w-4" />
                    <span>
                      {activeElection?.status === "active"
                        ? "Vote Now"
                        : "Polls Closed"}
                    </span>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal
        open={Boolean(selected)}
        onClose={() => {
          if (!confirming) setSelected(null);
        }}
        title="Confirm Your Vote"
        description="Verify your selection before casting. This action is irreversible."
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setSelected(null)}
              disabled={confirming}
              className="!rounded-lg font-bold"
            >
              Cancel
            </Button>
            <Button
              onClick={submitVote}
              loading={confirming}
              className="!rounded-lg font-bold bg-brand-950 min-w-[150px]"
            >
              Cast Vote
            </Button>
          </>
        }
      >
        {selected ? (
          <div className="grid gap-6">
            <div className="rounded-2xl border border-neutral-100 bg-neutral-50/50 p-6">
              <div className="flex items-center gap-5">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-white shadow-sm">
                  {selected.candidateImagePath ? (
                    <img
                      src={resolveAssetUrl(selected.candidateImagePath)}
                      alt={selected.candidateName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Users className="h-full w-full p-4 text-neutral-200" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">
                    Your Selection
                  </div>
                  <div className="text-xl font-bold text-neutral-900 truncate uppercase tracking-tight">
                    {selected.candidateName}
                  </div>
                  <div className="mt-1 text-sm font-bold text-brand-950 uppercase tracking-widest">
                    {selected.partyName}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="flex items-start gap-4 rounded-xl border border-warning-100 bg-warning-50/30 p-5">
                <AlertTriangle className="h-5 w-5 text-warning-600 shrink-0 mt-0.5" />
                <p className="text-xs font-bold leading-relaxed text-warning-800 uppercase tracking-tight">
                  Once cast, your ballot cannot be changed or revoked.
                </p>
              </div>

              <div className="flex items-start gap-4 rounded-xl border border-brand-100 bg-brand-50/30 p-5">
                <ShieldCheck className="h-5 w-5 text-brand-950 shrink-0 mt-0.5" />
                <p className="text-xs font-bold leading-relaxed text-brand-950 uppercase tracking-tight">
                  Your vote will be cryptographically sealed.
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
