import { useState } from \"react\";
import { Link, useNavigate } from \"react-router-dom\";
import { useAuth } from \"@/lib/auth\";
import { Button } from \"@/components/ui/button\";
import { Input } from \"@/components/ui/input\";
import { Label } from \"@/components/ui/label\";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from \"@/components/ui/select\";
import { Truck, Loader2 } from \"lucide-react\";
import { toast } from \"sonner\";

const ROLES = [\"Passenger\", \"Driver\", \"Dispatcher\", \"Transport Manager\", \"Admin\"];

export default function Register() {
  const [form, setForm] = useState({ name: \"\", email: \"\", password: \"\", role: \"Passenger\", phone: \"\" });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const nav = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success(\"Account created!\");
      nav(\"/dashboard\");
    } catch (err) {
      toast.error(err.response?.data?.detail || \"Registration failed\");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=\"flex min-h-screen items-center justify-center bg-[#0a0a0b] p-6\">
      <div className=\"w-full max-w-md\">
        <Link to=\"/\" className=\"mb-8 flex items-center gap-2\" data-testid=\"reg-brand-link\">
          <div className=\"grid h-8 w-8 place-items-center rounded-md bg-gradient-to-br from-blue-500 to-emerald-500\"><Truck className=\"h-4 w-4 text-white\" /></div>
          <span className=\"font-display text-xl font-bold\">TransitOps</span>
        </Link>
        <h1 className=\"font-display text-3xl font-bold\" data-testid=\"reg-heading\">Create your account</h1>
        <p className=\"mt-2 text-sm text-zinc-500\">Join the command center.</p>

        <form onSubmit={onSubmit} className=\"mt-8 space-y-4\">
          <div>
            <Label htmlFor=\"name\">Full Name</Label>
            <Input id=\"name\" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required data-testid=\"reg-name-input\" className=\"mt-1.5 bg-white/[0.03]\" />
          </div>
          <div>
            <Label htmlFor=\"email\">Email</Label>
            <Input id=\"email\" type=\"email\" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required data-testid=\"reg-email-input\" className=\"mt-1.5 bg-white/[0.03]\" />
          </div>
          <div>
            <Label htmlFor=\"password\">Password</Label>
            <Input id=\"password\" type=\"password\" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} data-testid=\"reg-password-input\" className=\"mt-1.5 bg-white/[0.03]\" />
          </div>
          <div>
            <Label>Role</Label>
            <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
              <SelectTrigger className=\"mt-1.5 bg-white/[0.03]\" data-testid=\"reg-role-select\"><SelectValue /></SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => <SelectItem key={r} value={r} data-testid={`role-${r.replace(/\s/g, \"-\").toLowerCase()}`}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor=\"phone\">Phone (optional)</Label>
            <Input id=\"phone\" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} data-testid=\"reg-phone-input\" className=\"mt-1.5 bg-white/[0.03]\" />
          </div>
          <Button type=\"submit\" disabled={loading} className=\"w-full bg-blue-600 hover:bg-blue-500\" data-testid=\"reg-submit-btn\">
            {loading ? <Loader2 className=\"mr-2 h-4 w-4 animate-spin\" /> : null} Create account
          </Button>
        </form>
        <div className=\"mt-6 text-sm text-zinc-500\">
          Have an account? <Link to=\"/login\" className=\"text-blue-400 hover:underline\" data-testid=\"reg-login-link\">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
