import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/ui/page-header';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Slot } from '@/types/Slot';
import { Team } from '@/types/Team';
import { Head, router, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { CalendarClock, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Slots Cirúrgicos',
        href: '/slots',
    },
];

export default function Index({ slots, teams }: PageProps<{ slots: Slot[]; teams: Team[] }>) {
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<null | number>(null);

    const [form, setForm] = useState({
        data: '',
        hora_inicio: '',
        hora_fim: '',
        team_id: '',
        sala: '',
        observacoes: '',
        repeat_type: 'none',
        repeat_until: '',
    });

    const { errors } = usePage().props;

    const openCreate = () => {
        setEditing(null);
        setForm({
            data: '',
            hora_inicio: '',
            hora_fim: '',
            team_id: '',
            sala: '',
            observacoes: '',
            repeat_type: 'none',
            repeat_until: '',
        });
        setShowModal(true);
    };

    const openEdit = (slot: Slot) => {
        setEditing(slot.id);
        const formattedDate = new Date(slot.data).toISOString().split('T')[0];

        setForm({
            data: formattedDate,
            hora_inicio: slot.hora_inicio,
            hora_fim: slot.hora_fim,
            team_id: slot.team_id,
            sala: slot.sala || '',
            observacoes: slot.observacoes || '',
            repeat_type: slot.repeat_type || 'none',
            repeat_until: slot.repeat_until || '',
        });
        setShowModal(true);
    };

    const submit = () => {
        if (editing) {
            router.put(`/slots/${editing}`, form, {
                onSuccess: () => setShowModal(false),
            });
        } else {
            router.post(`/slots`, form, {
                onSuccess: () => setShowModal(false),
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Slots Cirúrgicos" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <PageHeader
                    title="Slots Cirúrgicos"
                    description="Define os blocos de sala disponíveis para cada equipa."
                    icon={<CalendarClock className="size-5" />}
                    actions={
                        <Button onClick={openCreate}>
                            <Plus className="size-4" />
                            Criar Slot
                        </Button>
                    }
                />

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 }}
                    className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
                >
                    {slots.length === 0 ? (
                        <EmptyState
                            icon={CalendarClock}
                            title="Ainda não há slots"
                            description="Cria o primeiro slot para abrir disponibilidade de sala a uma equipa."
                            action={
                                <Button size="sm" onClick={openCreate}>
                                    Criar Slot
                                </Button>
                            }
                        />
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Data</TableHead>
                                    <TableHead>Início</TableHead>
                                    <TableHead>Fim</TableHead>
                                    <TableHead>Equipa</TableHead>
                                    <TableHead>Sala</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {slots.map((slot, idx) => (
                                    <motion.tr
                                        key={slot.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.2, delay: idx * 0.03 }}
                                        className="hover:bg-muted/40 border-b border-border transition-colors last:border-0"
                                    >
                                        <TableCell className="font-medium text-foreground">
                                            {new Date(slot.data).toISOString().split('T')[0]}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">{slot.hora_inicio}</TableCell>
                                        <TableCell className="text-muted-foreground">{slot.hora_fim}</TableCell>
                                        <TableCell>
                                            <span className="inline-flex items-center gap-2">
                                                <span className="inline-block size-2.5 rounded-full" style={{ backgroundColor: slot.team?.cor }} />
                                                {slot.team.nome}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">{slot.sala || '—'}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <Button variant="ghost" size="icon" className="size-8" title="Editar" onClick={() => openEdit(slot)}>
                                                    <Pencil className="size-4" />
                                                </Button>

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive hover:bg-destructive/10 hover:text-destructive size-8"
                                                    title="Apagar"
                                                    onClick={() => {
                                                        if (confirm('Apagar este slot?')) {
                                                            router.delete(`/slots/${slot.id}`);
                                                        }
                                                    }}
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </motion.tr>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </motion.div>

                <Dialog open={showModal} onOpenChange={(open) => !open && setShowModal(false)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editing ? 'Editar Slot' : 'Criar Slot'}</DialogTitle>
                        </DialogHeader>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                submit();
                            }}
                            className="space-y-4"
                        >
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Data</Label>
                                    <Input type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} />
                                    {errors.data && <p className="text-destructive text-sm">{errors.data}</p>}
                                </div>

                                <div className="grid gap-2">
                                    <Label>Sala</Label>
                                    <Input placeholder="Sala" value={form.sala} onChange={(e) => setForm({ ...form, sala: e.target.value })} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Hora início</Label>
                                    <Input
                                        type="time"
                                        value={form.hora_inicio}
                                        onChange={(e) => setForm({ ...form, hora_inicio: e.target.value })}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label>Hora fim</Label>
                                    <Input type="time" value={form.hora_fim} onChange={(e) => setForm({ ...form, hora_fim: e.target.value })} />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label>Equipa</Label>
                                <Select value={String(form.team_id || '')} onValueChange={(value) => setForm({ ...form, team_id: value })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione a equipa" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {teams.map((team) => (
                                            <SelectItem key={team.id} value={String(team.id)}>
                                                {team.nome}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label>Repetição</Label>
                                <Select value={form.repeat_type} onValueChange={(value) => setForm({ ...form, repeat_type: value })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Não repetir</SelectItem>
                                        <SelectItem value="daily">Diariamente</SelectItem>
                                        <SelectItem value="weekly">Semanalmente</SelectItem>
                                        <SelectItem value="monthly">Mensalmente</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {form.repeat_type !== 'none' && (
                                <div className="grid gap-2">
                                    <Label>Repetir até</Label>
                                    <Input
                                        type="date"
                                        value={form.repeat_until || ''}
                                        onChange={(e) => setForm({ ...form, repeat_until: e.target.value })}
                                    />
                                </div>
                            )}

                            <div className="grid gap-2">
                                <Label>Observações</Label>
                                <textarea
                                    placeholder="Observações"
                                    value={form.observacoes}
                                    onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                                    className="border-input bg-background focus:ring-ring h-24 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
                                />
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>
                                    Cancelar
                                </Button>
                                <Button type="submit">Guardar</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
