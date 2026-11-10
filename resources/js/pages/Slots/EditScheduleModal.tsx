import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';

function getFirstErrorMessage(formErrors: Record<string, any>) {
    const firstError = Object.values(formErrors)[0];
    return Array.isArray(firstError) ? firstError[0] : firstError;
}

export function EditScheduleModal({ schedule, slot, close }) {
    const [form, setForm] = useState({
        slot_id: schedule.slot_id,
        duracao_estimada: schedule.duracao_estimada,
        estado: schedule.estado,
        pernoita: schedule.pernoita ? schedule.pernoita : 'nao',
    });

    const { errors } = usePage().props;

    function submit(e: React.FormEvent) {
        e.preventDefault();

        router.put(`/waiting-lists/${schedule.waiting_list_id}/schedule/${schedule.id}`, form, {
            preserveScroll: true,
            onSuccess: () => {
                close(form);
            },
            onError: (formErrors) => {
                toast.error('Não foi possível atualizar o agendamento', {
                    description: getFirstErrorMessage(formErrors) || 'Verifica os dados e tenta novamente.',
                });
            },
        });
    }

    function cancelarAgendamento() {
        router.put(
            `/waiting-lists/${schedule.waiting_list_id}/schedule/${schedule.id}`,
            { estado: 'cancelado', duracao_estimada: form.duracao_estimada, slot_id: form.slot_id },
            {
                onSuccess: () => close(),
                onError: (formErrors) => {
                    toast.error('Não foi possível cancelar o agendamento', {
                        description: getFirstErrorMessage(formErrors) || 'Tenta novamente.',
                    });
                },
            },
        );
    }

    return (
        <Dialog open onOpenChange={(open) => !open && close()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Editar Agendamento</DialogTitle>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label>Slot</Label>
                        <Select value={String(form.slot_id)} onValueChange={(value) => setForm({ ...form, slot_id: value })}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={String(slot.id)}>
                                    {new Date(slot.data).toLocaleDateString()} — {slot.hora_inicio} — Equipa {slot.team.nome}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label>Estado do agendamento</Label>
                        <Select value={form.estado} onValueChange={(value) => setForm({ ...form, estado: value })}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="proposto">Proposto</SelectItem>
                                <SelectItem value="pronto">Pronto</SelectItem>
                                <SelectItem value="agendado">Agendado</SelectItem>
                                <SelectItem value="operado">Operado</SelectItem>
                                <SelectItem value="cancelado">Cancelado</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.estado && <p className="text-destructive text-sm">{errors.estado}</p>}
                    </div>

                    <div className="grid gap-2">
                        <Label>Pernoita</Label>
                        <Select value={form.pernoita} onValueChange={(value) => setForm({ ...form, pernoita: value })}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="nao">Não</SelectItem>
                                <SelectItem value="sim">Sim</SelectItem>
                                <SelectItem value="talvez">Talvez</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label>Duração estimada (min)</Label>
                        <Input
                            type="number"
                            min="1"
                            value={form.duracao_estimada}
                            onChange={(e) => setForm({ ...form, duracao_estimada: e.target.value })}
                        />
                        {errors?.duracao_estimada && <p className="text-destructive text-sm">{errors.duracao_estimada}</p>}
                    </div>

                    <DialogFooter className="sm:justify-between">
                        <Button type="button" variant="destructive" onClick={cancelarAgendamento}>
                            Cancelar agendamento
                        </Button>

                        <div className="flex gap-2">
                            <Button type="button" variant="ghost" onClick={close}>
                                Fechar
                            </Button>
                            <Button type="submit">Guardar</Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
