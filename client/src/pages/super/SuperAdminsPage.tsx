import { useCallback, useEffect, useState } from "react";
import { Crown, Plus, RefreshCw, ShieldPlus, Trash2 } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { Input } from "../../components/ui/Input";
import { PageHeader } from "../../components/ui/PageHeader";
import { useToast } from "../../contexts/ToastContext";
import { api } from "../../services/api";

type Admin = { _id?: string; id?: string; fullName: string; email: string; role: string };

export function SuperAdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/admins");
      setAdmins(res.data.admins);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function create() {
    setError(null);
    setSaving(true);
    try {
      await api.post("/api/admins", { fullName, email, password });
      setFullName("");
      setEmail("");
      setPassword("");
      setShowAddForm(false);
      await load();
      showToast({ tone: "success", title: "Admin created", description: `${fullName} has been added.` });
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to create admin";
      setError(message);
      showToast({ tone: "error", title: "Action failed", description: message });
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    setError(null);
    setDeletingId(id);
    try {
      await api.delete(`/api/admins/${id}`);
      await load();
      showToast({ tone: "success", title: "Admin removed", description: "Account deleted." });
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to delete admin";
      setError(message);
      showToast({ tone: "error", title: "Action failed", description: message });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="Security"
        title="Admin Management"
        description="Manage system administrators and access levels."
        actions={
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={load} loading={loading} className="!rounded-lg h-10 border-neutral-200">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button onClick={() => setShowAddForm(!showAddForm)} className="!rounded-lg h-10 font-bold bg-brand-950">
              <Plus className="h-4 w-4" />
              <span>{showAddForm ? "Cancel" : "Add Admin"}</span>
            </Button>
          </div>
        }
      />

      {showAddForm && (
        <Card className="border-neutral-100 shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-4">
          <div className="bg-white p-6 sm:p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-950 text-white">
                <ShieldPlus className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-neutral-900">New Administrator</h2>
                <p className="mt-1 text-sm font-medium text-neutral-500">Create a new account with management access.</p>
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              <Input label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Sarah Jenkins" className="!rounded-lg" />
              <Input label="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jenkins@example.com" className="!rounded-lg" />
              <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} hint="Min 8 characters" className="!rounded-lg" />
            </div>
            {error ? (
              <div className="mt-6 rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-xs font-bold text-danger-800 uppercase">
                {error}
              </div>
            ) : null}
            <div className="mt-8 flex justify-end">
              <Button onClick={create} loading={saving} disabled={!fullName || !email || password.length < 8} className="min-w-[150px] !rounded-lg font-bold bg-brand-950">
                Create Account
              </Button>
            </div>
          </div>
        </Card>
      )}

      <Card className="border-neutral-100 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8 pb-4 border-b border-neutral-50">
            <div>
              <h3 className="text-xl font-bold text-neutral-900">Administrator List</h3>
              <p className="mt-1 text-sm font-medium text-neutral-500">Authorized platform managers.</p>
            </div>
            <Badge tone="brand" className="h-7 !px-4 !rounded-lg font-bold">{admins.length} Total</Badge>
          </div>

          {loading ? (
            <div className="grid gap-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-center gap-4 p-4 border border-neutral-50 rounded-xl animate-pulse">
                   <div className="h-10 w-10 rounded-lg bg-neutral-100" />
                   <div className="flex-1 space-y-2">
                     <div className="h-4 w-40 bg-neutral-100 rounded" />
                     <div className="h-3 w-60 bg-neutral-100 rounded" />
                   </div>
                </div>
              ))}
            </div>
          ) : admins.length === 0 ? (
            <div className="py-12">
              <EmptyState
                icon={Crown}
                title="No admins found"
                description="Use the form above to add an administrator."
              />
            </div>
          ) : (
            <div className="overflow-x-auto -mx-6 sm:-mx-8">
              <div className="inline-block min-w-full align-middle px-6 sm:px-8">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-neutral-50">
                      <th className="py-4 pr-4 text-[10px] font-bold uppercase tracking-widest text-neutral-400 text-left">Internal Name / Email</th>
                      <th className="py-4 pr-4 text-[10px] font-bold uppercase tracking-widest text-neutral-400 text-left">Role</th>
                      <th className="py-4 text-[10px] font-bold uppercase tracking-widest text-neutral-400 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-50">
                    {admins.map((a) => {
                      const id = (a._id || a.id) as string;
                      return (
                        <tr key={id} className="group hover:bg-neutral-50/50 transition-colors">
                          <td className="py-5 pr-4">
                            <div className="text-sm font-bold text-neutral-900 group-hover:text-brand-950 transition-colors">{a.fullName}</div>
                            <div className="mt-1 text-xs font-medium text-neutral-400 uppercase tracking-tight">{a.email}</div>
                          </td>
                          <td className="py-5 pr-4">
                            <Badge tone="brand" className="!rounded-md !px-3 font-bold text-[10px] uppercase tracking-wider">{a.role.replace('_', ' ')}</Badge>
                          </td>
                          <td className="py-5 text-right">
                            <Button size="icon" variant="danger" className="!h-9 !w-9 !rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" loading={deletingId === id} onClick={() => remove(id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
