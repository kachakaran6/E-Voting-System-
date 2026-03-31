import { useMemo, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  BarChart3,
  Bell,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  Users,
  Vote,
  X,
} from "lucide-react";
import clsx from "clsx";
import { useAuth } from "../contexts/AuthContext";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { formatRole } from "../utils/format";

const navBase =
  "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-200 border";

export function DashboardLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const links = [
    {
      to: "/app",
      label: "Dashboard",
      description: "Platform health and real-time monitoring.",
      icon: LayoutDashboard,
      roles: ["ADMIN", "SUPER_ADMIN"] as const,
    },
    {
      to: "/app/elections",
      label: "Elections",
      description: "Manage election lifecycle and timelines.",
      icon: ShieldCheck,
      roles: ["ADMIN", "SUPER_ADMIN"] as const,
    },
    {
      to: "/app/candidates",
      label: "Candidates",
      description: "Candidate registry and party management.",
      icon: Users,
      roles: ["ADMIN", "SUPER_ADMIN"] as const,
    },
    {
      to: "/app/results",
      label: "Results",
      description: "Audit results and participation metrics.",
      icon: BarChart3,
      roles: ["ADMIN", "SUPER_ADMIN"] as const,
    },
    {
      to: "/app/ballot",
      label: "Ballot",
      description: "Access your active ballot and cast your vote.",
      icon: Vote,
      roles: ["VOTER"] as const,
    },
    {
      to: "/app/history",
      label: "Voting History",
      description: "Review and download your official voting receipts.",
      icon: History,
      roles: ["VOTER"] as const,
    },
    {
      to: "/app/notifications",
      label: "Notifications",
      description: "System alerts and official communications.",
      icon: Bell,
      roles: ["VOTER", "ADMIN", "SUPER_ADMIN"] as const,
    },
    {
      to: "/app/admins",
      label: "Admins",
      description: "Access control and officer management.",
      icon: Users,
      roles: ["SUPER_ADMIN"] as const,
    },
    {
      to: "/app/settings",
      label: "Settings",
      description: "Account security and profile management.",
      icon: Settings,
      roles: ["VOTER", "ADMIN", "SUPER_ADMIN"] as const,
    },
  ];

  const availableLinks = useMemo(
    () => links.filter((link) => (user ? (link.roles as readonly string[]).includes(user.role) : false)),
    [links, user]
  );

  const currentLink =
    availableLinks.find((link) => (link.to === "/app" ? location.pathname === "/app" : location.pathname.startsWith(link.to))) ||
    availableLinks[0];

  const navItems = (
    <>
      {availableLinks.map((link) => {
        const Icon = link.icon;
        return (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === "/app"}
            onClick={() => setMobileNavOpen(false)}
            className={({ isActive }) =>
              clsx(
                navBase,
                isActive
                  ? "border-brand-200/50 bg-brand-50 text-brand-900 shadow-sm shadow-brand-900/5"
                  : "border-transparent text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
              )
            }
          >
            <Icon className={clsx("h-[18px] w-[18px]", currentLink?.to === link.to ? "text-brand-800" : "text-neutral-400 group-hover:text-neutral-700")} />
            <span className="min-w-0 flex-1 truncate">{link.label}</span>
          </NavLink>
        );
      })}
    </>
  );

  return (
    <div className="flex min-h-screen w-full bg-[#fbfbfc]">
      {/* Sidebar - Desktop */}
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-neutral-200/60 bg-white lg:flex lg:flex-col">
        <div className="flex flex-1 flex-col p-6">
          <div className="flex items-center gap-3 border-b border-neutral-100 pb-8">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-950 text-white shadow-lg shadow-brand-950/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-base font-bold tracking-tight text-neutral-950 uppercase tracking-widest">SecureVote</div>
              <div className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.2em] text-brand-600/60">{formatRole(user?.role)} Dashboard</div>
            </div>
          </div>

          <nav className="mt-8 flex-1 space-y-1.5 overflow-y-auto pr-1">
            <div className="mb-4 ml-3 text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-400">Navigation</div>
            {navItems}
          </nav>

          <div className="mt-8 border-t border-neutral-100 pt-8">
            <div className="rounded-2xl bg-neutral-50/50 p-4 border border-neutral-100/50">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-900 text-brand-50 text-sm font-bold shadow-sm shadow-brand-900/10">
                  {user?.fullName.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold text-neutral-950">{user?.fullName}</div>
                  <div className="mt-0.5 text-[10px] uppercase tracking-[0.14em] text-neutral-400 font-bold">{formatRole(user?.role)}</div>
                </div>
              </div>
              <Button variant="secondary" fullWidth className="mt-4 justify-center !rounded-xl !bg-white hover:!bg-neutral-50 border-neutral-200/60" onClick={logout}>
                <LogOut className="h-4 w-4" />
                <span>Terminate Session</span>
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <header className="sticky top-0 z-10 flex h-[73px] items-center justify-between border-b border-neutral-200/60 bg-white/80 px-8 backdrop-blur-md lg:h-[81px]">
          <div className="flex items-center gap-4">
            <div className="lg:hidden">
              <Button variant="secondary" size="icon" onClick={() => setMobileNavOpen(true)} className="!rounded-lg">
                <Menu className="h-5 w-5" />
              </Button>
            </div>
            <div className="hidden items-center gap-2 lg:flex">
              <Badge tone="brand" className="!rounded-md !px-2 !py-0.5 text-[10px]">System Online</Badge>
              <div className="h-4 w-px bg-neutral-200"></div>
              <h1 className="text-sm font-bold text-neutral-900">{currentLink?.label || "Command Center"}</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:block text-right">
              <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Node Identity</div>
              <div className="text-xs font-bold text-neutral-900">{user?.fullName}</div>
            </div>
            <div className="h-10 w-10 overflow-hidden rounded-xl bg-brand-950 p-0.5 shadow-lg shadow-brand-950/20">
              <div className="h-full w-full rounded-lg bg-brand-900 flex items-center justify-center text-[11px] font-bold text-white uppercase">
                 {user?.fullName.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-10">
          <div className="mb-10">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge tone="neutral" className="!bg-neutral-100/50 !border-neutral-200/50 !text-neutral-500">{formatRole(user?.role)} AUTHORIZED</Badge>
              <Badge tone="success" className="!rounded-full h-2 w-2 !p-0 border-0">Dot</Badge>
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Real-time Stream Active</span>
            </div>
            <h2 className="text-4xl font-extrabold tracking-tight text-neutral-950 sm:text-5xl">{currentLink?.label || "Portal"}</h2>
            <p className="mt-3 max-w-3xl text-base font-medium text-neutral-500 leading-relaxed">
              {currentLink?.description || "Access official voting operations and secure platform controls."}
            </p>
          </div>

          <div className="min-w-0">
            <Outlet />
          </div>
        </main>
      </div>

      {mobileNavOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm" onClick={() => setMobileNavOpen(false)} aria-hidden="true" />
          <div className="absolute inset-y-0 left-0 w-full max-w-sm p-4">
            <Card className="flex h-full flex-col p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-950 text-white">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-base font-semibold text-slate-950">SecureVote</div>
                    <div className="mt-0.5 text-[11px] uppercase tracking-[0.16em] text-slate-400">{formatRole(user?.role)}</div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setMobileNavOpen(false)} aria-label="Close navigation">
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="mt-4 flex-1 space-y-1.5 overflow-y-auto">{navItems}</div>

              <div className="mt-4 border-t border-slate-200/80 pt-4">
                <div className="text-sm font-semibold text-slate-950">{user?.fullName}</div>
                <div className="mt-0.5 text-[11px] uppercase tracking-[0.14em] text-slate-400">{formatRole(user?.role)}</div>
                <Button variant="secondary" fullWidth className="mt-3 justify-center" onClick={logout}>
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      ) : null}
    </div>
  );
}

