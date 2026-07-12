import { useState } from \"react\";
import { Link, useNavigate } from \"react-router-dom\";
import { useAuth } from \"@/lib/auth\";
import { Button } from \"@/components/ui/button\";
import { Input } from \"@/components/ui/input\";
import { Label } from \"@/components/ui/label\";
import { Card } from \"@/components/ui/card\";
import { Truck, Loader2 } from \"lucide-react\";
import { toast } from \"sonner\";

const DEMO_ACCOUNTS = [
  { label: \"Admin\", email: \"admin@transitops.com\", password: \"admin123\" },
  { label: \"Manager\", email: \"manager@transitops.com\", password: \"manager123\" },
  { label: \"Dispatcher\", email: \"dispatcher@transitops.com\", password: \"dispatch123\" },
  { label: \"Driver\", email: \"driver@transitops.com\", password: \"driver123\" },
  { label: \"Passenger\", email: \"passenger@transitops.com\", password: \"pass123\" },
];

export default function Login() {
  const [email, setEmail] = useState(\"admin@transitops.com\");
  const [password, setPassword] = useState(\"admin123\");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const nav = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success(\"Welcome back!\");
      nav(\"/dashboard\");
    } catch (err) {
      toast.error(err.response?.data?.detail || \"Login failed\");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=\"grid min-h-screen bg-[#0a0a0b] md:grid-cols-2\">
      <div className=\"hidden md:block\">
        <div className=\"relative h-full\">
          <img src=\"https://images.unsplash.com/photo-1635822279175-67270a5bffcb?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzNDR8MHwxfHNlYXJjaHwyfHxsb2dpc3RpY3MlMjBmbGVldCUyMHRydWNrJTIwbmlnaHQlMjBoaWdod2F5fGVufDB8fHx8MTc4MzgzMzMyNnww&ixlib=rb-4.1.0&q=85\" alt=\"\" className=\"h-full w-full object-cover\" />
          <div className=\"absolute inset-0 bg-gradient-to-br from-black/70 to-blue-900/60\" />
          <div className=\"absolute bottom-10 left-10 right-10\">
            <div className=\"font-display text-3xl font-bold text-white\">Move with certainty.</div>
            <div className=\"mt-2 text-zinc-300\">The command center for modern transport.</div>
          </div>
        </div>
      </div>
      <div className=\"flex items-center justify-center p-6\">
        <div className=\"w-full max-w-md\">
          <Link to=\"/\" className=\"mb-8 flex items-center gap-2\" data-testid=\"login-brand-link\">
            <div className=\"grid h-8 w-8 place-items-center rounded-md bg-gradient-to-br from-blue-500 to-emerald-500\"><Truck className=\"h-4 w-4 text-white\" /></div>
            <span className=\"font-display text-xl font-bold\">TransitOps</span>
          </Link>
          <h1 className=\"font-display text-3xl font-bold\" data-testid=\"login-heading\">Sign in</h1>
          <p className=\"mt-2 text-sm text-zinc-500\">Access your fleet command center.</p>

          <form onSubmit={onSubmit} className=\"mt-8 space-y-4\">
            <div>
              <Label htmlFor=\"email\">Email</Label>
              <Input id=\"email\" type=\"email\" value={email} onChange={(e) => setEmail(e.target.value)} required data-testid=\"login-email-input\" className=\"mt-1.5 bg-white/[0.03]\" />
            </div>
            <div>
              <Label htmlFor=\"password\">Password</Label>
              <Input id=\"password\" type=\"password\" value={password} onChange={(e) => setPassword(e.target.value)} required data-testid=\"login-password-input\" className=\"mt-1.5 bg-white/[0.03]\" />
            </div>
            <Button type=\"submit\" disabled={loading} className=\"w-full bg-blue-600 hover:bg-blue-500\" data-testid=\"login-submit-btn\">
              {loading ? <Loader2 className=\"mr-2 h-4 w-4 animate-spin\" /> : null} Sign in
            </Button>
          </form>

          <div className=\"mt-6 text-sm text-zinc-500\">
            No account? <Link to=\"/register\" className=\"text-blue-400 hover:underline\" data-testid=\"login-register-link\">Create one</Link>
          </div>

          <Card className=\"mt-8 border-white/10 bg-white/[0.02] p-4\">
            <div className=\"mb-3 text-xs uppercase tracking-[0.2em] text-zinc-500\">Demo accounts</div>
            <div className=\"grid grid-cols-2 gap-2 sm:grid-cols-3\">
              {DEMO_ACCOUNTS.map((a) => (
                <button key={a.email} onClick={() => { setEmail(a.email); setPassword(a.password); }} className=\"rounded-md border border-white/10 bg-white/[0.02] px-2 py-1.5 text-xs text-zinc-300 hover:border-blue-500/40 hover:text-white\" data-testid={`demo-${a.label.toLowerCase()}-btn`}>
                  {a.label}
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
