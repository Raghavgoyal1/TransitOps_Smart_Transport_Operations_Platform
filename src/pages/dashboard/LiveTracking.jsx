import { useEffect, useState, useRef } from \"react\";
import { api } from \"@/lib/api\";
import { PageHeader, EmptyState } from \"@/components/Widgets\";
import { Card } from \"@/components/ui/card\";
import { Badge } from \"@/components/ui/badge\";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from \"react-leaflet\";
import L from \"leaflet\";
import { Truck, Gauge, Clock, MapPin } from \"lucide-react\";

// Fix leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: \"https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png\",
  iconUrl: \"https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png\",
  shadowUrl: \"https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png\",
});

const pulseIcon = L.divIcon({
  className: \"\",
  html: `<div class=\"pulse-marker\"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const startIcon = L.divIcon({
  className: \"\",
  html: `<div class=\"pulse-marker-blue\"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

export default function LiveTracking() {
  const [tracks, setTracks] = useState([]);
  const [selected, setSelected] = useState(null);
  const timerRef = useRef(null);

  const load = async () => {
    try {
      const { data } = await api.get(\"/tracking/live\");
      setTracks(data);
      if (!selected && data.length) setSelected(data[0].trip_id);
    } catch {}
  };

  useEffect(() => {
    load();
    timerRef.current = setInterval(load, 3000);
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line
  }, []);

  const center = tracks[0]?.position ? [tracks[0].position.lat, tracks[0].position.lng] : [40.7128, -74.006];
  const selectedTrack = tracks.find((t) => t.trip_id === selected);

  return (
    <div className=\"space-y-6\">
      <PageHeader title=\"Live Tracking\" subtitle={`${tracks.length} vehicles in motion`} testId=\"tracking-header\" />

      {tracks.length === 0 ? (
        <EmptyState title=\"No vehicles running\" description=\"Start a scheduled trip to see live tracking\" />
      ) : (
        <div className=\"grid gap-4 lg:grid-cols-4\">
          <Card className=\"overflow-hidden border-white/10 bg-white/[0.02] p-0 lg:col-span-3\" data-testid=\"tracking-map\">
            <div className=\"h-[600px] w-full\">
              <MapContainer center={center} zoom={11} scrollWheelZoom style={{ height: \"100%\", width: \"100%\" }}>
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors &copy; CARTO'
                  url=\"https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png\"
                />
                {tracks.map((t) => (
                  <Marker key={t.trip_id} position={[t.position.lat, t.position.lng]} icon={pulseIcon} eventHandlers={{ click: () => setSelected(t.trip_id) }}>
                    <Popup>
                      <div className=\"text-sm\">
                        <div className=\"font-semibold\">{t.vehicle.number}</div>
                        <div className=\"text-xs\">{t.driver.name}</div>
                        <div className=\"mt-1 text-xs\">{t.speed} km/h · ETA {t.eta_min}m</div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
                {tracks.map((t) => (
                  <Marker key={`s-${t.trip_id}`} position={[t.start_coords.lat, t.start_coords.lng]} icon={startIcon} />
                ))}
                {tracks.map((t) => (
                  <Polyline key={`l-${t.trip_id}`} positions={[[t.start_coords.lat, t.start_coords.lng], [t.end_coords.lat, t.end_coords.lng]]} pathOptions={{ color: t.trip_id === selected ? \"#10b981\" : \"#2563eb\", weight: 2, opacity: 0.6 }} />
                ))}
              </MapContainer>
            </div>
          </Card>

          <div className=\"space-y-3\">
            {tracks.map((t) => (
              <Card
                key={t.trip_id}
                className={`cursor-pointer border-white/10 p-4 transition-colors ${t.trip_id === selected ? \"bg-blue-500/10 border-blue-500/40\" : \"bg-white/[0.02] hover:bg-white/[0.04]\"}`}
                onClick={() => setSelected(t.trip_id)}
                data-testid={`tracking-card-${t.trip_id}`}
              >
                <div className=\"flex items-start justify-between\">
                  <div>
                    <div className=\"flex items-center gap-2 text-xs text-zinc-500\"><Truck className=\"h-3 w-3\" /> {t.vehicle.number}</div>
                    <div className=\"mt-1 font-mono text-xs text-zinc-400\">{t.trip_code}</div>
                  </div>
                  <Badge className=\"bg-emerald-500/20 text-emerald-400 animate-pulse\">LIVE</Badge>
                </div>
                <div className=\"mt-3 text-sm font-semibold truncate\">{t.route.name}</div>
                <div className=\"mt-3 grid grid-cols-3 gap-2 text-xs\">
                  <div><div className=\"text-zinc-500 flex items-center gap-1\"><Gauge className=\"h-3 w-3\" /></div><div className=\"font-mono\">{t.speed} km/h</div></div>
                  <div><div className=\"text-zinc-500 flex items-center gap-1\"><Clock className=\"h-3 w-3\" /></div><div className=\"font-mono\">{t.eta_min}m</div></div>
                  <div><div className=\"text-zinc-500 flex items-center gap-1\"><MapPin className=\"h-3 w-3\" /></div><div className=\"font-mono\">{t.progress}%</div></div>
                </div>
                <div className=\"mt-2 h-1 rounded-full bg-white/10 overflow-hidden\">
                  <div className=\"h-full bg-emerald-500 transition-all duration-500\" style={{ width: `${t.progress}%` }} />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
