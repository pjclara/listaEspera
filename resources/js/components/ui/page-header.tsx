import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface PageHeaderProps {
    title: string;
    description?: string;
    icon?: ReactNode;
    actions?: ReactNode;
}

export function PageHeader({ title, description, icon, actions }: PageHeaderProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
            <div className="flex items-start gap-3">
                {icon && (
                    <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl">{icon}</div>
                )}
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
                    {description && <p className="text-muted-foreground mt-0.5 text-sm">{description}</p>}
                </div>
            </div>

            {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </motion.div>
    );
}
