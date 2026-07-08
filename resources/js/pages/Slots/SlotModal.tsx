import { useState } from 'react';
import { CreateScheduleModal } from './CreateScheduleModal';
import { EditScheduleModal } from './EditScheduleModal';

export function SlotModal({ slot, close, teamColors }) {
    const [editingSchedule, setEditingSchedule] = useState(null);

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
                        {slot.schedules.map((s) => (
                            <div key={s.id} className="cursor-pointer rounded border p-3 hover:bg-gray-100" onClick={() => setEditingSchedule(s)}>
                                <div className="font-medium">{s.waiting_list.des_diagnostico}</div>
                                <div className="text-sm text-gray-600">Duração: {s.duracao_estimada} min</div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 flex items-center justify-between">
                        <button
                            onClick={() => setEditingSchedule({ novo: true })}
                            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white shadow-sm transition hover:bg-blue-700"
                        >
                            <span className="text-lg">＋</span>
                            <span>Adicionar</span>
                        </button>

                        <button
                            onClick={close}
                            className="flex items-center gap-2 rounded-lg bg-gray-200 px-4 py-2 text-gray-700 shadow-sm transition hover:bg-gray-300"
                        >
                            <span className="text-lg">✕</span>
                            <span>Fechar</span>
                        </button>
                    </div>
                </div>
            </div>

            {editingSchedule &&
                (editingSchedule.novo ? (
                    <CreateScheduleModal slot={slot} close={() => setEditingSchedule(null)} />
                ) : (
                    <EditScheduleModal schedule={editingSchedule} slot={slot} close={() => setEditingSchedule(null)} />
                ))}
        </>
    );
}
