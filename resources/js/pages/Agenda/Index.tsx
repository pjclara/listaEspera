import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { CalendarRange } from 'lucide-react';
import { useState } from 'react';
import { SlotModal } from '../Slots/SlotModal';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Agenda Cirúrgica',
        href: '/agenda',
    },
];

export default function Agenda({ agenda, teamColors }: PropPageProps<{ agenda: Record<string, any[]>; teamColors: Record<number, string> }>) {
    const [slotModal, setSlotModal] = useState<any | null>(null);
    const { agenda: agendaAtualizada } = usePage().props as { agenda: Record<string, any[]> };
    const dias = Object.keys(agenda); // ["2026-07-06", "2026-07-07", ...]

    const openSlotModal = (slot: any) => {
        setSlotModal(slot);
    };

    const refreshSlotModal = () => {
        if (!slotModal) return;

        const updatedSlot = Object.values(agendaAtualizada)
            .flat()
            .find((s: any) => s.id === slotModal.id);

        if (updatedSlot) {
            setSlotModal(updatedSlot);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Agenda Cirúrgica" />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <PageHeader title="Agenda Cirúrgica" description="Vista rápida dos próximos slots disponíveis." icon={<CalendarRange className="size-5" />} />

                {dias.length === 0 ? (
                    <EmptyState icon={CalendarRange} title="Sem slots agendados" description="Ainda não existem slots próximos para mostrar." />
                ) : (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        {dias.map((dia, diaIdx) => (
                            <motion.div
                                key={dia}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: diaIdx * 0.05 }}
                                className="rounded-xl border border-border bg-card p-4 shadow-sm"
                            >
                                <h2 className="mb-3 text-lg font-semibold text-foreground">{new Date(dia).toLocaleDateString()}</h2>

                                <div className="space-y-3">
                                    {agenda[dia].map((slot) => (
                                        <div
                                            key={slot.id}
                                            className="cursor-pointer rounded-lg border p-3 transition-transform hover:-translate-y-0.5"
                                            style={{ backgroundColor: teamColors[slot.team_id] + '20', borderColor: teamColors[slot.team_id] }}
                                            onClick={() => openSlotModal(slot)}
                                        >
                                            <div className="font-medium text-foreground">
                                                {slot.hora_inicio} — {slot.hora_fim}
                                            </div>

                                            <div className="text-muted-foreground text-sm">Equipa: {slot.team.nome}</div>

                                            <div className="text-muted-foreground text-sm">Sala: {slot.sala || '—'}</div>

                                            <div className="mt-1 text-sm font-semibold text-foreground">
                                                Nº de cirurgias agendadas: {slot.schedules.length}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {slotModal && <SlotModal slot={slotModal} teamColors={teamColors} close={() => setSlotModal(null)} refreshSlot={refreshSlotModal} />}
            </div>
        </AppLayout>
    );
}
