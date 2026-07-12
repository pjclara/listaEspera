import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { SlotModal } from '../Slots/SlotModal';
import { router } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Agenda Cirúrgica',
        href: '/agenda',
    },
];


export default function Agenda({ agenda, teamColors }:PropPageProps<{ agenda: Record<string, any[]>; teamColors: Record<number, string> }>) {
    const [slotModal, setSlotModal] = useState<any | null>(null);
    const { agenda: agendaAtualizada } = usePage().props as { agenda: Record<string, any[]> };
    const dias = Object.keys(agenda); // ["2026-07-06", "2026-07-07", ...]

    const openSlotModal = (slot: any) => {
        setSlotModal(slot);
    };

    const closeSlotModal = () => {
        setSlotModal(null);
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
        <div className="p-6">
            <h1 className="text-2xl font-semibold mb-6">Agenda Cirúrgica</h1>



            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {dias.map((dia) => (
                    <div key={dia} className="border rounded-xl p-4 shadow-sm bg-white">
                        <h2 className="text-lg font-semibold mb-3">{new Date(dia).toLocaleDateString()}</h2>

                        <div className="space-y-3">
                            {agenda[dia].map((slot) => {
                                const cheio = slot.ocupados >= slot.capacidade;
                                const parcial = slot.ocupados > 0 && slot.ocupados < slot.capacidade;

                                return (
                                    <div
                                        key={slot.id}
                                        className={`rounded-lg p-3 cursor-pointer border`}
                                        style={{ backgroundColor: teamColors[slot.team_id] + '20', borderColor: teamColors[slot.team_id] }}
                                        onClick={() => openSlotModal(slot)}
                                    >
                                        <div className="font-medium">
                                            {slot.hora_inicio} — {slot.hora_fim}
                                        </div>

                                        <div className="text-sm text-gray-600">
                                            Equipa: {slot.team.nome}
                                        </div>

                                        <div className="text-sm text-gray-600">
                                            Sala: {slot.sala || "—"}
                                        </div>

                                        <div className="text-sm font-semibold mt-1">
                                            Nº de cirurgias agendadas: {slot.schedules.length}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {slotModal && <SlotModal slot={slotModal} teamColors={teamColors} close={() => setSlotModal(null)} refreshSlot={refreshSlotModal} />}
        </div>
        </AppLayout>
    );
}
