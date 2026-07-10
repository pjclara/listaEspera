import { router, usePage } from '@inertiajs/react';

interface Slot {
    id: number;
    team?: {
        id: number;
        nome: string;
    };
    team_id?: number;
    team_nome?: string;
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
        estado: string; // <- ADICIONADO
    };
    setScheduleForm: React.Dispatch<
        React.SetStateAction<{
            team_id: string;
            mes: string;
            slot_id: string;
            duracao_estimada: string;
            estado: string; // <- ADICIONADO
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

    console.log("slotsDisponiveis", slotsDisponiveis);

    // --- EQUIPAS ÚNICAS (robusto)
    const equipas = Array.from(
        new Set(
            slotsDisponiveis.map(
                (s) => s.team?.id ?? s.team_id ?? null
            )
        )
    )
        .filter((id) => id !== null)
        .map((teamId) => ({
            id: teamId,
            nome:
                slotsDisponiveis.find(
                    (s) =>
                        (s.team?.id ?? s.team_id) === teamId
                )?.team?.nome ??
                slotsDisponiveis.find(
                    (s) =>
                        (s.team?.id ?? s.team_id) === teamId
                )?.team_nome ??
                "Equipa " + teamId,
        }));

    // --- MESES ÚNICOS (robusto)
    const meses = Array.from(
        new Set(
            slotsDisponiveis.map((s) => {
                if (!s.data) return null;
                return new Date(s.data).getMonth() + 1;
            })
        )
    ).filter((mes) => mes !== null);

    // --- FILTRAR SLOTS POR EQUIPA E MÊS (robusto)
    const slotsFiltrados = slotsDisponiveis.filter((slot) => {
        const slotMes = slot.data
            ? new Date(slot.data).getMonth() + 1
            : null;

        const slotTeam = slot.team?.id ?? slot.team_id ?? null;

        return (
            (!scheduleForm.team_id ||
                scheduleForm.team_id == slotTeam) &&
            (!scheduleForm.mes ||
                scheduleForm.mes == slotMes)
        );
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
                <h2 className="mb-4 text-xl font-semibold">
                    {selected.schedule
                        ? "Editar Agendamento"
                        : `Agendar — Nº ${selected.num_processo}`}
                </h2>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();

                        const payload = {
                            slot_id: scheduleForm.slot_id,
                            duracao_estimada: scheduleForm.duracao_estimada,
                            estado: scheduleForm.estado,
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
                    {/* EQUIPA */}
                    <label className="block">
                        <span className="text-sm text-gray-600">Equipa</span>

                        <select
                            value={scheduleForm.team_id}
                            onChange={(e) =>
                                setScheduleForm({
                                    ...scheduleForm,
                                    team_id: e.target.value,
                                    slot_id: "",
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

                    {/* MÊS */}
                    <label className="block">
                        <span className="text-sm text-gray-600">Mês</span>

                        <select
                            value={scheduleForm.mes}
                            onChange={(e) =>
                                setScheduleForm({
                                    ...scheduleForm,
                                    mes: e.target.value,
                                    slot_id: "",
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

                    {/* SLOT */}
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
                                    {new Date(slot.data).toLocaleDateString()} —{" "}
                                    {slot.hora_inicio} — Equipa{" "}
                                    {slot.team?.nome ?? slot.team_nome}
                                </option>
                            ))}
                        </select>

                        {errors.slot_id && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.slot_id}
                            </p>
                        )}
                    </label>

                    {/* ESTADO */}
                    <label className="block">
                        <span className="text-sm text-gray-600">Estado do agendamento</span>

                        <select
                            value={scheduleForm.estado}
                            onChange={(e) =>
                                setScheduleForm({
                                    ...scheduleForm,
                                    estado: e.target.value,
                                })
                            }
                            className="w-full rounded border px-3 py-2"
                        >
                            <option value="proposto">Proposto</option>
                            <option value="pronto">Pronto</option>
                            <option value="agendado">Agendado</option>
                            <option value="operado">Operado</option>
                            <option value="cancelado">Cancelado</option>
                        </select>

                        {errors.estado && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.estado}
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
                            className="rounded bg-gray-300 px-4 py-2 hover:bg-gray-400"
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                        >
                            {selected.schedule
                                ? "Guardar Alterações"
                                : "Guardar Agendamento"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
