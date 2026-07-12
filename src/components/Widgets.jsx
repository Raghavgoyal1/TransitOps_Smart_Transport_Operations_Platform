import { Card } from \"@/components/ui/card\";
import { Skeleton } from \"@/components/ui/skeleton\";

export function StatCard({ label, value, icon: Icon, trend, testId, accent = \"blue\" }) {
  const accentClass = {
    blue: \"text-blue-400 bg-blue-500/10\",
    emerald: \"text-emerald-400 bg-emerald-500/10\",
    amber: \"text-amber-400 bg-amber-500/10\",
    red: \"text-red-400 bg-red-500/10\",
    violet: \"text-violet-400 bg-violet-500/10\",
  }[accent];

  return (
    <Card className=\"group border-white/10 bg-white/[0.02] p-5 hover:bg-white/[0.04]\" data-testid={testId}>
      <div className=\"flex items-start justify-between\">
        <div>
          <div className=\"text-xs uppercase tracking-[0.15em] text-zinc-500\">{label}</div>
          <div className=\"mt-2 font-display text-3xl font-bold\">{value ?? <Skeleton className=\"h-8 w-16\" />}</div>
          {trend && <div className=\"mt-1 text-xs text-emerald-400\">{trend}</div>}
        </div>
        {Icon && <div className={`grid h-9 w-9 place-items-center rounded-md ${accentClass}`}><Icon className=\"h-4 w-4\" /></div>}
      </div>
    </Card>
  );
}

export function PageHeader({ title, subtitle, action, testId }) {
  return (
    <div className=\"mb-6 flex flex-wrap items-end justify-between gap-4\" data-testid={testId}>
      <div>
        <h1 className=\"font-display text-3xl font-bold tracking-tight\" data-testid=\"page-title\">{title}</h1>
        {subtitle && <p className=\"mt-1 text-sm text-zinc-500\">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ title, description, testId }) {
  return (
    <div className=\"rounded-lg border border-dashed border-white/10 bg-white/[0.02] p-12 text-center\" data-testid={testId || \"empty-state\"}>
      <div className=\"mx-auto font-display text-lg font-semibold text-zinc-300\">{title}</div>
      <div className=\"mt-2 text-sm text-zinc-500\">{description}</div>
    </div>
  );
}
