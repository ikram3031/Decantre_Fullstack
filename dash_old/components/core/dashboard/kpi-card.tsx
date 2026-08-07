import { Card, CardContent, CardHeader, CardTitle } from '@/components/core/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/core/utils';

interface KpiCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend: string;
  trendDirection: 'up' | 'down' | 'neutral';
}

export function KpiCard({ title, value, icon: Icon, trend, trendDirection }: KpiCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p
          className={cn(
            'text-xs mt-1',
            trendDirection === 'up' && 'text-emerald-500',
            trendDirection === 'down' && 'text-destructive',
            trendDirection === 'neutral' && 'text-muted-foreground'
          )}
        >
          {trendDirection === 'up' ? '+' : trendDirection === 'down' ? '-' : ''}
          {trend} from last month
        </p>
      </CardContent>
    </Card>
  );
}
