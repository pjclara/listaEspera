import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';

export function EditScheduleModal({ schedule, slot, close }) {
    const [form, setForm] = useState({
        slot_id: schedule.slot_id,
        duracao_estimada: schedule.duracao_estimada,
        estado: schedule.estado,
    });

    const { errors } = usePage().props;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
                <h2 className="mb-4 text-xl font-semibold">Editar Agendamento</h2>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();

                        router.put(`/waiting-lists/${schedule.waiting_list_id}/schedule/${schedule.id}`, form, {
                            preserveScroll: true,
                            onSuccess: () => {
                                router.reload({ only: ['agenda'] });
                                close();
                            },
                        });
                    }}
                    className="space-y-4"
                >
                    {/* Slot */}
                    <label className="block">
                        <span className="text-sm text-gray-600">Slot</span>
                        <select
                            value={form.slot_id}
                            onChange={(e) => setForm({ ...form, slot_id: e.target.value })}
                            className="w-full rounded border px-3 py-2"
                        >
                            <option value={slot.id}>
                                {new Date(slot.data).toLocaleDateString()} — {slot.hora_inicio} — Equipa {slot.team.nome}
                            </option>
                        </select>
                    </label>

                    {/* Duração */}
                    <label className="block">
                        <span className="text-sm text-gray-600">Duração estimada (min)</span>
                        <input
                            type="number"
                            min="1"
                            value={form.duracao_estimada}
                            onChange={(e) => setForm({ ...form, duracao_estimada: e.target.value })}
                            className="w-full rounded border px-3 py-2"
                        />
                        {errors?.duracao_estimada && <p className="text-sm text-red-600">{errors.duracao_estimada}</p>}
                    </label>

                    <div className="mt-6 flex justify-between">
                        <button
                            type="button"
                            onClick={() =>
                                router.put(
                                    `/waiting-lists/${schedule.waiting_list_id}/schedule/${schedule.id}`,
                                    { estado: 'cancelado', duracao_estimada: form.duracao_estimada, slot_id: form.slot_id },
                                    { onSuccess: () => close() },
                                )
                            }
                            className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                        >
                            Cancelar Agendamento
                        </button>

                        <div className="flex gap-3">
                            <button type="button" onClick={close} className="rounded bg-gray-300 px-4 py-2 hover:bg-gray-400">
                                Fechar
                            </button>

                            <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                                Guardar
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
