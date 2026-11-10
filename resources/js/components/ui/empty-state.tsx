import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description?: string;
    action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border px-6 py-16 text-center"
        >
            <div className="bg-muted text-muted-foreground flex size-12 items-center justify-center rounded-full">
                <Icon className="size-5" />
            </div>
            <div>
                <p className="text-sm font-medium text-foreground">{title}</p>
                {description && <p className="text-muted-foreground mt-1 max-w-sm text-sm">{description}</p>}
            </div>
            {action}
        </motion.div>
    );
}
