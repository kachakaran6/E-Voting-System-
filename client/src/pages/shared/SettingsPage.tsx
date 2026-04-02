import { LogOut, UserRound } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../contexts/AuthContext";
import { formatRole } from "../../utils/format";

export function SettingsPage() {
  const { user, logout } = useAuth();

  return (
    <div className="grid gap-6">

      <div className="grid gap-8 xl:grid-cols-[1.3fr_0.7fr]">
        <Card className="border-neutral-100 shadow-sm overflow-hidden">
          <div className="bg-neutral-50/50 p-6 sm:p-8 border-b border-neutral-100">
            <div className="flex items-center gap-6">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-950 text-white shadow-lg">
                <UserRound className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-neutral-900 uppercase tracking-tight">{user?.fullName}</h3>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <Badge tone="brand" className="!rounded-md !px-3 font-bold uppercase text-[10px] tracking-widest">{formatRole(user?.role)}</Badge>
                  {user?.state ? (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-neutral-100/50 border border-neutral-200 text-[11px] font-bold text-neutral-500 uppercase tracking-widest">
                      {user.state}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="group rounded-xl border border-neutral-50 bg-white p-5 transition-all hover:border-brand-100 hover:shadow-sm">
                <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Full Name</div>
                <div className="mt-3 text-base font-bold text-neutral-900">{user?.fullName || "--"}</div>
              </div>
              <div className="group rounded-xl border border-neutral-50 bg-white p-5 transition-all hover:border-brand-100 hover:shadow-sm">
                <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">System Role</div>
                <div className="mt-3 text-base font-bold text-neutral-900">{formatRole(user?.role)}</div>
              </div>
              {user?.email ? (
                <div className="group rounded-xl border border-neutral-100 bg-white p-5 transition-all hover:border-brand-100 hover:shadow-sm">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Email Address</div>
                  <div className="mt-3 text-base font-bold text-neutral-900 truncate">{user.email}</div>
                </div>
              ) : null}
              {user?.voterId ? (
                <div className="group rounded-xl border border-neutral-100 bg-white p-5 transition-all hover:border-brand-100 hover:shadow-sm">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Voter ID</div>
                  <div className="mt-3 text-base font-bold text-neutral-900 tracking-tight">{user.voterId}</div>
                </div>
              ) : null}
              {user?.state ? (
                <div className="group rounded-xl border border-neutral-100 bg-white p-5 transition-all hover:border-brand-100 hover:shadow-sm">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">State</div>
                  <div className="mt-3 text-base font-bold text-neutral-900">{user.state}</div>
                </div>
              ) : null}
            </div>
          </div>
        </Card>

        <div className="grid gap-6 self-start">
          <Card className="border-danger-100 bg-danger-50 shadow-sm p-8 flex flex-col items-center text-center">
            <h4 className="text-lg font-bold text-danger-900 uppercase tracking-tight">Security Access</h4>
             <p className="mt-4 text-xs font-bold text-danger-700/80 uppercase tracking-widest leading-relaxed">
              Terminate your current session to prevent unauthorized access.
            </p>
            <Button 
                variant="danger" 
                fullWidth 
                className="mt-8 justify-center h-12 !rounded-xl font-bold bg-danger-600 hover:bg-danger-700 transition-all uppercase tracking-widest text-[11px]" 
                onClick={logout}
            >
              <LogOut className="h-4 w-4" />
              <span>Terminate Session</span>
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
