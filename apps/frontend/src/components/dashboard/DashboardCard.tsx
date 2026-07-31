import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  value: number | string;
  description: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  colorScheme?: 'emerald' | 'blue' | 'purple' | 'amber' | 'rose' | 'slate';
}

const schemes = {
  emerald: {
    bg: 'bg-emerald-50',
    icon: 'bg-emerald-500',
    text: 'text-emerald-600',
    trend: 'text-emerald-600 bg-emerald-50',
    border: 'border-emerald-100',
  },
  blue: {
    bg: 'bg-blue-50',
    icon: 'bg-blue-500',
    text: 'text-blue-600',
    trend: 'text-blue-600 bg-blue-50',
    border: 'border-blue-100',
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'bg-purple-500',
    text: 'text-purple-600',
    trend: 'text-purple-600 bg-purple-50',
    border: 'border-purple-100',
  },
  amber: {
    bg: 'bg-amber-50',
    icon: 'bg-amber-500',
    text: 'text-amber-600',
    trend: 'text-amber-600 bg-amber-50',
    border: 'border-amber-100',
  },
  rose: {
    bg: 'bg-rose-50',
    icon: 'bg-rose-500',
    text: 'text-rose-600',
    trend: 'text-rose-600 bg-rose-50',
    border: 'border-rose-100',
  },
  slate: {
    bg: 'bg-slate-50',
    icon: 'bg-slate-500',
    text: 'text-slate-600',
    trend: 'text-slate-600 bg-slate-50',
    border: 'border-slate-100',
  },
};

export function DashboardCard({
  title,
  value,
  description,
  icon: Icon,
  trend = 'neutral',
  trendValue,
  colorScheme = 'emerald',
}: DashboardCardProps) {
  const s = schemes[colorScheme];
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  return (
    <div className={`bg-white rounded-2xl border ${s.border} p-5 hover:shadow-md transition-all duration-200 group`}>
      {/* Top row */}
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl ${s.icon} flex items-center justify-center shadow-sm`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trendValue && (
          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg ${s.trend}`}>
            <TrendIcon className="w-3 h-3" />
            {trendValue}
          </span>
        )}
      </div>

      {/* Value */}
      <div className="text-3xl font-extrabold text-slate-900 tabular-nums mb-1">
        {value}
      </div>

      {/* Title */}
      <div className="text-sm font-semibold text-slate-700 mb-0.5">{title}</div>

      {/* Description */}
      <div className="text-xs text-slate-500">{description}</div>
    </div>
  );
}
