import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { SlotModal } from '../Slots/SlotModal';

export default function Mensal({
    agenda,
    month,
    start,
    end,
    teamColors,
}: ProsPageProps<{ agenda: Record<string, any[]>; month: string; start: string; end: string; teamColors: Record<number, string> }>) {
    const [slotModal, setSlotModal] = useState(null);

    // normalizar chaves do backend
    const agendaNormalizada: Record<string, any[]> = {};
    Object.keys(agenda).forEach((key) => {
        agendaNormalizada[key.slice(0, 10)] = agenda[key];
    });

    // gerar dias do calendário
    const startDate = new Date(start);
    const endDate = new Date(end);

    const dias = [];
    let d = new Date(startDate);

    while (d <= endDate) {
        const dataStr = d.toISOString().slice(0, 10); // formato correto
        dias.push({
            data: dataStr,
            diaMes: d.getDate(),
            mesAtual: d.getMonth() === new Date(month).getMonth(),
        });
        d.setDate(d.getDate() + 1);
    }

    function mudarMes(offset: number) {
        const novaData = new Date(month);
        if (offset === 0) {
            router.get('/agenda/mensal', {
                month: new Date().toISOString().slice(0, 10),
            });
            return;
        }
        novaData.setMonth(novaData.getMonth() + offset);

        router.get('/agenda/mensal', {
            month: novaData.toISOString().slice(0, 10),
        });
    }

    return (
        <AppLayout breadcrumbs={[{ title: 'Agenda Cirúrgica', href: '/agenda' }]}>
            <Head title="Agenda Cirúrgica - Mês" />
            <div className="p-6">
                {/* Navegação */}
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">
                        {new Date(month).toLocaleDateString('pt-PT', {
                            month: 'long',
                            year: 'numeric',
                        })}
                    </h1>

                    <div className="flex gap-3">
                        <button onClick={() => mudarMes(-1)} className="rounded bg-gray-200 px-4 py-2 hover:bg-gray-300">
                            Mês anterior
                        </button>

                        <button onClick={() => mudarMes(0)} className="rounded bg-gray-200 px-4 py-2 hover:bg-gray-300">
                            Hoje
                        </button>

                        <button onClick={() => mudarMes(1)} className="rounded bg-gray-200 px-4 py-2 hover:bg-gray-300">
                            Próximo mês
                        </button>
                    </div>
                </div>

                {/* Cabeçalho */}
                <div className="mb-2 grid grid-cols-7 text-center font-semibold">
                    <div>Seg</div>
                    <div>Ter</div>
                    <div>Qua</div>
                    <div>Qui</div>
                    <div>Sex</div>
                    <div>Sáb</div>
                    <div>Dom</div>
                </div>

                {/* Grelha mensal */}
                <div className="grid grid-cols-7 gap-2">
                    {dias.map(({ data, diaMes, mesAtual }) => {
                        const slotsDoDia = agendaNormalizada[data] ?? [];

                        return (
                            <div key={data} className={`min-h-[120px] rounded-xl border bg-white p-2 ${mesAtual ? '' : 'opacity-40'}`}>
                                <div className="mb-1 text-sm font-semibold">{diaMes}</div>

                                <div className="space-y-1">
                                    {slotsDoDia.map((slot) => {
                                        const cheio = slot.schedules.length >= slot.capacidade;
                                        const parcial = slot.schedules.length > 0 && slot.schedules.length < slot.capacidade;

                                        return (
                                            <div
                                                key={slot.id}
                                                className="cursor-pointer rounded border p-1 text-xs"
                                                style={{ backgroundColor: slot.team.cor + '10', borderColor: slot.team.cor }}
                                                onClick={() => setSlotModal(slot)}
                                            >
                                                {slot.hora_inicio} — {slot.hora_fim}
                                                <br />
                                                {slot.team.nome}
                                                <br />
                                                <div className="mt-1 font-semibold">Nº de cirurgias: {slot.schedules.length}</div>
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
