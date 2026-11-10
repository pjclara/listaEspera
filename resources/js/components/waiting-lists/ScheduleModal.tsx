import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
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

const selectClass =
    'border-input bg-background focus:ring-ring w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2';

export default function ScheduleModal({ open, selected, scheduleForm, setScheduleForm, slotsDisponiveis, onClose }: ScheduleModalProps) {
    const { errors } = usePage().props as any;

    if (!selected) return null;

    // --- EQUIPAS ÚNICAS (robusto)
    const equipas = Array.from(new Set(slotsDisponiveis.map((s) => s.team?.id ?? s.team_id ?? null)))
        .filter((id) => id !== null)
        .map((teamId) => ({
            id: teamId,
            nome:
                slotsDisponiveis.find((s) => (s.team?.id ?? s.team_id) === teamId)?.team?.nome ??
                slotsDisponiveis.find((s) => (s.team?.id ?? s.team_id) === teamId)?.team_nome ??
                'Equipa ' + teamId,
        }));

    // --- MESES ÚNICOS (robusto)
    const meses = Array.from(
        new Set(
            slotsDisponiveis.map((s) => {
                if (!s.data) return null;
                return new Date(s.data).getMonth() + 1;
            }),
        ),
    ).filter((mes) => mes !== null);

    // --- FILTRAR SLOTS POR EQUIPA E MÊS (robusto)
    const slotsFiltrados = slotsDisponiveis.filter((slot) => {
        const slotMes = slot.data ? new Date(slot.data).getMonth() + 1 : null;
        const slotTeam = slot.team?.id ?? slot.team_id ?? null;

        return (!scheduleForm.team_id || scheduleForm.team_id == slotTeam) && (!scheduleForm.mes || scheduleForm.mes == slotMes);
    });

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>{selected.schedule ? 'Editar Agendamento' : `Agendar — Nº ${selected.num_processo}`}</DialogTitle>
                </DialogHeader>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();

                        const payload = {
                            slot_id: scheduleForm.slot_id,
                            duracao_estimada: scheduleForm.duracao_estimada,
                            estado: scheduleForm.estado,
                        };

                        if (selected.schedule) {
                            router.put(`/waiting-lists/${selected.id}/schedule/${selected.schedule.id}`, payload, {
                                preserveScroll: true,
                                onSuccess: () => onClose(),
                            });
                        } else {
                            router.post(`/waiting-lists/${selected.id}/schedule`, payload, {
                                preserveScroll: true,
                                onSuccess: () => onClose(),
                            });
                        }
                    }}
                    className="space-y-4"
                >
                    {/* EQUIPA */}
                    <div className="grid gap-2">
                        <Label>Equipa</Label>
                        <select
                            value={scheduleForm.team_id}
                            onChange={(e) =>
                                setScheduleForm({
                                    ...scheduleForm,
                                    team_id: e.target.value,
                                    slot_id: '',
                                })
                            }
                            className={selectClass}
                        >
                            <option value="">Todas as equipas</option>

                            {equipas.map((team) => (
                                <option key={team.id} value={team.id}>
                                    {team.nome}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* MÊS */}
                    <div className="grid gap-2">
                        <Label>Mês</Label>
                        <select
                            value={scheduleForm.mes}
                            onChange={(e) =>
                                setScheduleForm({
                                    ...scheduleForm,
                                    mes: e.target.value,
                                    slot_id: '',
                                })
                            }
                            className={selectClass}
                        >
                            <option value="">Todos os meses</option>

                            {meses.map((mes) => (
                                <option key={mes} value={mes}>
                                    {mes.toString().padStart(2, '0')}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* SLOT */}
                    <div className="grid gap-2">
                        <Label>Slot disponível</Label>
                        <select
                            value={scheduleForm.slot_id}
                            onChange={(e) =>
                                setScheduleForm({
                                    ...scheduleForm,
                                    slot_id: e.target.value,
                                })
                            }
                            className={selectClass}
                        >
                            <option value="">Selecione um slot</option>

                            {slotsFiltrados.map((slot) => (
                                <option key={slot.id} value={slot.id}>
                                    {new Date(slot.data).toLocaleDateString()} — {slot.hora_inicio} — Equipa {slot.team?.nome ?? slot.team_nome}
                                </option>
                            ))}
                        </select>

                        {errors.slot_id && <p className="text-destructive text-sm">{errors.slot_id}</p>}
                    </div>

                    {/* ESTADO */}
                    <div className="grid gap-2">
                        <Label>Estado do agendamento</Label>
                        <select
                            value={scheduleForm.estado}
                            onChange={(e) =>
                                setScheduleForm({
                                    ...scheduleForm,
                                    estado: e.target.value,
                                })
                            }
                            className={selectClass}
                        >
                            <option value="proposto">Proposto</option>
                            <option value="pronto">Pronto</option>
                            <option value="agendado">Agendado</option>
                            <option value="operado">Operado</option>
                            <option value="cancelado">Cancelado</option>
                        </select>

                        {errors.estado && <p className="text-destructive text-sm">{errors.estado}</p>}
                    </div>

                    {/* DURAÇÃO */}
                    <div className="grid gap-2">
                        <Label>Duração estimada (minutos)</Label>
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
                            className={selectClass}
                        />

                        {errors.duracao_estimada && <p className="text-destructive text-sm">{errors.duracao_estimada}</p>}
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button type="button" variant="ghost" onClick={onClose}>
                            Cancelar
                        </Button>

                        <Button type="submit">{selected.schedule ? 'Guardar Alterações' : 'Guardar Agendamento'}</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
