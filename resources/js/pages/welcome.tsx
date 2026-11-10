import type { SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowRight, Stethoscope } from 'lucide-react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="CirurFlow" />

            <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6 text-foreground">
                <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,hsl(243_75%_59%/0.12),transparent_60%)]" />

                <motion.div
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="mb-8 flex flex-col items-center text-center"
                >
                    <div className="bg-primary text-primary-foreground mb-4 flex size-12 items-center justify-center rounded-2xl shadow-lg shadow-primary/30">
                        <Stethoscope className="size-6" />
                    </div>
                    <h1 className="text-4xl font-semibold tracking-tight">CirurFlow</h1>
                    <p className="text-muted-foreground mt-2 text-sm">Gestão inteligente da lista de espera cirúrgica</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 12, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
                    className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-xl shadow-black/5"
                >
                    <h2 className="mb-2 text-lg font-semibold">Bem-vindo</h2>

                    <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
                        Acompanhe, filtre, exporte e analise toda a informação da lista de espera cirúrgica com rapidez e precisão.
                    </p>

                    <div className="flex flex-col gap-3">
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="bg-primary text-primary-foreground inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-center text-sm font-medium shadow-sm transition hover:bg-primary/90 hover:shadow"
                            >
                                Ir para o Dashboard
                                <ArrowRight className="size-4" />
                            </Link>
                        ) : (
                            <Link
                                href={route('login')}
                                className="border-input bg-background hover:bg-accent inline-flex items-center justify-center rounded-lg border px-4 py-2.5 text-center text-sm font-medium transition"
                            >
                                Iniciar sessão
                            </Link>
                        )}
                    </div>
                </motion.div>

                <footer className="text-muted-foreground mt-10 text-xs">
                    © {new Date().getFullYear()} SurgTuga. Todos os direitos reservados.
                </footer>
            </div>
        </>
    );
}
