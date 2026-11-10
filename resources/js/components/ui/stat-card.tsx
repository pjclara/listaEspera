import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { LucideIcon, TrendingDown, TrendingUp } from 'lucide-react';

interface StatCardProps {
    label: string;
    value: string | number;
    icon: LucideIcon;
    trend?: { value: string; direction: 'up' | 'down' };
    accent?: 'primary' | 'success' | 'warning' | 'destructive';
    index?: number;
}

const accentStyles: Record<NonNullable<StatCardProps['accent']>, string> = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    destructive: 'bg-destructive/10 text-destructive',
};

export function StatCard({ label, value, icon: Icon, trend, accent = 'primary', index = 0 }: StatCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.06, ease: 'easeOut' }}
            whileHover={{ y: -2 }}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-muted-foreground text-sm font-medium">{label}</p>
                    <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">{value}</p>
                </div>
                <div className={cn('flex size-10 items-center justify-center rounded-xl', accentStyles[accent])}>
                    <Icon className="size-5" />
                </div>
            </div>

            {trend && (
                <div className="mt-4 flex items-center gap-1 text-xs font-medium">
                    {trend.direction === 'up' ? (
                        <TrendingUp className="size-3.5 text-success" />
                    ) : (
                        <TrendingDown className="size-3.5 text-destructive" />
                    )}
                    <span className={trend.direction === 'up' ? 'text-success' : 'text-destructive'}>{trend.value}</span>
                    <span className="text-muted-foreground">vs. mês anterior</span>
                </div>
            )}

            <div
                className={cn(
                    'pointer-events-none absolute -right-6 -bottom-6 size-24 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-20',
                    accent === 'primary' && 'bg-primary',
                    accent === 'success' && 'bg-success',
                    accent === 'warning' && 'bg-warning',
                    accent === 'destructive' && 'bg-destructive',
                )}
            />
        </motion.div>
    );
}
