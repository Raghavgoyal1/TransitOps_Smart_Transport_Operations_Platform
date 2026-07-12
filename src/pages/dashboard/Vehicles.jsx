import { useEffect, useState } from \"react\";
import { api } from \"@/lib/api\";
import { PageHeader, EmptyState } from \"@/components/Widgets\";
import { Card } from \"@/components/ui/card\";
import { Button } from \"@/components/ui/button\";
import { Input } from \"@/components/ui/input\";
import { Label } from \"@/components/ui/label\";
import { Badge } from \"@/components/ui/badge\";
import { Table, TableHead, TableRow, TableHeader, TableBody, TableCell } from \"@/components/ui/table\";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from \"@/components/ui/dialog\";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from \"@/components/ui/select\";
import { Plus, Trash2, Edit, Search } from \"lucide-react\";
import { toast } from \"sonner\";

const TYPES = [\"Bus\", \"MiniBus\", \"Truck\", \"Van\", \"ElectricBus\"];
const STATUSES = [\"Available\", \"Running\", \"Maintenance\", \"Inactive\"];

const STATUS_COLORS = {
  Available: \"bg-emerald-500/20 text-emerald-400\",
  Running: \"bg-blue-500/20 text-blue-400\",
  Maintenance: \"bg-amber-500/20 text-amber-400\",
  Inactive: \"bg-zinc-500/20 text-zinc-400\",
};

export default function Vehicles() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [q, setQ] = useState(\"\");
  const [statusFilter, setStatusFilter] = useState(\"all\");
  const [form, setForm] = useState({ vehicle_number: \"\", registration_number: \"\", vehicle_type: \"Bus\", capacity: 40, fuel_type: \"Diesel\", current_fuel: 100, mileage: 12, status: \"Available\" });

  const load = async () => {
    setLoading(true);
    const { data } = await api.get(\"/vehicles\");
    setItems(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm({ vehicle_number: \"\", registration_number: \"\", vehicle_type: \"Bus\", capacity: 40, fuel_type: \"Diesel\", current_fuel: 100, mileage: 12, status: \"Available\" }); setOpen(true); };
  const openEdit = (v) => { setEditing(v); setForm({ ...v }); setOpen(true); };

  const save = async () => {
    try {
      if (editing) {
        await api.put(`/vehicles/${editing.id}`, form);
        toast.success(\"Vehicle updated\");
      } else {
        await api.post(\"/vehicles\", form);
        toast.success(\"Vehicle created\");
      }
      setOpen(false); load();
    } catch (e) { toast.error(e.response?.data?.detail || \"Save failed\"); }
  };

  const del = async (id) => {
    if (!window.confirm(\"Delete this vehicle?\")) return;
    await api.delete(`/vehicles/${id}`);
    toast.success(\"Deleted\");
    load();
  };

  const filtered = items.filter((v) =>
    (statusFilter === \"all\" || v.status === statusFilter) &&
    (q === \"\" || v.vehicle_number.toLowerCase().includes(q.toLowerCase()) || v.registration_number.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div className=\"space-y-6\">
      <PageHeader
        title=\"Vehicles\"
        subtitle={`${items.length} vehicles in your fleet`}
        testId=\"vehicles-header\"
        action={<Button onClick={openCreate} className=\"bg-blue-600 hover:bg-blue-500\" data-testid=\"vehicle-add-btn\"><Plus className=\"mr-2 h-4 w-4\" /> Add Vehicle</Button>}
      />

      <Card className=\"border-white/10 bg-white/[0.02] p-4\">
        <div className=\"flex flex-wrap gap-3\">
          <div className=\"relative flex-1\">
            <Search className=\"absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500\" />
            <Input placeholder=\"Search by number...\" value={q} onChange={(e) => setQ(e.target.value)} className=\"border-white/10 bg-black/40 pl-9\" data-testid=\"vehicle-search\" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className=\"w-40 border-white/10 bg-black/40\" data-testid=\"vehicle-status-filter\"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value=\"all\">All statuses</SelectItem>
              {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card className=\"overflow-hidden border-white/10 bg-white/[0.02]\">
        {loading ? <div className=\"p-8 text-center text-zinc-500\">Loading...</div> :
         filtered.length === 0 ? <EmptyState title=\"No vehicles\" description=\"Add your first vehicle to get started.\" /> :
        <Table>
          <TableHeader>
            <TableRow className=\"border-white/5 hover:bg-transparent\">
              <TableHead>Number</TableHead><TableHead>Registration</TableHead><TableHead>Type</TableHead>
              <TableHead>Capacity</TableHead><TableHead>Fuel</TableHead><TableHead>Status</TableHead><TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((v) => (
              <TableRow key={v.id} className=\"border-white/5\" data-testid={`vehicle-row-${v.id}`}>
                <TableCell className=\"font-mono font-semibold\">{v.vehicle_number}</TableCell>
                <TableCell className=\"text-zinc-400\">{v.registration_number}</TableCell>
                <TableCell>{v.vehicle_type}</TableCell>
                <TableCell>{v.capacity}</TableCell>
                <TableCell>{v.current_fuel}% · {v.fuel_type}</TableCell>
                <TableCell><Badge className={STATUS_COLORS[v.status]}>{v.status}</Badge></TableCell>
                <TableCell>
                  <div className=\"flex gap-1\">
                    <Button size=\"sm\" variant=\"ghost\" onClick={() => openEdit(v)} data-testid={`vehicle-edit-${v.id}`}><Edit className=\"h-3.5 w-3.5\" /></Button>
                    <Button size=\"sm\" variant=\"ghost\" onClick={() => del(v.id)} className=\"text-red-400\" data-testid={`vehicle-delete-${v.id}`}><Trash2 className=\"h-3.5 w-3.5\" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>}
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className=\"border-white/10 bg-zinc-900\">
          <DialogHeader><DialogTitle>{editing ? \"Edit\" : \"Add\"} Vehicle</DialogTitle></DialogHeader>
          <div className=\"grid grid-cols-2 gap-4\">
            <div><Label>Vehicle Number</Label><Input value={form.vehicle_number} onChange={(e) => setForm({ ...form, vehicle_number: e.target.value })} data-testid=\"vf-number\" className=\"mt-1 bg-black/40\" /></div>
            <div><Label>Registration</Label><Input value={form.registration_number} onChange={(e) => setForm({ ...form, registration_number: e.target.value })} data-testid=\"vf-reg\" className=\"mt-1 bg-black/40\" /></div>
            <div><Label>Type</Label><Select value={form.vehicle_type} onValueChange={(v) => setForm({ ...form, vehicle_type: v })}><SelectTrigger className=\"mt-1 bg-black/40\" data-testid=\"vf-type\"><SelectValue /></SelectTrigger><SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
            <div><Label>Status</Label><Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}><SelectTrigger className=\"mt-1 bg-black/40\"><SelectValue /></SelectTrigger><SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
            <div><Label>Capacity</Label><Input type=\"number\" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} className=\"mt-1 bg-black/40\" /></div>
            <div><Label>Fuel Type</Label><Input value={form.fuel_type} onChange={(e) => setForm({ ...form, fuel_type: e.target.value })} className=\"mt-1 bg-black/40\" /></div>
            <div><Label>Current Fuel (%)</Label><Input type=\"number\" value={form.current_fuel} onChange={(e) => setForm({ ...form, current_fuel: Number(e.target.value) })} className=\"mt-1 bg-black/40\" /></div>
            <div><Label>Mileage (km/l)</Label><Input type=\"number\" value={form.mileage} onChange={(e) => setForm({ ...form, mileage: Number(e.target.value) })} className=\"mt-1 bg-black/40\" /></div>
          </div>
          <DialogFooter><Button onClick={save} className=\"bg-blue-600 hover:bg-blue-500\" data-testid=\"vf-save\">Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
