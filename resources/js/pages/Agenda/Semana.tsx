import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { SlotModal } from '../Slots/SlotModal';

type AgendaSlot = {
    id: number;
    team_id: number;
    hora_inicio: string;
    hora_fim: string;
    sala?: string | null;
    team: { nome: string, cor: string };
    schedules: Array<unknown>;
};

type SemanaPageProps = {
    agenda: Record<string, AgendaSlot[]>;
    start: string;
    end: string;
    teamColors: Record<number, string>;
};

function parseYmdLocal(ymd: string): Date {
    const [year, month, day] = ymd.split('-').map(Number);

    // Meio-dia para evitar transições DST à meia-noite
    return new Date(year, month - 1, day, 12, 0, 0, 0);
}

function formatYmdLocal(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

export default function Semana({ agenda, start, end, teamColors }: SemanaPageProps) {
    const [slotModal, setSlotModal] = useState<AgendaSlot | null>(null);

    const diasSemana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];

    // ORDENAR AS DATAS
    const datasOrdenadas = Object.keys(agenda).sort((a, b) => parseYmdLocal(a).getTime() - parseYmdLocal(b).getTime());

    // MAPEAR PELO DIA REAL DA SEMANA (Seg=1 ... Sex=5)
    const mapaDias: Record<string, string | null> = {
        Segunda: null,
        Terça: null,
        Quarta: null,
        Quinta: null,
        Sexta: null,
    };

    for (const data of datasOrdenadas) {
        const weekday = parseYmdLocal(data).getDay();

        if (weekday >= 1 && weekday <= 5) {
            mapaDias[diasSemana[weekday - 1]] = data;
        }
    }

    function mudarSemana(offset: number) {
        if (offset === 0) {
            router.get('/agenda/semana', {
                start: formatYmdLocal(new Date()),
            });
            return;
        }

        const novaData = parseYmdLocal(start);
        novaData.setDate(novaData.getDate() + offset * 7);

        router.get('/agenda/semana', {
            start: formatYmdLocal(novaData),
        });
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
                    {diasSemana.map((diaNome) => {
                        const data = mapaDias[diaNome];

                        return (
                            <div key={diaNome} className="rounded-xl border bg-white p-3 shadow-sm">
                                <h2 className="mb-3 text-lg font-semibold">
                                    {diaNome}
                                    <br />
                                    <span className="text-sm text-gray-600">{data ? parseYmdLocal(data).toLocaleDateString('pt-PT') : ''}</span>
                                </h2>

                                <div className="space-y-3">
                                    {data &&
                                        agenda[data]?.map((slot: AgendaSlot) => (
                                            <div
                                                key={slot.id}
                                                className="cursor-pointer rounded-lg border p-3"
                                                style={{
                                                    backgroundColor: slot.team.cor + '20',
                                                    borderColor: slot.team.cor,
                                                }}
                                                onClick={() => setSlotModal(slot)}
                                            >
                                                <div className="font-medium">
                                                    {slot.hora_inicio} — {slot.hora_fim}
                                                </div>

                                                <div className="text-sm text-gray-600">Equipa: {slot.team.nome}</div>

                                                <div className="text-sm text-gray-600">Sala: {slot.sala || '—'}</div>

                                                <div className="mt-1 text-sm font-semibold">Nº de cirurgias agendadas: {slot.schedules.length}</div>
                                                {slot.schedules.length > 0 && (
                                                    <div className="mt-2 space-y-2">
                                                        {slot.schedules.map((sch: any) => (
                                                            <div key={sch.id} className={`rounded border border-${sch.estado_cor} ${sch.estado_cor} px-3 py-2`}>
                                                                <div className="text-sm font-medium">Doente: {sch.waiting_list?.num_processo}</div>

                                                                <div className="text-xs text-gray-600">{sch.waiting_list?.des_diagnostico}</div>

                                                                <div className="mt-1 text-xs text-gray-700">Estado: {sch.estado}</div>

                                                                <div className="text-xs text-gray-700">Duração: {sch.duracao_estimada} min</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
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
