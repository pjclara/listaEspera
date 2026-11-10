import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';

type Team = { id: number; nome: string; cor?: string; sala_default?: string; ativa?: boolean; leader_id?: number | string };

export default function CreateTeamModal({ team, close }: { team: Team | null; close: () => void }) {
    const { errors } = usePage().props as unknown as { errors: Record<string, string> };

    const [form, setForm] = useState({
        nome: team?.nome || '',
        cor: team?.cor || '#4f46e5',
        sala_default: team?.sala_default || '',
        ativa: team?.ativa ?? true,
        leader_id: team?.leader_id || '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();

        if (team) {
            router.put(`/teams/${team.id}`, form, {
                preserveScroll: true,
                onSuccess: close,
            });
        } else {
            router.post(`/teams`, form, {
                preserveScroll: true,
                onSuccess: close,
            });
        }
    }

    return (
        <Dialog open onOpenChange={(open) => !open && close()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{team ? 'Editar Equipa' : 'Nova Equipa'}</DialogTitle>
                    <DialogDescription>Define o nome, cor e sala padrão da equipa cirúrgica.</DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label>Nome</Label>
                        <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} autoFocus />
                        {errors?.nome && <p className="text-destructive text-sm">{errors.nome}</p>}
                    </div>

                    <div className="grid gap-2">
                        <Label>Cor</Label>
                        <div className="flex items-center gap-3">
                            <input
                                type="color"
                                value={form.cor}
                                onChange={(e) => setForm({ ...form, cor: e.target.value })}
                                className="border-input size-10 cursor-pointer rounded-lg border p-1"
                            />
                            <span className="text-muted-foreground text-sm">{form.cor}</span>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label>Sala padrão</Label>
                        <Input value={form.sala_default} onChange={(e) => setForm({ ...form, sala_default: e.target.value })} />
                    </div>

                    <div className="grid gap-2">
                        <Label>Estado</Label>
                        <Select value={form.ativa ? 'true' : 'false'} onValueChange={(value) => setForm({ ...form, ativa: value === 'true' })}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="true">Ativa</SelectItem>
                                <SelectItem value="false">Inativa</SelectItem>
                            </SelectContent>
                        </Select>
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
