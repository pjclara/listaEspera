import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Calendar, CalendarClock, LayoutDashboard, PhoneCall, Stethoscope } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

type PrioridadeStat = {
    prioridade: string;
    total: number;
};

type AgendamentoItem = {
    id: number;
    estado: string;
    estado_cor?: string;
    waitingList?: { id: number; nome?: string | null; num_processo?: string | null } | null;
    slot?: { data: string; hora_inicio: string; sala: string; team?: { nome: string; cor?: string } | null } | null;
};

export default function Dashboard() {
    const { stats, porPrioridade, proximosAgendamentos } = usePage().props as unknown as {
        stats: { emEspera: number; agendados: number; porContactar: number; operadosMes: number };
        porPrioridade: PrioridadeStat[];
        proximosAgendamentos: AgendamentoItem[];
    };

    const maxPrioridade = Math.max(1, ...porPrioridade.map((p) => p.total));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <PageHeader
                    title="Visão geral"
                    description="Resumo em tempo real da atividade da lista de espera cirúrgica."
                    icon={<LayoutDashboard className="size-5" />}
                />

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard index={0} label="Em lista de espera" value={stats.emEspera.toLocaleString('pt-PT')} icon={CalendarClock} accent="primary" />
                    <StatCard index={1} label="Agendados" value={stats.agendados.toLocaleString('pt-PT')} icon={Calendar} accent="success" />
                    <StatCard index={2} label="Por contactar" value={stats.porContactar.toLocaleString('pt-PT')} icon={PhoneCall} accent="warning" />
                    <StatCard index={3} label="Operados este mês" value={stats.operadosMes.toLocaleString('pt-PT')} icon={Stethoscope} accent="destructive" />
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: 0.1 }}
                        className="rounded-2xl border border-border bg-card p-5 shadow-sm lg:col-span-2"
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-foreground">Próximos agendamentos</h2>
                            <Link href="/agenda/semana" className="text-primary text-xs font-medium hover:underline">
                                Ver agenda
                            </Link>
                        </div>

                        {proximosAgendamentos.length === 0 ? (
                            <EmptyState
                                icon={Calendar}
                                title="Sem agendamentos futuros"
                                description="Quando marcares cirurgias na agenda, elas aparecem aqui."
                            />
                        ) : (
                            <ul className="divide-y divide-border">
                                {proximosAgendamentos.map((item, idx) => (
                                    <motion.li
                                        key={item.id}
                                        initial={{ opacity: 0, x: -8 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.25, delay: idx * 0.05 }}
                                        className="flex items-center justify-between gap-4 py-3"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="bg-accent text-accent-foreground flex size-9 shrink-0 flex-col items-center justify-center rounded-lg text-xs font-semibold">
                                                {item.slot ? new Date(item.slot.data).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' }) : '—'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-foreground">
                                                    {item.waitingList?.nome ?? `Processo ${item.waitingList?.num_processo ?? '—'}`}
                                                </p>
                                                <p className="text-muted-foreground text-xs">
                                                    {item.slot?.hora_inicio?.slice(0, 5)} · Sala {item.slot?.sala} · {item.slot?.team?.nome ?? 'Equipa'}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-muted-foreground rounded-full border border-border px-2.5 py-1 text-xs font-medium">
                                            {item.estado}
                                        </span>
                                    </motion.li>
                                ))}
                            </ul>
                        )}
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: 0.15 }}
                        className="rounded-2xl border border-border bg-card p-5 shadow-sm"
                    >
                        <h2 className="mb-4 text-sm font-semibold text-foreground">Em espera por prioridade</h2>

                        {porPrioridade.length === 0 ? (
                            <EmptyState icon={CalendarClock} title="Sem dados de prioridade" />
                        ) : (
                            <div className="flex flex-col gap-3">
                                {porPrioridade.map((item, idx) => (
                                    <div key={item.prioridade}>
                                        <div className="mb-1 flex items-center justify-between text-xs">
                                            <span className="font-medium text-foreground">Prioridade {item.prioridade}</span>
                                            <span className="text-muted-foreground">{item.total}</span>
                                        </div>
                                        <div className="bg-muted h-2 overflow-hidden rounded-full">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(item.total / maxPrioridade) * 100}%` }}
                                                transition={{ duration: 0.5, delay: 0.2 + idx * 0.05, ease: 'easeOut' }}
                                                className="bg-primary h-full rounded-full"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </AppLayout>
    );
}
