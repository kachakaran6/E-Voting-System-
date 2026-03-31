import { useCallback, useEffect, useState } from "react";
import { Download, FileText, History, RefreshCw, ShieldCheck } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { PageHeader } from "../../components/ui/PageHeader";
import { Skeleton } from "../../components/ui/Skeleton";
import { useToast } from "../../contexts/ToastContext";
import { api } from "../../services/api";
import { formatDateTime } from "../../utils/format";

type HistoryItem = {
  _id: string;
  receiptId: string;
  electionTitle: string;
  candidateName: string;
  partyName: string;
  votedAt: string;
};

export function HistoryPage() {
  const { showToast } = useToast();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/api/votes/history");
      setItems(res.data.history);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Unable to load voting history.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDownload = (receiptId: string) => {
    const token = localStorage.getItem("securevote_token") || "";
    window.open(`${api.defaults.baseURL}/api/votes/receipt/${receiptId}?token=${token}`, "_blank");
    showToast({ tone: "success", title: "Download started", description: "Your official receipt is being generated." });
  };

  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="Audit Trail"
        title="Voting History"
        description="A permanent record of your participation in official elections."
        actions={
          <Button variant="secondary" onClick={load} loading={loading} className="!rounded-lg h-10 border-neutral-200">
            <RefreshCw className="h-4 w-4" />
          </Button>
        }
      />

      <Card className="border-neutral-100 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-neutral-900">Your Activity</h3>
              <p className="mt-1 text-sm font-medium text-neutral-500">Official transcripts for all your cast votes.</p>
            </div>
            <Badge tone="brand" className="h-7 !px-4 !rounded-lg font-bold">{items.length} Recorded</Badge>
          </div>

          {loading ? (
             <div className="grid gap-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex h-24 items-center justify-between border border-neutral-50 rounded-2xl p-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-10 w-32" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="py-12 text-center text-danger-600 font-bold uppercase text-[10px] tracking-widest">{error}</div>
          ) : items.length === 0 ? (
            <div className="py-12">
              <EmptyState
                icon={History}
                title="No history found"
                description="Your voting records will appear here after your first ballot is cast."
              />
            </div>
          ) : (
            <div className="grid gap-4">
              {items.map((item) => (
                <div key={item._id} className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-neutral-100 bg-white hover:border-brand-200/50 hover:shadow-md hover:shadow-brand-900/5 transition-all duration-300">
                  <div className="flex gap-4">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-base font-bold text-neutral-950 truncate">{item.electionTitle}</div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                        <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-tight">#{item.receiptId}</div>
                        <div className="text-[11px] font-bold text-neutral-500">{formatDateTime(item.votedAt)}</div>
                      </div>
                      <div className="mt-2 text-xs font-semibold text-neutral-600 italic">
                        Selected: {item.candidateName} ({item.partyName})
                      </div>
                    </div>
                  </div>
                  <div className="flex sm:justify-end gap-2 shrink-0 border-t border-neutral-50 pt-4 sm:border-0 sm:pt-0">
                    <Button 
                      variant="secondary" 
                      onClick={() => handleDownload(item.receiptId)} 
                      className="!rounded-xl h-11 border-neutral-200 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-950 transition-all font-bold text-xs"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download Receipt</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <div className="flex items-center gap-4 p-6 rounded-2xl bg-neutral-900 text-white shadow-xl shadow-neutral-950/20">
         <div className="grid h-12 w-12 place-items-center rounded-xl bg-white/10 backdrop-blur-md">
            <ShieldCheck className="h-6 w-6 text-brand-400" />
         </div>
         <div className="flex-1">
            <h4 className="text-sm font-bold">Secure Verification</h4>
            <p className="text-xs text-neutral-400 font-medium">Receipts are cryptographically generated and can be verified by auditing the system node hash.</p>
         </div>
      </div>
    </div>
  );
}
