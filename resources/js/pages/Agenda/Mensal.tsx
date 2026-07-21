import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { SlotModal } from '../Slots/SlotModal';

export default function Mensal({
    agenda,
    month,
    start,
    end,
    teamColors,
    teams,
}: {
    agenda: Record<string, any[]>;
    month: string;
    start: string;
    end: string;
    teamColors: Record<number, string>;
    teams: { id: number; nome: string; cor: string }[];
}) {
    const [slotModal, setSlotModal] = useState<any | null>(null);

    // normalizar chaves do backend
    const agendaNormalizada: Record<string, any[]> = {};
    Object.keys(agenda).forEach((key) => {
        agendaNormalizada[key.slice(0, 10)] = agenda[key];
    });

    // gerar dias do calendário
    const startDate = new Date(start);
    const endDate = new Date(end);
    const { agenda: agendaAtualizada } = usePage().props as unknown as { agenda: Record<string, any[]> };

    const agendaNormalizadaAtualizada: Record<string, any[]> = {};
    Object.keys(agendaAtualizada).forEach((key) => {
        agendaNormalizadaAtualizada[key.slice(0, 10)] = agendaAtualizada[key];
    });

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

    const [creatingSlotDate, setCreatingSlotDate] = useState<string | null>(null);

    function refreshSlotModal() {
        if (!slotModal) return;

        const updatedSlot = Object.values(agendaNormalizadaAtualizada)
            .flat()
            .find((s: any) => s.id === slotModal.id);

        if (updatedSlot) {
            setSlotModal(updatedSlot);
        }
    }

    function exportarPdf() {
        const params = new URLSearchParams({
            type: 'mensal',
            month,
        });

        window.open(`/agenda/export/pdf?${params.toString()}`, '_blank');
    }

    function CreateSlotModal({ date, onClose }) {
        const [form, setForm] = useState({
            data: date,
            hora_inicio: '',
            hora_fim: '',
            team_id: '',
            sala: '',
            repeat_type: 'none',
            repeat_until: '',
            observacoes: '',
        });

        const { errors } = usePage().props;

        const submit = () => {
            router.post('/slots', form, {
                onSuccess: onClose,
            });
        };

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="w-full max-w-md rounded-xl bg-white p-6">
                    <h2 className="mb-4 text-xl font-semibold">Criar Slot — {date}</h2>

                    {/* Hora início */}
                    <input
                        type="time"
                        value={form.hora_inicio}
                        onChange={(e) => setForm({ ...form, hora_inicio: e.target.value })}
                        className="mb-3 w-full rounded border px-3 py-2"
                    />

                    {/* Hora fim */}
                    <input
                        type="time"
                        value={form.hora_fim}
                        onChange={(e) => setForm({ ...form, hora_fim: e.target.value })}
                        className="mb-3 w-full rounded border px-3 py-2"
                    />

                    {/* Equipa */}
                    <select
                        value={form.team_id}
                        onChange={(e) => setForm({ ...form, team_id: e.target.value })}
                        className="mb-3 w-full rounded border px-3 py-2"
                    >
                        <option value="">Selecione equipa…</option>
                        {teams.map((team) => (
                            <option key={team.id} value={team.id}>
                                {team.nome}
                            </option>
                        ))}
                    </select>

                    {/* SALA */}
                    <input
                        type="text"
                        placeholder="Sala"
                        value={form.sala}
                        onChange={(e) => setForm({ ...form, sala: e.target.value })}
                        className="w-full rounded border px-3 py-2"
                    />

                    {/* REPETIÇÃO */}
                    <select
                        value={form.repeat_type}
                        onChange={(e) => setForm({ ...form, repeat_type: e.target.value })}
                        className="w-full rounded border px-3 py-2"
                    >
                        <option value="none">Não repetir</option>
                        <option value="daily">Diariamente</option>
                        <option value="weekly">Semanalmente</option>
                        <option value="monthly">Mensalmente</option>
                    </select>

                    {/* Até data */}
                    {form.repeat_type !== 'none' && (
                        <input
                            type="date"
                            value={form.repeat_until || ''}
                            onChange={(e) => setForm({ ...form, repeat_until: e.target.value })}
                            className="w-full rounded border px-3 py-2"
                        />
                    )}

                    {/* OBSERVAÇÕES */}
                    <textarea
                        placeholder="Observações"
                        value={form.observacoes}
                        onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                        className="h-24 w-full rounded border px-3 py-2"
                    />

                    <div className="flex justify-end gap-3">
                        <button onClick={onClose} className="rounded bg-gray-300 px-4 py-2">
                            Cancelar
                        </button>
                        <button onClick={submit} className="rounded bg-blue-600 px-4 py-2 text-white">
                            Criar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    useEffect(() => {
        refreshSlotModal();
    }, [agendaAtualizada]);

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
                        <button onClick={exportarPdf} className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700">
                            Exportar PDF
                        </button>

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
                            <div
                                key={data}
                                className="min-h-[120px] cursor-pointer rounded-xl border bg-white p-2"
                                onClick={(e) => {
                                    if (e.target === e.currentTarget) {
                                        setCreatingSlotDate(data);
                                    }
                                }}
                            >
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

                {creatingSlotDate && (
                    <CreateSlotModal
                        date={creatingSlotDate}
                        onClose={() => {
                            setCreatingSlotDate(null);
                            router.reload({ only: ['agenda'] });
                        }}
                    />
                )}

                {slotModal && <SlotModal slot={slotModal} teamColors={teamColors} close={() => setSlotModal(null)} refreshSlot={refreshSlotModal} />}
            </div>
        </AppLayout>
    );
}
