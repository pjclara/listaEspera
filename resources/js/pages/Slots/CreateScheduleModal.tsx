import { SearchableSelect } from '@/components/SearchableSelect';
import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';

export function CreateScheduleModal({ slot, close }) {
    const { errors, waitingLists } = usePage().props;

    const [form, setForm] = useState({
        waiting_list_id: '',
        slot_id: slot.id,
        duracao_estimada: '',
        estado: 'agendado',
    });

    function submit(e) {
        e.preventDefault();

        router.post(`/waiting-lists/${form.waiting_list_id}/schedule`, form, {
            preserveScroll: true,
            onSuccess: () => {
                router.reload({ only: ['agenda'] });
                close();
            },
        });
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
                <h2 className="mb-4 text-xl font-semibold">Novo Agendamento</h2>

                <form onSubmit={submit} className="space-y-4">
                    {/* Doente */}
                    <label className="block">
                        <span className="text-sm text-gray-600">Doente</span>
                        <SearchableSelect
                            value={form.waiting_list_id}
                            onChange={(id) => setForm({ ...form, waiting_list_id: id })}
                            options={waitingLists}
                        />

                        {errors?.waiting_list_id && <p className="text-sm text-red-600">{errors.waiting_list_id}</p>}
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

                    <div className="mt-6 flex justify-end gap-3">
                        <button type="button" onClick={close} className="rounded bg-gray-300 px-4 py-2 hover:bg-gray-400">
                            Cancelar
                        </button>

                        <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
