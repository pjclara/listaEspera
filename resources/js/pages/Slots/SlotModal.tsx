import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { CalendarClock, Plus } from 'lucide-react';
import { useState } from 'react';
import { CreateScheduleModal } from './CreateScheduleModal';
import { EditScheduleModal } from './EditScheduleModal';

type SlotModalProps = {
    slot: any;
    close: () => void;
    teamColors: Record<number, string>;
    refreshSlot?: () => void;
};

export function SlotModal({ slot, close, teamColors, refreshSlot }: SlotModalProps) {
    const [editingSchedule, setEditingSchedule] = useState<any>(null);

    return (
        <>
            <Dialog open onOpenChange={(open) => !open && close()}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle style={{ color: teamColors[slot.team_id] }}>
                            Slot — {new Date(slot.data).toLocaleDateString()} ({slot.hora_inicio} às {slot.hora_fim})
                        </DialogTitle>
                        <DialogDescription>
                            Equipa: {slot.team.nome} · Sala: {slot.sala || '—'}
                        </DialogDescription>
                    </DialogHeader>

                    <h3 className="text-sm font-semibold text-foreground">Agendamentos</h3>

                    {slot.schedules.length === 0 ? (
                        <EmptyState icon={CalendarClock} title="Nenhum agendamento" />
                    ) : (
                        <div className="space-y-2">
                            {slot.schedules.map((s: any) => (
                                <div
                                    key={s.id}
                                    className="cursor-pointer rounded-lg border p-3 text-white shadow-sm transition-opacity hover:opacity-90"
                                    style={{ backgroundColor: s.estado_cor, borderColor: s.estado_cor }}
                                    onClick={() => setEditingSchedule(s)}
                                >
                                    <div className="text-sm font-medium">Doente: {s.waiting_list?.num_processo}</div>
                                    <div className="text-xs opacity-90">{s.waiting_list?.des_diagnostico}</div>
                                    <div className="mt-1 text-xs opacity-90">Estado: {s.estado}</div>
                                    <div className="text-xs opacity-90">Prioridade: {s.waiting_list?.prioridade}</div>
                                    <div className="text-xs opacity-90">
                                        Posição: {s.waiting_list?.posicao_lista} / {s.waiting_list?.posicao_patologia}
                                    </div>
                                    <div className="text-xs opacity-90">Pernoita: {s.pernoita}</div>
                                    <div className="text-xs opacity-90">Duração: {s.duracao_estimada} min</div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="mt-2 flex items-center justify-between">
                        <Button onClick={() => setEditingSchedule({ novo: true })}>
                            <Plus className="size-4" />
                            Adicionar
                        </Button>

                        <Button variant="secondary" onClick={close}>
                            Fechar
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

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
