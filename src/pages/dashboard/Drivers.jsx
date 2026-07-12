import { useEffect, useState } from \"react\";
import { api } from \"@/lib/api\";
import { PageHeader, EmptyState } from \"@/components/Widgets\";
import { Card } from \"@/components/ui/card\";
import { Button } from \"@/components/ui/button\";
import { Input } from \"@/components/ui/input\";
import { Badge } from \"@/components/ui/badge\";
import { Table, TableHead, TableRow, TableHeader, TableBody, TableCell } from \"@/components/ui/table\";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from \"@/components/ui/select\";
import { Search, Star } from \"lucide-react\";

const STATUS_COLORS = {
  Available: \"bg-emerald-500/20 text-emerald-400\",
  Driving: \"bg-blue-500/20 text-blue-400\",
  Leave: \"bg-amber-500/20 text-amber-400\",
  Suspended: \"bg-red-500/20 text-red-400\",
};

export default function Drivers() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState(\"\");
  const [status, setStatus] = useState(\"all\");

  useEffect(() => { api.get(\"/drivers\").then((r) => setItems(r.data)); }, []);

  const filtered = items.filter((d) =>
    (status === \"all\" || d.status === status) &&
    (q === \"\" || d.name.toLowerCase().includes(q.toLowerCase()) || d.license_number.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div className=\"space-y-6\">
      <PageHeader title=\"Drivers\" subtitle={`${items.length} drivers registered`} testId=\"drivers-header\" />

      <Card className=\"border-white/10 bg-white/[0.02] p-4\">
        <div className=\"flex flex-wrap gap-3\">
          <div className=\"relative flex-1\">
            <Search className=\"absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500\" />
            <Input placeholder=\"Search drivers...\" value={q} onChange={(e) => setQ(e.target.value)} className=\"border-white/10 bg-black/40 pl-9\" data-testid=\"driver-search\" />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className=\"w-40 border-white/10 bg-black/40\"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value=\"all\">All</SelectItem>
              <SelectItem value=\"Available\">Available</SelectItem>
              <SelectItem value=\"Driving\">Driving</SelectItem>
              <SelectItem value=\"Leave\">Leave</SelectItem>
              <SelectItem value=\"Suspended\">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card className=\"overflow-hidden border-white/10 bg-white/[0.02]\">
        {filtered.length === 0 ? <EmptyState title=\"No drivers\" description=\"Try adjusting filters\" /> :
        <Table>
          <TableHeader>
            <TableRow className=\"border-white/5 hover:bg-transparent\">
              <TableHead>Name</TableHead><TableHead>License</TableHead><TableHead>Experience</TableHead>
              <TableHead>Score</TableHead><TableHead>Status</TableHead><TableHead>Contact</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.slice(0, 100).map((d) => (
              <TableRow key={d.id} className=\"border-white/5\" data-testid={`driver-row-${d.id}`}>
                <TableCell>
                  <div className=\"flex items-center gap-3\">
                    <div className=\"grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 text-xs font-semibold\">{d.name.split(\" \").map((s) => s[0]).slice(0, 2).join(\"\")}</div>
                    <div>
                      <div className=\"font-semibold\">{d.name}</div>
                      <div className=\"text-xs text-zinc-500\">{d.age}y · {d.gender}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className=\"font-mono text-xs\">{d.license_number}</TableCell>
                <TableCell>{d.experience_years}y</TableCell>
                <TableCell>
                  <div className=\"flex items-center gap-1\"><Star className=\"h-3.5 w-3.5 fill-amber-400 text-amber-400\" /> {d.driving_score}</div>
                </TableCell>
                <TableCell><Badge className={STATUS_COLORS[d.status]}>{d.status}</Badge></TableCell>
                <TableCell className=\"text-xs text-zinc-400\">{d.phone}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>}
      </Card>
    </div>
  );
}
