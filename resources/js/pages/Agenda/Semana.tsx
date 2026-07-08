import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { SlotModal } from '../Slots/SlotModal';

export default function Semana({ agenda, start, end, teamColors }: ProsPageProps<{ agenda: Record<string, any[]>; start: string; end: string; teamColors: Record<number, string> }>) {
    const [slotModal, setSlotModal] = useState(null);

    const diasSemana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];

    const datas = Object.keys(agenda); // ["2026-07-06", ...]

    function mudarSemana(offset: number) {
        if (offset === 0) {
            router.get('/agenda/semana', { start: new Date().toISOString().slice(0, 10) });
            return;
        }
        const novaData = new Date(start);
        novaData.setDate(novaData.getDate() + offset * 7);

        router.get('/agenda/semana', { start: novaData.toISOString().slice(0, 10) });
    }

    return (
        <AppLayout breadcrumbs={[{ title: 'Agenda Cirúrgica', href: '/agenda' }]}>
            <Head title="Agenda Cirúrgica - Semana" />
            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">

                    <h1 className="text-2xl font-semibold">
                        Semana {start} → {end}
                    </h1>

                    <div className="flex gap-3">
                        <button onClick={() => mudarSemana(-1)} className="rounded bg-gray-200 px-4 py-2 hover:bg-gray-300">
                            Semana anterior
                        </button>

                        <button onClick={() => mudarSemana(0)} className="rounded bg-gray-200 px-4 py-2 hover:bg-gray-300">
                            Hoje
                        </button>

                        <button onClick={() => mudarSemana(1)} className="rounded bg-gray-200 px-4 py-2 hover:bg-gray-300">
                            Próxima semana
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-5 gap-4">
                    {diasSemana.map((diaNome, index) => {
                        const data = datas[index];

                        return (
                            <div key={diaNome} className="rounded-xl border bg-white p-3 shadow-sm">
                                <h2 className="mb-3 text-lg font-semibold">
                                    {diaNome}
                                    <br />
                                    <span className="text-sm text-gray-600">{data ? new Date(data).toLocaleDateString() : ''}</span>
                                </h2>

                                <div className="space-y-3">
                                    {data &&
                                        agenda[data].map((slot) => {
                                            const cheio = slot.ocupados >= slot.capacidade;
                                            const parcial = slot.ocupados > 0 && slot.ocupados < slot.capacidade;

                                            return (
                                                <div
                                                    key={slot.id}
                                                    className="cursor-pointer rounded-lg border p-3"
                                                    style={{
                                                        backgroundColor: teamColors[slot.team_id] + '20',
                                                        borderColor: teamColors[slot.team_id],
                                                    }}
                                                    onClick={() => setSlotModal(slot)}
                                                >
                                                    <div className="font-medium">
                                                        {slot.hora_inicio} — {slot.hora_fim}
                                                    </div>

                                                    <div className="text-sm text-gray-600">Equipa: {slot.team.nome}</div>

                                                    <div className="text-sm text-gray-600">Sala: {slot.sala || '—'}</div>

                                                    <div className="mt-1 text-sm font-semibold">
                                                        Nº de cirurgias agendadas: {slot.schedules.length}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {slotModal && <SlotModal slot={slotModal} teamColors={teamColors} close={() => setSlotModal(null)} />}
            </div>
        </AppLayout>
    );
}
