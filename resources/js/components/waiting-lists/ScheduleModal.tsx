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
        team_id: string;
        mes: string;
        slot_id: string;
        duracao_estimada: string;
        
    };
    setScheduleForm: React.Dispatch<
        React.SetStateAction<{
            team_id: string;
            mes: string;
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

    console.log('slotsDisponiveis', slotsDisponiveis);
    // --- EQUIPAS ÚNICAS ---
    const equipas = Array.from(
        new Set(slotsDisponiveis.map((s) => s.team.id))
    ).map((teamId) => ({
        id: teamId,
        nome: slotsDisponiveis.find((s) => s.team.id === teamId)?.team.nome,
    }));

    // --- MESES ÚNICOS ---
    const meses = Array.from(
        new Set(
            slotsDisponiveis.map(
                (s) => new Date(s.data).getMonth() + 1
            )
        )
    );

    // --- FILTRAR SLOTS POR EQUIPA E MÊS ---
    const slotsFiltrados = slotsDisponiveis.filter((slot) => {
        const slotMes = new Date(slot.data).getMonth() + 1;
        const slotTeam = slot.team.id;

        return (
            (!scheduleForm.team_id || scheduleForm.team_id == slotTeam) &&
            (!scheduleForm.mes || scheduleForm.mes == slotMes)
        );
    });

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

                        const payload = {
                            slot_id: scheduleForm.slot_id,
                            duracao_estimada: scheduleForm.duracao_estimada,
                            estado: 'agendado',
                        };

                        if (selected.schedule) {
                            router.put(
                                `/waiting-lists/${selected.id}/schedule/${selected.schedule.id}`,
                                payload,
                                {
                                    preserveScroll: true,
                                    onSuccess: () => onClose(),
                                }
                            );
                        } else {
                            router.post(
                                `/waiting-lists/${selected.id}/schedule`,
                                payload,
                                {
                                    preserveScroll: true,
                                    onSuccess: () => onClose(),
                                }
                            );
                        }
                    }}
                    className="space-y-4"
                >
                    {/* FILTRO POR EQUIPA */}
                    <label className="block">
                        <span className="text-sm text-gray-600">Equipa</span>

                        <select
                            value={scheduleForm.team_id}
                            onChange={(e) =>
                                setScheduleForm({
                                    ...scheduleForm,
                                    team_id: e.target.value,
                                    slot_id: "", // limpar slot
                                })
                            }
                            className="w-full rounded border px-3 py-2"
                        >
                            <option value="">Todas as equipas</option>

                            {equipas.map((team) => (
                                <option key={team.id} value={team.id}>
                                    {team.nome}
                                </option>
                            ))}
                        </select>
                    </label>

                    {/* FILTRO POR MÊS */}
                    <label className="block">
                        <span className="text-sm text-gray-600">Mês</span>

                        <select
                            value={scheduleForm.mes}
                            onChange={(e) =>
                                setScheduleForm({
                                    ...scheduleForm,
                                    mes: e.target.value,
                                    slot_id: "", // limpar slot
                                })
                            }
                            className="w-full rounded border px-3 py-2"
                        >
                            <option value="">Todos os meses</option>

                            {meses.map((mes) => (
                                <option key={mes} value={mes}>
                                    {mes.toString().padStart(2, "0")}
                                </option>
                            ))}
                        </select>
                    </label>

                    {/* SLOT FILTRADO */}
                    <label className="block">
                        <span className="text-sm text-gray-600">Slot disponível</span>

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

                            {slotsFiltrados.map((slot) => (
                                <option key={slot.id} value={slot.id}>
                                    {new Date(slot.data).toLocaleDateString()} —{' '}
                                    {slot.hora_inicio} — Equipa {slot.team.nome}
                                </option>
                            ))}
                        </select>

                        {errors.slot_id && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.slot_id}
                            </p>
                        )}
                    </label>

                    {/* DURAÇÃO */}
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
