import { SearchableSelect } from '@/components/SearchableSelect';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';

export function CreateScheduleModal({ slot, close }) {
    const { errors, waitingLists } = usePage().props;

    const [form, setForm] = useState({
        waiting_list_id: '',
        slot_id: slot.id,
        duracao_estimada: '',
        estado: 'proposto',
        pernoita: 'nao',
    });

    function submit(e) {
        e.preventDefault();

        router.post(`/waiting-lists/${form.waiting_list_id}/schedule`, form, {
            preserveScroll: true,
            onSuccess: () => {
                router.reload({ only: ['agenda'] });
                close();
            },
            onError: (formErrors) => {
                const firstError = Object.values(formErrors)[0];
                const message = Array.isArray(firstError) ? firstError[0] : firstError;

                toast.error('Não foi possível criar o agendamento', {
                    description: message || 'Verifica os dados e tenta novamente.',
                });
            },
        });
    }

    return (
        <Dialog open onOpenChange={(open) => !open && close()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Novo Agendamento</DialogTitle>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label>Doente</Label>
                        <SearchableSelect value={form.waiting_list_id} onChange={(id) => setForm({ ...form, waiting_list_id: id })} options={waitingLists} />
                        {errors?.waiting_list_id && <p className="text-destructive text-sm">{errors.waiting_list_id}</p>}
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

                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={close}>
                            Cancelar
                        </Button>
                        <Button type="submit">Guardar</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
