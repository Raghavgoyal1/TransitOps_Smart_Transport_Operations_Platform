import { useAuth } from \"@/lib/auth\";
import { PageHeader } from \"@/components/Widgets\";
import { Card } from \"@/components/ui/card\";
import { Input } from \"@/components/ui/input\";
import { Label } from \"@/components/ui/label\";
import { Button } from \"@/components/ui/button\";
import { Switch } from \"@/components/ui/switch\";
import { toast } from \"sonner\";

export default function Settings() {
  const { user, logout } = useAuth();

  return (
    <div className=\"space-y-6\">
      <PageHeader title=\"Settings\" subtitle=\"Profile & preferences\" testId=\"settings-header\" />

      <div className=\"grid gap-4 lg:grid-cols-2\">
        <Card className=\"border-white/10 bg-white/[0.02] p-6\" data-testid=\"settings-profile\">
          <div className=\"mb-4 text-sm uppercase tracking-[0.2em] text-zinc-500\">Profile</div>
          <div className=\"space-y-4\">
            <div><Label>Full Name</Label><Input defaultValue={user?.name} className=\"mt-1 bg-black/40\" data-testid=\"settings-name\" /></div>
            <div><Label>Email</Label><Input defaultValue={user?.email} disabled className=\"mt-1 bg-black/40\" /></div>
            <div><Label>Role</Label><Input defaultValue={user?.role} disabled className=\"mt-1 bg-black/40\" /></div>
            <Button onClick={() => toast.success(\"Profile saved\")} className=\"bg-blue-600 hover:bg-blue-500\" data-testid=\"settings-save-profile\">Save changes</Button>
          </div>
        </Card>

        <Card className=\"border-white/10 bg-white/[0.02] p-6\" data-testid=\"settings-prefs\">
          <div className=\"mb-4 text-sm uppercase tracking-[0.2em] text-zinc-500\">Preferences</div>
          <div className=\"space-y-4\">
            <div className=\"flex items-center justify-between\">
              <div><div className=\"font-semibold\">Dark Mode</div><div className=\"text-xs text-zinc-500\">Command Center theme</div></div>
              <Switch defaultChecked disabled />
            </div>
            <div className=\"flex items-center justify-between\">
              <div><div className=\"font-semibold\">Email notifications</div><div className=\"text-xs text-zinc-500\">Trip & maintenance alerts</div></div>
              <Switch defaultChecked />
            </div>
            <div className=\"flex items-center justify-between\">
              <div><div className=\"font-semibold\">Weekly digest</div><div className=\"text-xs text-zinc-500\">Fleet performance summary</div></div>
              <Switch />
            </div>
          </div>
        </Card>

        <Card className=\"border-white/10 bg-white/[0.02] p-6 lg:col-span-2\" data-testid=\"settings-org\">
          <div className=\"mb-4 text-sm uppercase tracking-[0.2em] text-zinc-500\">Organization</div>
          <div className=\"grid gap-4 md:grid-cols-3\">
            <div><Label>Company</Label><Input defaultValue=\"TransitOps Demo Fleet\" className=\"mt-1 bg-black/40\" /></div>
            <div><Label>Currency</Label><Input defaultValue=\"USD\" className=\"mt-1 bg-black/40\" /></div>
            <div><Label>Timezone</Label><Input defaultValue=\"America/New_York\" className=\"mt-1 bg-black/40\" /></div>
          </div>
        </Card>

        <Card className=\"border-red-500/20 bg-red-500/[0.02] p-6 lg:col-span-2\" data-testid=\"settings-danger\">
          <div className=\"mb-2 text-sm uppercase tracking-[0.2em] text-red-400\">Danger Zone</div>
          <p className=\"mb-4 text-sm text-zinc-500\">Signing out will end your session.</p>
          <Button variant=\"destructive\" onClick={logout} data-testid=\"settings-logout\">Sign out</Button>
        </Card>
      </div>
    </div>
  );
}
