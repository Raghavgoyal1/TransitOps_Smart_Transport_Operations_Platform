import { useEffect, useState } from \"react\";
import { api } from \"@/lib/api\";
import { PageHeader, EmptyState } from \"@/components/Widgets\";
import { Card } from \"@/components/ui/card\";
import { Badge } from \"@/components/ui/badge\";
import { MapPin, ArrowRight, Clock, Fuel } from \"lucide-react\";

export default function Routes_() {
  const [items, setItems] = useState([]);
  useEffect(() => { api.get(\"/routes\").then((r) => setItems(r.data)); }, []);

  return (
    <div className=\"space-y-6\">
      <PageHeader title=\"Routes\" subtitle={`${items.length} active routes`} testId=\"routes-header\" />
      {items.length === 0 ? <EmptyState title=\"No routes\" description=\"Create your first route\" /> :
      <div className=\"grid gap-4 md:grid-cols-2 lg:grid-cols-3\">
        {items.map((r) => (
          <Card key={r.id} className=\"border-white/10 bg-white/[0.02] p-5 hover:bg-white/[0.04]\" data-testid={`route-card-${r.id}`}>
            <div className=\"flex items-center gap-2 text-xs uppercase tracking-widest text-zinc-500\">
              <MapPin className=\"h-3 w-3\" /> Route
              <Badge className={
                r.traffic_level === \"Low\" ? \"ml-auto bg-emerald-500/20 text-emerald-400\" :
                r.traffic_level === \"Medium\" ? \"ml-auto bg-amber-500/20 text-amber-400\" :
                \"ml-auto bg-red-500/20 text-red-400\"
              }>{r.traffic_level} traffic</Badge>
            </div>
            <div className=\"mt-3 font-display text-lg font-semibold\">{r.name}</div>
            <div className=\"mt-3 flex items-center gap-2 text-sm text-zinc-400\">
              <span>{r.start_point}</span>
              <ArrowRight className=\"h-3 w-3\" />
              <span>{r.destination}</span>
            </div>
            <div className=\"mt-4 grid grid-cols-3 gap-3 border-t border-white/5 pt-4\">
              <div>
                <div className=\"text-xs text-zinc-500\">Distance</div>
                <div className=\"font-mono text-sm\">{r.distance_km} km</div>
              </div>
              <div>
                <div className=\"text-xs text-zinc-500 flex items-center gap-1\"><Clock className=\"h-3 w-3\" /> Time</div>
                <div className=\"font-mono text-sm\">{r.travel_time_min}m</div>
              </div>
              <div>
                <div className=\"text-xs text-zinc-500 flex items-center gap-1\"><Fuel className=\"h-3 w-3\" /> Fuel</div>
                <div className=\"font-mono text-sm\">{r.fuel_estimate}L</div>
              </div>
            </div>
            {r.stops?.length > 0 && (
              <div className=\"mt-3 flex flex-wrap gap-1\">
                {r.stops.map((s, i) => <Badge key={i} variant=\"outline\" className=\"text-[10px]\">{s.name}</Badge>)}
              </div>
            )}
          </Card>
        ))}
      </div>}
    </div>
  );
}
