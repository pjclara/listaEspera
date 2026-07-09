import { router, usePage } from '@inertiajs/react';

interface Slot {
    id: number;
    team: {
        id: number;
        nome: string;
    };
    data: string;
    hora_inicio: string;
}

interface ScheduleModalProps {
    open: boolean;
    selected: any;
    scheduleForm: {
        slot_id: string;
        duracao_estimada: string;
    };
    setScheduleForm: React.Dispatch<
        React.SetStateAction<{
            slot_id: string;
            duracao_estimada: string;
        }>
    >;
    slotsDisponiveis: Slot[];
    onClose: () => void;
}

export default function ScheduleModal({
    open,
    selected,
    scheduleForm,
    setScheduleForm,
    slotsDisponiveis,
    onClose,
}: ScheduleModalProps) {
    const { errors } = usePage().props as any;

    if (!open || !selected) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-lg animate-[fadeIn_0.2s_ease] rounded-xl bg-white p-6 shadow-xl">
                <h2 className="mb-4 text-xl font-semibold">
                    {selected.schedule
                        ? 'Editar Agendamento'
                        : `Agendar — Nº ${selected.num_processo}`}
                </h2>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();

                        if (selected.schedule) {
                            router.put(
                                `/waiting-lists/${selected.id}/schedule/${selected.schedule.id}`,
                                {
                                    slot_id: scheduleForm.slot_id,
                                    duracao_estimada:
                                        scheduleForm.duracao_estimada,
                                    estado: 'agendado',
                                },
                                {
                                    preserveScroll: true,
                                    onSuccess: () => onClose(),
                                },
                            );
                        } else {
                            router.post(
                                `/waiting-lists/${selected.id}/schedule`,
                                {
                                    slot_id: scheduleForm.slot_id,
                                    duracao_estimada:
                                        scheduleForm.duracao_estimada,
                                    estado: 'agendado',
                                },
                                {
                                    preserveScroll: true,
                                    onSuccess: () => onClose(),
                                },
                            );
                        }
                    }}
                    className="space-y-4"
                >
                    {/* Slot */}
                    <label className="block">
                        <span className="text-sm text-gray-600">
                            Slot disponível
                        </span>

                        <select
                            value={scheduleForm.slot_id}
                            onChange={(e) =>
                                setScheduleForm({
                                    ...scheduleForm,
                                    slot_id: e.target.value,
                                })
                            }
                            className="w-full rounded border px-3 py-2"
                        >
                            <option value="">Selecione um slot</option>

                            {slotsDisponiveis.map((slot) => (
                                <option key={slot.id} value={slot.id}>
                                    {new Date(slot.data).toLocaleDateString()} —
                                    {' '}
                                    {slot.hora_inicio} — Equipa{' '}
                                    {slot.team.nome}
                                </option>
                            ))}
                        </select>

                        {errors.slot_id && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.slot_id}
                            </p>
                        )}
                    </label>

                    {/* Duração */}
                    <label className="block">
                        <span className="text-sm text-gray-600">
                            Duração estimada (minutos)
                        </span>

                        <input
                            type="number"
                            min="1"
                            value={scheduleForm.duracao_estimada}
                            onChange={(e) =>
                                setScheduleForm({
                                    ...scheduleForm,
                                    duracao_estimada: e.target.value,
                                })
                            }
                            className="w-full rounded border px-3 py-2"
                        />

                        {errors.duracao_estimada && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.duracao_estimada}
                            </p>
                        )}
                    </label>

                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded bg-gray-300 px-4 py-2 transition hover:bg-gray-400"
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            className="rounded bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
                        >
                            {selected.schedule
                                ? 'Guardar Alterações'
                                : 'Guardar Agendamento'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}