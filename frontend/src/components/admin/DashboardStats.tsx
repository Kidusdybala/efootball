interface Stat {
  label: string;
  value: number;
  color: string;
}

interface DashboardStatsProps {
  stats: Stat[];
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
      {stats.map((stat, index) => (
        <div key={index} className="glass-card p-3 sm:p-4">
          <p className="text-muted-foreground text-sm mb-1">{stat.label}</p>
          <p className={`font-display text-3xl font-bold ${stat.color}`}>
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}