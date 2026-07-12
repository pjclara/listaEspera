import { useState } from 'react';
import { CreateScheduleModal } from './CreateScheduleModal';
import { EditScheduleModal } from './EditScheduleModal';

type SlotModalProps = {
    slot: any;
    close: () => void;
    teamColors: Record<number, string>;
    refreshSlot?: () => void;
};
const pernoitaColors: Record<string, string> = {
    sim: 'bg-green-100 text-green-800',
    nao: 'bg-gray-100 text-gray-800',
    talvez: 'bg-yellow-100 text-yellow-800',
};

export function SlotModal({ slot, close, teamColors, refreshSlot }: SlotModalProps) {
    const [editingSchedule, setEditingSchedule] = useState<any>(null);

    return (
        <>
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50">
                <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
                    <h2 className="mb-4 text-xl font-semibold" style={{ color: teamColors[slot.team_id] }}>
                        Slot — {new Date(slot.data).toLocaleDateString()} ({slot.hora_inicio} às {slot.hora_fim})
                    </h2>

                    <p className="mb-2 text-sm">Equipa: {slot.team.nome}</p>
                    <p className="mb-4 text-sm">Sala: {slot.sala || '—'}</p>

                    <h3 className="mb-2 font-semibold">Agendamentos</h3>

                    {slot.schedules.length === 0 && <p className="text-sm text-gray-500">Nenhum agendamento.</p>}

                    <div className="space-y-2">
                        {slot.schedules.map((s: any) => (
                            <div
                                key={s.id}
                                className={`cursor-pointer rounded ${s.estado_cor} border p-3`}
                                style={{ backgroundColor: `${s.estado_cor}` }}
                                onClick={() => setEditingSchedule(s)}
                            >
                                <div className="text-sm font-medium">Doente: {s.waiting_list?.num_processo}</div>
                                <div className="text-xs text-gray-600">{s.waiting_list?.des_diagnostico}</div>
                                <div className="mt-1 text-xs text-gray-700">Estado: {s.estado}</div>
                                <div className="text-xs text-gray-700">Prioridade: {s.waiting_list?.prioridade}</div>
                                <div className="text-xs text-gray-700">
                                    Posição: {s.waiting_list?.posicao_lista} / {s.waiting_list?.posicao_patologia}
                                </div>
                                <div className="text-xs text-gray-700">Pernoita: {s.pernoita}</div>
                                <div className="text-xs text-gray-700">Duração: {s.duracao_estimada} min</div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 flex items-center justify-between">
                        <button
                            onClick={() => setEditingSchedule({ novo: true })}
                            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white shadow-sm transition-all duration-150 hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none active:scale-95 active:bg-blue-800"
                        >
                            <span className="text-lg">＋</span>
                            <span>Adicionar</span>
                        </button>

                        <button
                            onClick={close}
                            className="flex items-center gap-2 rounded-lg bg-gray-200 px-4 py-2 text-gray-700 shadow-sm transition-all duration-150 hover:bg-gray-300 focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:outline-none active:scale-95 active:bg-gray-400"
                        >
                            <span className="text-lg">✕</span>
                            <span>Fechar</span>
                        </button>
                    </div>
                </div>
            </div>

            {editingSchedule &&
                (editingSchedule.novo ? (
                    <CreateScheduleModal
                        slot={slot}
                        close={() => {
                            setEditingSchedule(null);
                            refreshSlot?.();
                        }}
                    />
                ) : (
                    <EditScheduleModal
                        slot={slot}
                        schedule={editingSchedule}
                        close={() => {
                            setEditingSchedule(null);
                            refreshSlot?.();
                        }}
                    />
                ))}
        </>
    );
}
