import { useEffect, useState } from \"react\";
import { api } from \"@/lib/api\";
import { PageHeader } from \"@/components/Widgets\";
import { Card } from \"@/components/ui/card\";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend
} from \"recharts\";

const COLORS = [\"#2563eb\", \"#10b981\", \"#f59e0b\", \"#ef4444\", \"#a855f7\"];

export default function Analytics() {
  const [data, setData] = useState(null);
  useEffect(() => { api.get(\"/analytics/overview\").then((r) => setData(r.data)); }, []);

  return (
    <div className=\"space-y-6\">
      <PageHeader title=\"Analytics\" subtitle=\"Deep insights across the fleet\" testId=\"analytics-header\" />

      <div className=\"grid gap-4 lg:grid-cols-2\">
        <Card className=\"border-white/10 bg-white/[0.02] p-5\" data-testid=\"chart-revenue\">
          <div className=\"mb-4 text-xs uppercase tracking-[0.2em] text-zinc-500\">Revenue (7 days)</div>
          <div className=\"h-64\">
            <ResponsiveContainer>
              <AreaChart data={data?.revenue_7d || []}>
                <defs>
                  <linearGradient id=\"cr\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\">
                    <stop offset=\"0%\" stopColor=\"#2563eb\" stopOpacity={0.5} />
                    <stop offset=\"100%\" stopColor=\"#2563eb\" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey=\"date\" stroke=\"#71717a\" fontSize={12} />
                <YAxis stroke=\"#71717a\" fontSize={12} />
                <Tooltip contentStyle={{ background: \"#18181b\", border: \"1px solid #27272a\", borderRadius: 8 }} />
                <Area type=\"monotone\" dataKey=\"revenue\" stroke=\"#2563eb\" strokeWidth={2} fill=\"url(#cr)\" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className=\"border-white/10 bg-white/[0.02] p-5\" data-testid=\"chart-trips\">
          <div className=\"mb-4 text-xs uppercase tracking-[0.2em] text-zinc-500\">Trips & Passengers</div>
          <div className=\"h-64\">
            <ResponsiveContainer>
              <BarChart data={data?.trips_7d || []}>
                <XAxis dataKey=\"date\" stroke=\"#71717a\" fontSize={12} />
                <YAxis stroke=\"#71717a\" fontSize={12} />
                <Tooltip contentStyle={{ background: \"#18181b\", border: \"1px solid #27272a\", borderRadius: 8 }} />
                <Legend />
                <Bar dataKey=\"trips\" fill=\"#2563eb\" radius={[6, 6, 0, 0]} />
                <Bar dataKey=\"passengers\" fill=\"#10b981\" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className=\"border-white/10 bg-white/[0.02] p-5\" data-testid=\"chart-fuel\">
          <div className=\"mb-4 text-xs uppercase tracking-[0.2em] text-zinc-500\">Fuel Consumption</div>
          <div className=\"h-64\">
            <ResponsiveContainer>
              <LineChart data={data?.fuel_7d || []}>
                <XAxis dataKey=\"date\" stroke=\"#71717a\" fontSize={12} />
                <YAxis stroke=\"#71717a\" fontSize={12} />
                <Tooltip contentStyle={{ background: \"#18181b\", border: \"1px solid #27272a\", borderRadius: 8 }} />
                <Line type=\"monotone\" dataKey=\"liters\" stroke=\"#f59e0b\" strokeWidth={2} dot={{ fill: \"#f59e0b\", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className=\"border-white/10 bg-white/[0.02] p-5\" data-testid=\"chart-drivers\">
          <div className=\"mb-4 text-xs uppercase tracking-[0.2em] text-zinc-500\">Top Drivers (Score)</div>
          <div className=\"h-64\">
            <ResponsiveContainer>
              <BarChart data={data?.top_drivers || []} layout=\"vertical\">
                <XAxis type=\"number\" stroke=\"#71717a\" fontSize={12} />
                <YAxis type=\"category\" dataKey=\"name\" stroke=\"#71717a\" fontSize={11} width={120} />
                <Tooltip contentStyle={{ background: \"#18181b\", border: \"1px solid #27272a\", borderRadius: 8 }} />
                <Bar dataKey=\"score\" fill=\"#10b981\" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className=\"border-white/10 bg-white/[0.02] p-5 lg:col-span-2\" data-testid=\"chart-status\">
          <div className=\"mb-4 text-xs uppercase tracking-[0.2em] text-zinc-500\">Trip Status Distribution</div>
          <div className=\"h-64\">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={data?.status_dist || []} dataKey=\"value\" nameKey=\"name\" outerRadius={100} label>
                  {(data?.status_dist || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: \"#18181b\", border: \"1px solid #27272a\", borderRadius: 8 }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
