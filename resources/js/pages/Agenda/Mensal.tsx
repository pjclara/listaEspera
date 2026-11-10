import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/ui/page-header';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { CalendarRange, FileDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SlotModal } from '../Slots/SlotModal';

export default function Mensal({
    agenda,
    month,
    start,
    end,
    teamColors,
    teams,
}: {
    agenda: Record<string, any[]>;
    month: string;
    start: string;
    end: string;
    teamColors: Record<number, string>;
    teams: { id: number; nome: string; cor: string }[];
}) {
    const [slotModal, setSlotModal] = useState<any | null>(null);

    // normalizar chaves do backend
    const agendaNormalizada: Record<string, any[]> = {};
    Object.keys(agenda).forEach((key) => {
        agendaNormalizada[key.slice(0, 10)] = agenda[key];
    });

    // gerar dias do calendário
    const startDate = new Date(start);
    const endDate = new Date(end);
    const { agenda: agendaAtualizada } = usePage().props as unknown as { agenda: Record<string, any[]> };

    const agendaNormalizadaAtualizada: Record<string, any[]> = {};
    Object.keys(agendaAtualizada).forEach((key) => {
        agendaNormalizadaAtualizada[key.slice(0, 10)] = agendaAtualizada[key];
    });

    const dias = [];
    let d = new Date(startDate);

    while (d <= endDate) {
        const dataStr = d.toISOString().slice(0, 10); // formato correto
        dias.push({
            data: dataStr,
            diaMes: d.getDate(),
            mesAtual: d.getMonth() === new Date(month).getMonth(),
        });
        d.setDate(d.getDate() + 1);
    }

    function mudarMes(offset: number) {
        const novaData = new Date(month);
        if (offset === 0) {
            router.get('/agenda/mensal', {
                month: new Date().toISOString().slice(0, 10),
            });
            return;
        }
        novaData.setMonth(novaData.getMonth() + offset);

        router.get('/agenda/mensal', {
            month: novaData.toISOString().slice(0, 10),
        });
    }

    const [creatingSlotDate, setCreatingSlotDate] = useState<string | null>(null);

    function refreshSlotModal() {
        if (!slotModal) return;

        const updatedSlot = Object.values(agendaNormalizadaAtualizada)
            .flat()
            .find((s: any) => s.id === slotModal.id);

        if (updatedSlot) {
            setSlotModal(updatedSlot);
        }
    }

    function exportarPdf() {
        const params = new URLSearchParams({
            type: 'mensal',
            month,
        });

        window.open(`/agenda/export/pdf?${params.toString()}`, '_blank');
    }

    function CreateSlotModal({ date, onClose }: { date: string; onClose: () => void }) {
        const [form, setForm] = useState({
            data: date,
            hora_inicio: '',
            hora_fim: '',
            team_id: '',
            sala: '',
            repeat_type: 'none',
            repeat_until: '',
            observacoes: '',
        });

        const submit = () => {
            router.post('/slots', form, {
                onSuccess: onClose,
            });
        };

        return (
            <Dialog open onOpenChange={(open) => !open && onClose()}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Criar Slot — {date}</DialogTitle>
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
                                <Label>Hora início</Label>
                                <Input type="time" value={form.hora_inicio} onChange={(e) => setForm({ ...form, hora_inicio: e.target.value })} />
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
                                    <SelectValue placeholder="Selecione equipa…" />
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
                            <Label>Sala</Label>
                            <Input placeholder="Sala" value={form.sala} onChange={(e) => setForm({ ...form, sala: e.target.value })} />
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
                            <Button type="button" variant="ghost" onClick={onClose}>
                                Cancelar
                            </Button>
                            <Button type="submit">Criar</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        );
    }

    useEffect(() => {
        refreshSlotModal();
    }, [agendaAtualizada]);

    return (
        <AppLayout breadcrumbs={[{ title: 'Agenda Cirúrgica', href: '/agenda' }]}>
            <Head title="Agenda Cirúrgica - Mês" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <PageHeader
                    title={new Date(month).toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })}
                    icon={<CalendarRange className="size-5" />}
                    actions={
                        <>
                            <Button variant="outline" onClick={exportarPdf}>
                                <FileDown className="size-4" />
                                Exportar PDF
                            </Button>
                            <Button variant="secondary" onClick={() => mudarMes(-1)}>
                                Mês anterior
                            </Button>
                            <Button variant="secondary" onClick={() => mudarMes(0)}>
                                Hoje
                            </Button>
                            <Button variant="secondary" onClick={() => mudarMes(1)}>
                                Próximo mês
                            </Button>
                        </>
                    }
                />

                {/* Cabeçalho */}
                <div className="text-muted-foreground grid grid-cols-7 text-center text-xs font-semibold tracking-wide uppercase">
                    <div>Seg</div>
                    <div>Ter</div>
                    <div>Qua</div>
                    <div>Qui</div>
                    <div>Sex</div>
                    <div>Sáb</div>
                    <div>Dom</div>
                </div>

                {/* Grelha mensal */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-7 gap-2"
                >
                    {dias.map(({ data, diaMes, mesAtual }) => {
                        const slotsDoDia = agendaNormalizada[data] ?? [];

                        return (
                            <div
                                key={data}
                                className={`min-h-[120px] cursor-pointer rounded-xl border border-border bg-card p-2 transition-colors hover:bg-muted/30 ${
                                    mesAtual ? '' : 'opacity-50'
                                }`}
                                onClick={(e) => {
                                    if (e.target === e.currentTarget) {
                                        setCreatingSlotDate(data);
                                    }
                                }}
                            >
                                <div className="mb-1 text-sm font-semibold text-foreground">{diaMes}</div>

                                <div className="space-y-1">
                                    {slotsDoDia.map((slot) => (
                                        <div
                                            key={slot.id}
                                            className="cursor-pointer rounded-md border p-1 text-xs"
                                            style={{ backgroundColor: slot.team.cor + '15', borderColor: slot.team.cor }}
                                            onClick={() => setSlotModal(slot)}
                                        >
                                            {slot.hora_inicio} — {slot.hora_fim}
                                            <br />
                                            {slot.team.nome}
                                            <br />
                                            <div className="mt-1 font-semibold">Nº de cirurgias: {slot.schedules.length}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </motion.div>

                {creatingSlotDate && (
                    <CreateSlotModal
                        date={creatingSlotDate}
                        onClose={() => {
                            setCreatingSlotDate(null);
                            router.reload({ only: ['agenda'] });
                        }}
                    />
                )}

                {slotModal && <SlotModal slot={slotModal} teamColors={teamColors} close={() => setSlotModal(null)} refreshSlot={refreshSlotModal} />}
            </div>
        </AppLayout>
    );
}
