import { useEffect, useState } from \"react\";
import { api } from \"@/lib/api\";
import { PageHeader, EmptyState } from \"@/components/Widgets\";
import { Card } from \"@/components/ui/card\";
import { Badge } from \"@/components/ui/badge\";
import { Table, TableHead, TableRow, TableHeader, TableBody, TableCell } from \"@/components/ui/table\";
import { Wrench, AlertTriangle, CheckCircle } from \"lucide-react\";

const STATUS_COLORS = {
  Pending: \"bg-amber-500/20 text-amber-400\",
  InProgress: \"bg-blue-500/20 text-blue-400\",
  Completed: \"bg-emerald-500/20 text-emerald-400\",
};

export default function Maintenance() {
  const [items, setItems] = useState([]);
  const [vehicles, setVehicles] = useState({});

  useEffect(() => {
    Promise.all([api.get(\"/maintenance\"), api.get(\"/vehicles\")]).then(([m, v]) => {
      setItems(m.data);
      setVehicles(Object.fromEntries(v.data.map((x) => [x.id, x])));
    });
  }, []);

  const pending = items.filter((i) => i.status === \"Pending\").length;
  const inProgress = items.filter((i) => i.status === \"InProgress\").length;
  const completed = items.filter((i) => i.status === \"Completed\").length;

  return (
    <div className=\"space-y-6\">
      <PageHeader title=\"Maintenance\" subtitle=\"Scheduled service & repair tracking\" testId=\"maintenance-header\" />

      <div className=\"grid gap-4 md:grid-cols-3\">
        <Card className=\"border-white/10 bg-white/[0.02] p-5\" data-testid=\"maint-pending\"><div className=\"flex items-center justify-between\"><div><div className=\"text-xs uppercase tracking-widest text-zinc-500\">Pending</div><div className=\"mt-2 font-display text-3xl font-bold\">{pending}</div></div><AlertTriangle className=\"h-6 w-6 text-amber-400\" /></div></Card>
        <Card className=\"border-white/10 bg-white/[0.02] p-5\" data-testid=\"maint-progress\"><div className=\"flex items-center justify-between\"><div><div className=\"text-xs uppercase tracking-widest text-zinc-500\">In Progress</div><div className=\"mt-2 font-display text-3xl font-bold\">{inProgress}</div></div><Wrench className=\"h-6 w-6 text-blue-400\" /></div></Card>
        <Card className=\"border-white/10 bg-white/[0.02] p-5\" data-testid=\"maint-done\"><div className=\"flex items-center justify-between\"><div><div className=\"text-xs uppercase tracking-widest text-zinc-500\">Completed</div><div className=\"mt-2 font-display text-3xl font-bold\">{completed}</div></div><CheckCircle className=\"h-6 w-6 text-emerald-400\" /></div></Card>
      </div>

      <Card className=\"overflow-hidden border-white/10 bg-white/[0.02]\">
        {items.length === 0 ? <EmptyState title=\"No maintenance records\" description=\"Schedule your first service\" /> :
        <Table>
          <TableHeader>
            <TableRow className=\"border-white/5 hover:bg-transparent\">
              <TableHead>Vehicle</TableHead><TableHead>Type</TableHead><TableHead>Description</TableHead>
              <TableHead>Scheduled</TableHead><TableHead>Cost</TableHead><TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.slice(0, 50).map((m) => (
              <TableRow key={m.id} className=\"border-white/5\" data-testid={`maint-row-${m.id}`}>
                <TableCell className=\"font-mono text-xs\">{vehicles[m.vehicle_id]?.vehicle_number || \"-\"}</TableCell>
                <TableCell><Badge variant=\"outline\">{m.type}</Badge></TableCell>
                <TableCell>{m.description}</TableCell>
                <TableCell className=\"text-xs text-zinc-400\">{new Date(m.scheduled_date).toLocaleDateString()}</TableCell>
                <TableCell className=\"font-mono text-emerald-400\">${m.cost.toFixed(2)}</TableCell>
                <TableCell><Badge className={STATUS_COLORS[m.status]}>{m.status}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>}
      </Card>
    </div>
  );

"