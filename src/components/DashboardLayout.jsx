import { Outlet, NavLink, useNavigate } from \"react-router-dom\";
import { useAuth } from \"@/lib/auth\";
import { Button } from \"@/components/ui/button\";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from \"@/components/ui/dropdown-menu\";
import {
  LayoutDashboard, Truck, Users, Map, Route as RouteIcon, MapPin, Fuel, Wrench,
  BarChart3, Bot, Bell, Settings, LogOut, Search, User
} from \"lucide-react\";
import { useEffect, useState } from \"react\";
import { api } from \"@/lib/api\";
import { Input } from \"@/components/ui/input\";

const NAV = [
  { to: \"/dashboard\", icon: LayoutDashboard, label: \"Overview\", end: true },
  { to: \"/dashboard/vehicles\", icon: Truck, label: \"Vehicles\" },
  { to: \"/dashboard/drivers\", icon: Users, label: \"Drivers\" },
  { to: \"/dashboard/routes\", icon: RouteIcon, label: \"Routes\" },
  { to: \"/dashboard/trips\", icon: Map, label: \"Trips\" },
  { to: \"/dashboard/tracking\", icon: MapPin, label: \"Live Tracking\" },
  { to: \"/dashboard/fuel\", icon: Fuel, label: \"Fuel\" },
  { to: \"/dashboard/maintenance\", icon: Wrench, label: \"Maintenance\" },
  { to: \"/dashboard/analytics\", icon: BarChart3, label: \"Analytics\" },
  { to: \"/dashboard/ai\", icon: Bot, label: \"AI Assistant\" },
  { to: \"/dashboard/notifications\", icon: Bell, label: \"Notifications\" },
  { to: \"/dashboard/settings\", icon: Settings, label: \"Settings\" },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [now, setNow] = useState(new Date());
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    api.get(\"/notifications\").then((r) => {
      setNotifCount(r.data.filter((n) => !n.read).length);
    }).catch(() => {});
  }, []);

  const initials = (user?.name || \"U\").split(\" \").map((s) => s[0]).slice(0, 2).join(\"\");

  return (
    <div className=\"min-h-screen bg-[#0a0a0b] text-white\">
      {/* Sidebar */}
      <aside className=\"fixed inset-y-0 left-0 z-40 hidden w-60 border-r border-white/5 bg-black/40 md:block\" data-testid=\"sidebar\">
        <div className=\"flex h-16 items-center gap-2 border-b border-white/5 px-5\">
          <div className=\"grid h-8 w-8 place-items-center rounded-md bg-gradient-to-br from-blue-500 to-emerald-500\"><Truck className=\"h-4 w-4 text-white\" /></div>
          <span className=\"font-display text-lg font-bold\">TransitOps</span>
        </div>
        <nav className=\"p-3\">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `mb-1 flex items-center gap-3 rounded-md px-3 py-2 text-sm ${
                  isActive ? \"bg-blue-500/10 text-blue-400\" : \"text-zinc-400 hover:bg-white/[0.03] hover:text-white\"
                }`
              }
              data-testid={`nav-${n.label.toLowerCase().replace(/\s/g, \"-\")}`}
            >
              <n.icon className=\"h-4 w-4\" /> {n.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Top nav */}
      <header className=\"fixed left-0 right-0 top-0 z-30 flex h-16 items-center gap-4 border-b border-white/5 bg-black/60 px-4 backdrop-blur-xl md:left-60\" data-testid=\"topnav\">
        <div className=\"relative hidden max-w-md flex-1 md:block\">
          <Search className=\"absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500\" />
          <Input placeholder=\"Search vehicles, drivers, trips...\" className=\"border-white/10 bg-white/[0.03] pl-9\" data-testid=\"global-search-input\" />
        </div>
        <div className=\"flex flex-1 items-center justify-end gap-4\">
          <div className=\"hidden font-mono text-sm text-zinc-400 md:block\" data-testid=\"live-clock\">
            {now.toLocaleTimeString(\"en-US\", { hour12: false })}
          </div>
          <button className=\"relative rounded-md p-2 text-zinc-400 hover:bg-white/[0.03] hover:text-white\" onClick={() => nav(\"/dashboard/notifications\")} data-testid=\"notif-bell\">
            <Bell className=\"h-5 w-5\" />
            {notifCount > 0 && <span className=\"absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold\">{notifCount}</span>}
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className=\"flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.03] px-3 py-1.5 hover:bg-white/[0.06]\" data-testid=\"user-menu-trigger\">
                <div className=\"grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 text-xs font-semibold\">{initials}</div>
                <span className=\"hidden text-sm md:inline\">{user?.name}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align=\"end\" className=\"w-56 border-white/10 bg-zinc-900\">
              <DropdownMenuLabel>
                <div className=\"font-semibold\">{user?.name}</div>
                <div className=\"text-xs text-zinc-500\">{user?.role}</div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => nav(\"/dashboard/settings\")} data-testid=\"menu-settings\"><User className=\"mr-2 h-4 w-4\" /> Profile</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} data-testid=\"menu-logout\" className=\"text-red-400\"><LogOut className=\"mr-2 h-4 w-4\" /> Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className=\"md:pl-60\">
        <div className=\"min-h-[calc(100vh-4rem)] px-4 pt-20 pb-8 md:px-8\">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
