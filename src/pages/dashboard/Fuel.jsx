import { useEffect, useState } from \"react\";
import { api } from \"@/lib/api\";
import { PageHeader, StatCard } from \"@/components/Widgets\";
import { Card } from \"@/components/ui/card\";
import { BarChart, Bar, LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from \"recharts\";
import { Fuel as FuelIcon, DollarSign, Gauge } from \"lucide-react\";

export default function Fuel() {
  const [analytics, setAnalytics] = useState(null);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    api.get(\"/analytics/overview\").then((r) => setAnalytics(r.data));
    api.get(\"/fuel\").then((r) => setLogs(r.data.slice(0, 20)));
  }, []);

  const totalLiters = logs.reduce((s, l) => s + l.liters, 0).toFixed(1);
  const totalCost = logs.reduce((s, l) => s + l.cost, 0).toFixed(2);
  const avgMpg = logs.length ? (logs.reduce((s, l) => s + l.odometer, 0) / logs.length / 1000).toFixed(1) : 0;

  return (
    <div className=\"space-y-6\">
      <PageHeader title=\"Fuel Management\" subtitle=\"Consumption, cost & efficiency\" testId=\"fuel-header\" />

      <div className=\"grid gap-4 md:grid-cols-3\">
        <StatCard label=\"Liters (Last 30)\" value={`${totalLiters}L`} icon={FuelIcon} accent=\"blue\" testId=\"fuel-stat-liters\" />
        <StatCard label=\"Fuel Cost\" value={`$${totalCost}`} icon={DollarSign} accent=\"emerald\" testId=\"fuel-stat-cost\" />
        <StatCard label=\"Avg Odometer\" value={`${avgMpg}k km`} icon={Gauge} accent=\"violet\" testId=\"fuel-stat-mpg\" />
      </div>

      <div className=\"grid gap-4 lg:grid-cols-2\">
        <Card className=\"border-white/10 bg-white/[0.02] p-5\" data-testid=\"fuel-liters-chart\">
          <div className=\"mb-4 text-xs uppercase tracking-[0.2em] text-zinc-500\">Liters per day</div>
          <div className=\"h-64\">
            <ResponsiveContainer>
              <BarChart data={analytics?.fuel_7d || []}>
                <XAxis dataKey=\"date\" stroke=\"#71717a\" fontSize={12} />
                <YAxis stroke=\"#71717a\" fontSize={12} />
                <Tooltip contentStyle={{ background: \"#18181b\", border: \"1px solid #27272a\", borderRadius: 8 }} />
                <Bar dataKey=\"liters\" fill=\"#2563eb\" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className=\"border-white/10 bg-white/[0.02] p-5\" data-testid=\"fuel-cost-chart\">
          <div className=\"mb-4 text-xs uppercase tracking-[0.2em] text-zinc-500\">Cost trend</div>
          <div className=\"h-64\">
            <ResponsiveContainer>
              <LineChart data={analytics?.fuel_7d || []}>
                <XAxis dataKey=\"date\" stroke=\"#71717a\" fontSize={12} />
                <YAxis stroke=\"#71717a\" fontSize={12} />
                <Tooltip contentStyle={{ background: \"#18181b\", border: \"1px solid #27272a\", borderRadius: 8 }} />
                <Line type=\"monotone\" dataKey=\"cost\" stroke=\"#10b981\" strokeWidth={2} dot={{ fill: \"#10b981\", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className=\"border-white/10 bg-white/[0.02] p-5\">
        <div className=\"mb-3 text-xs uppercase tracking-[0.2em] text-zinc-500\">Recent fuel logs</div>
        <div className=\"divide-y divide-white/5\">
          {logs.map((l) => (
            <div key={l.id} className=\"flex items-center justify-between py-2 text-sm\">
              <div className=\"font-mono text-xs text-zinc-500\">{new Date(l.date).toLocaleDateString()}</div>
              <div>{l.station}</div>
              <div className=\"font-mono\">{l.liters}L</div>
              <div className=\"font-mono text-emerald-400\">${l.cost}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
