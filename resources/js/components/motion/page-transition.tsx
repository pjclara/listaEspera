import { usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { ReactNode } from 'react';

export function PageTransition({ children }: { children: ReactNode }) {
    const { url } = usePage();

    return (
        <AnimatePresence mode="wait" initial={false}>
            <motion.div
                key={url}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}
