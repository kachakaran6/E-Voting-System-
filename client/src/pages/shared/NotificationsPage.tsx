import { useCallback, useEffect, useState } from "react";
import { Bell, CheckCheck, RefreshCw } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { useToast } from "../../contexts/ToastContext";
import { api } from "../../services/api";
import { formatDateTime } from "../../utils/format";

type Notification = {
  _id: string;
  title: string;
  message: string;
  isRead: boolean;
  timestamp: string;
};

export function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/notifications");
      setItems(res.data.notifications);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function markRead(id: string) {
    await api.post(`/api/notifications/${id}/read`);
    setItems((s) => s.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    showToast({ tone: "success", title: "Success", description: "Notification marked as read." });
  }

  return (
    <div className="grid gap-6">

      <Card className="border-neutral-100 shadow-sm overflow-hidden">
        <div className="bg-white p-6 sm:p-8 border-b border-neutral-50 mb-8 flex items-center justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-xl font-bold text-neutral-900 pr-4">Messages</h3>
            <Badge tone="brand" className="h-6 !px-3 !rounded-lg font-bold">{items.filter((item) => !item.isRead).length} Unread</Badge>
            <Badge tone="secondary" className="h-6 !px-3 !rounded-lg !bg-neutral-50 !text-neutral-500 border-neutral-100 font-bold">{items.length} Total</Badge>
          </div>
          <Button variant="secondary" onClick={load} loading={loading} className="!rounded-lg h-10 border-neutral-100 hover:bg-neutral-50 px-4">
            <RefreshCw className="h-5 w-5 mr-2" />
            <span className="text-xs font-bold text-neutral-600">Refresh</span>
          </Button>
        </div>

        <div className="px-6 sm:px-8 pb-8 space-y-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="p-6 border border-neutral-50 rounded-xl space-y-4 animate-pulse">
                <div className="h-5 w-48 bg-neutral-100 rounded" />
                <div className="h-4 w-full bg-neutral-100 rounded" />
                <div className="h-4 w-4/5 bg-neutral-100 rounded" />
              </div>
            ))
          ) : items.length === 0 ? (
            <div className="py-12">
              <EmptyState
                icon={Bell}
                title="Your inbox is clear"
                description="Election updates and system messages will appear here."
              />
            </div>
          ) : (
            items.map((n) => (
              <Card key={n._id} className={`p-6 border-neutral-100 transition-all duration-300 ${n.isRead ? 'opacity-60 grayscale-[0.5]' : 'bg-brand-50/20 border-brand-100 shadow-sm'}`}>
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <div className={`h-2 w-2 rounded-full ${n.isRead ? 'bg-neutral-300' : 'bg-brand-950 animate-pulse'}`} />
                      <h4 className="text-base font-bold text-neutral-900 uppercase tracking-tight">{n.title}</h4>
                      {!n.isRead && <Badge tone="brand" className="!rounded-md !text-[9px] !py-0.5 !px-2 font-bold uppercase tracking-widest">New</Badge>}
                    </div>
                    <p className="text-sm font-medium leading-relaxed text-neutral-600">{n.message}</p>
                    <div className="mt-4 text-[10px] font-bold uppercase tracking-widest text-neutral-400 flex items-center gap-2">
                       <RefreshCw className="h-3 w-3" />
                       {formatDateTime(n.timestamp)}
                    </div>
                  </div>
                  {!n.isRead ? (
                    <Button 
                      size="sm" 
                      variant="secondary" 
                      onClick={() => markRead(n._id)}
                      className="!rounded-lg h-9 px-4 font-bold border-neutral-200 text-neutral-600 hover:bg-brand-950 hover:text-white transition-all shrink-0 uppercase text-[10px] tracking-widest"
                    >
                      <CheckCheck className="h-4 w-4" />
                      <span>Mark as read</span>
                    </Button>
                  ) : (
                    <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 self-center">Read</div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
