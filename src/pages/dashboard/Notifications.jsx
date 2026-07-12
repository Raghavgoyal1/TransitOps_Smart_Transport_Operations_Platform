import { useEffect, useState } from \"react\";
import { api } from \"@/lib/api\";
import { PageHeader, EmptyState } from \"@/components/Widgets\";
import { Card } from \"@/components/ui/card\";
import { Button } from \"@/components/ui/button\";
import { Badge } from \"@/components/ui/badge\";
import { CheckCheck, Bell } from \"lucide-react\";

const TYPE_COLORS = {
  info: \"bg-blue-500/20 text-blue-400\",
  success: \"bg-emerald-500/20 text-emerald-400\",
  warning: \"bg-amber-500/20 text-amber-400\",
  error: \"bg-red-500/20 text-red-400\",
};

export default function Notifications() {
  const [items, setItems] = useState([]);

  const load = () => api.get(\"/notifications\").then((r) => setItems(r.data));
  useEffect(() => { load(); }, []);

  const markAll = async () => { await api.post(\"/notifications/read-all\"); load(); };
  const markOne = async (id) => { await api.post(`/notifications/${id}/read`); load(); };

  const unread = items.filter((n) => !n.read).length;

  return (
    <div className=\"space-y-6\">
      <PageHeader title=\"Notifications\" subtitle={`${unread} unread`} testId=\"notif-header\"
        action={<Button onClick={markAll} variant=\"outline\" className=\"border-white/20\" data-testid=\"notif-read-all\"><CheckCheck className=\"mr-2 h-4 w-4\" /> Mark all read</Button>}
      />

      {items.length === 0 ? <EmptyState title=\"All caught up\" description=\"No notifications right now\" /> :
      <div className=\"space-y-2\">
        {items.map((n) => (
          <Card key={n.id} className={`border-white/10 p-4 ${n.read ? \"bg-white/[0.02]\" : \"bg-blue-500/[0.05] border-blue-500/20\"}`} data-testid={`notif-${n.id}`}>
            <div className=\"flex items-start gap-3\">
              <div className=\"grid h-9 w-9 place-items-center rounded-md bg-white/5\"><Bell className=\"h-4 w-4\" /></div>
              <div className=\"flex-1\">
                <div className=\"flex items-center gap-2\">
                  <div className=\"font-semibold\">{n.title}</div>
                  <Badge className={TYPE_COLORS[n.type]}>{n.type}</Badge>
                  <Badge variant=\"outline\" className=\"text-[10px]\">{n.category}</Badge>
                  {!n.read && <span className=\"ml-auto h-2 w-2 rounded-full bg-blue-500 animate-pulse\" />}
                </div>
                <div className=\"mt-1 text-sm text-zinc-400\">{n.message}</div>
                <div className=\"mt-2 flex items-center justify-between\">
                  <div className=\"text-xs text-zinc-600\">{new Date(n.created_at).toLocaleString()}</div>
                  {!n.read && <button onClick={() => markOne(n.id)} className=\"text-xs text-blue-400 hover:underline\" data-testid={`notif-read-${n.id}`}>Mark as read</button>}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>}
    </div>
  );
}
