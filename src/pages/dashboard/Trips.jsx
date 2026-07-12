import { useEffect, useState } from \"react\";
import { api } from \"@/lib/api\";
import { PageHeader, EmptyState } from \"@/components/Widgets\";
import { Card } from \"@/components/ui/card\";
import { Button } from \"@/components/ui/button\";
import { Badge } from \"@/components/ui/badge\";
import { Table, TableHead, TableRow, TableHeader, TableBody, TableCell } from \"@/components/ui/table\";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from \"@/components/ui/select\";
import { Play, Pause, CheckCircle, XCircle } from \"lucide-react\";
import { toast } from \"sonner\";

const STATUS_COLORS = {
  Scheduled: \"bg-blue-500/20 text-blue-400\",
  Running: \"bg-emerald-500/20 text-emerald-400\",
  Paused: \"bg-amber-500/20 text-amber-400\",
  Completed: \"bg-violet-500/20 text-violet-400\",
  Cancelled: \"bg-red-500/20 text-red-400\",
};

export default function Trips() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState(\"all\");
  const [vehicles, setVehicles] = useState({});
  const [drivers, setDrivers] = useState({});
  const [routes, setRoutes] = useState({});

  const load = async () => {
    const [t, v, d, r] = await Promise.all([
      api.get(\"/trips\"), api.get(\"/vehicles\"), api.get(\"/drivers\"), api.get(\"/routes\"),
    ]);
    setItems(t.data);
    setVehicles(Object.fromEntries(v.data.map((x) => [x.id, x])));
    setDrivers(Object.fromEntries(d.data.map((x) => [x.id, x])));
    setRoutes(Object.fromEntries(r.data.map((x) => [x.id, x])));
  };

  useEffect(() => { load(); }, []);

  const action = async (trip, act) => {
    try {
      await api.post(`/trips/${trip.id}/action`, { action: act });
      toast.success(`Trip ${act}ed`);
      load();
    } catch (e) { toast.error(e.response?.data?.detail || \"Action failed\"); }
  };

  const filtered = status === \"all\" ? items : items.filter((t) => t.status === status);

  return (
    <div className=\"space-y-6\">
      <PageHeader title=\"Trips\" subtitle={`${items.length} total trips`} testId=\"trips-header\"
        action={
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className=\"w-40 border-white/10 bg-black/40\" data-testid=\"trips-status-filter\"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value=\"all\">All</SelectItem>
              {Object.keys(STATUS_COLORS).map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        }
      />

      <Card className=\"overflow-hidden border-white/10 bg-white/[0.02]\">
        {filtered.length === 0 ? <EmptyState title=\"No trips\" description=\"Try a different filter\" /> :
        <Table>
          <TableHeader>
            <TableRow className=\"border-white/5 hover:bg-transparent\">
              <TableHead>Code</TableHead><TableHead>Route</TableHead><TableHead>Driver</TableHead>
              <TableHead>Vehicle</TableHead><TableHead>Passengers</TableHead><TableHead>Revenue</TableHead>
              <TableHead>Status</TableHead><TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.slice(0, 100).map((t) => (
              <TableRow key={t.id} className=\"border-white/5\" data-testid={`trip-row-${t.id}`}>
                <TableCell className=\"font-mono text-xs\">{t.trip_code}</TableCell>
                <TableCell className=\"text-xs text-zinc-400\">{routes[t.route_id]?.name || \"-\"}</TableCell>
                <TableCell>{drivers[t.driver_id]?.name || \"-\"}</TableCell>
                <TableCell className=\"font-mono text-xs\">{vehicles[t.vehicle_id]?.vehicle_number || \"-\"}</TableCell>
                <TableCell>{t.passenger_count}</TableCell>
                <TableCell className=\"font-mono text-emerald-400\">${t.revenue.toFixed(2)}</TableCell>
                <TableCell><Badge className={STATUS_COLORS[t.status]}>{t.status}</Badge></TableCell>
                <TableCell>
                  <div className=\"flex gap-1\">
                    {t.status === \"Scheduled\" && <Button size=\"sm\" variant=\"ghost\" onClick={() => action(t, \"start\")} data-testid={`trip-start-${t.id}`}><Play className=\"h-3.5 w-3.5\" /></Button>}
                    {t.status === \"Running\" && <Button size=\"sm\" variant=\"ghost\" onClick={() => action(t, \"pause\")}><Pause className=\"h-3.5 w-3.5\" /></Button>}
                    {(t.status === \"Running\" || t.status === \"Paused\") && <Button size=\"sm\" variant=\"ghost\" onClick={() => action(t, \"complete\")} className=\"text-emerald-400\"><CheckCircle className=\"h-3.5 w-3.5\" /></Button>}
                    {t.status !== \"Completed\" && t.status !== \"Cancelled\" && <Button size=\"sm\" variant=\"ghost\" onClick={() => action(t, \"cancel\")} className=\"text-red-400\"><XCircle className=\"h-3.5 w-3.5\" /></Button>}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>}
      </Card>
    </div>
  );
}
