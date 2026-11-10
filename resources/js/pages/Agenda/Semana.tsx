import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { CalendarDays, FileDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SlotModal } from '../Slots/SlotModal';

function parseYmdLocal(ymd: string): Date {
    const [year, month, day] = ymd.split('-').map(Number);

    // Meio-dia para evitar transições DST à meia-noite
    return new Date(year, month - 1, day, 12, 0, 0, 0);
}

function formatYmdLocal(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

export default function Semana({
    agenda,
    start,
    end,
    teamColors,
}: {
    agenda: Record<string, any[]>;
    start: string;
    end: string;
    teamColors: Record<number, string>;
}) {
    const [slotModal, setSlotModal] = useState<any | null>(null);
    const { agenda: agendaAtualizada } = usePage().props as unknown as { agenda: Record<string, any[]> };

    const agendaNormalizada: Record<string, any[]> = {};
    Object.keys(agenda).forEach((key) => {
        agendaNormalizada[key.slice(0, 10)] = agenda[key];
    });

    const agendaNormalizadaAtualizada: Record<string, any[]> = {};
    Object.keys(agendaAtualizada).forEach((key) => {
        agendaNormalizadaAtualizada[key.slice(0, 10)] = agendaAtualizada[key];
    });

    const diasSemana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];

    // ORDENAR AS DATAS
    const datasOrdenadas = Object.keys(agendaNormalizada).sort((a, b) => parseYmdLocal(a).getTime() - parseYmdLocal(b).getTime());

    // MAPEAR PELO DIA REAL DA SEMANA (Seg=1 ... Sex=5)
    const mapaDias: Record<string, string | null> = {
        Segunda: null,
        Terça: null,
        Quarta: null,
        Quinta: null,
        Sexta: null,
    };

    for (const data of datasOrdenadas) {
        const weekday = parseYmdLocal(data).getDay();

        if (weekday >= 1 && weekday <= 5) {
            mapaDias[diasSemana[weekday - 1]] = data;
        }
    }

    function mudarSemana(offset: number) {
        if (offset === 0) {
            router.get('/agenda/semana', {
                start: formatYmdLocal(new Date()),
            });
            return;
        }

        const novaData = parseYmdLocal(start);
        novaData.setDate(novaData.getDate() + offset * 7);

        router.get('/agenda/semana', {
            start: formatYmdLocal(novaData),
        });
    }

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
            type: 'semana',
            start,
        });

        window.open(`/agenda/export/pdf?${params.toString()}`, '_blank');
    }

    useEffect(() => {
        refreshSlotModal();
    }, [agendaAtualizada]);

    return (
        <AppLayout breadcrumbs={[{ title: 'Agenda Cirúrgica', href: '/agenda' }]}>
            <Head title="Agenda Cirúrgica - Semana" />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <PageHeader
                    title={`Semana ${start} → ${end}`}
                    icon={<CalendarDays className="size-5" />}
                    actions={
                        <>
                            <Button variant="outline" onClick={exportarPdf}>
                                <FileDown className="size-4" />
                                Exportar PDF
                            </Button>
                            <Button variant="secondary" onClick={() => mudarSemana(-1)}>
                                Semana anterior
                            </Button>
                            <Button variant="secondary" onClick={() => mudarSemana(0)}>
                                Hoje
                            </Button>
                            <Button variant="secondary" onClick={() => mudarSemana(1)}>
                                Próxima semana
                            </Button>
                        </>
                    }
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    {diasSemana.map((diaNome, idx) => {
                        const data = mapaDias[diaNome];

                        return (
                            <motion.div
                                key={diaNome}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: idx * 0.05 }}
                                className="rounded-xl border border-border bg-card p-3 shadow-sm"
                            >
                                <h2 className="mb-3 text-lg font-semibold text-foreground">
                                    {diaNome}
                                    <br />
                                    <span className="text-muted-foreground text-sm font-normal">
                                        {data ? parseYmdLocal(data).toLocaleDateString('pt-PT') : ''}
                                    </span>
                                </h2>

                                <div className="space-y-3">
                                    {data &&
                                        agendaNormalizada[data]?.map((slot: any) => (
                                            <div
                                                key={slot.id}
                                                className="cursor-pointer rounded-lg border p-3 transition-transform hover:-translate-y-0.5"
                                                style={{
                                                    backgroundColor: slot.team.cor + '20',
                                                    borderColor: slot.team.cor,
                                                }}
                                                onClick={() => setSlotModal(slot)}
                                            >
                                                <div className="font-medium text-foreground">
                                                    {slot.hora_inicio} — {slot.hora_fim}
                                                </div>

                                                <div className="text-muted-foreground text-sm">Equipa: {slot.team.nome}</div>

                                                <div className="text-muted-foreground text-sm">Sala: {slot.sala || '—'}</div>

                                                <div className="mt-1 text-sm font-semibold text-foreground">
                                                    Nº de cirurgias agendadas: {slot.schedules.length}
                                                </div>
                                                {slot.schedules.length > 0 && (
                                                    <div className="mt-2 space-y-2">
                                                        {slot.schedules.map((sch: any) => (
                                                            <div
                                                                key={sch.id}
                                                                className="rounded-md border px-3 py-2 text-white shadow-sm"
                                                                style={{ backgroundColor: sch.estado_cor, borderColor: sch.estado_cor }}
                                                            >
                                                                <div className="text-sm font-medium">Doente: {sch.waiting_list?.num_processo}</div>
                                                                <div className="text-xs opacity-90">{sch.waiting_list?.des_diagnostico}</div>
                                                                <div className="mt-1 text-xs opacity-90">Estado: {sch.estado}</div>
                                                                <div className="text-xs opacity-90">
                                                                    Prioridade: {sch.waiting_list?.prioridade}
                                                                </div>
                                                                <div className="text-xs opacity-90">
                                                                    Posição: {sch.waiting_list?.posicao_lista} / {sch.waiting_list?.posicao_patologia}
                                                                </div>
                                                                <div className="text-xs opacity-90">Pernoita: {sch.pernoita}</div>
                                                                <div className="text-xs opacity-90">Duração: {sch.duracao_estimada} min</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {slotModal && <SlotModal slot={slotModal} teamColors={teamColors} close={() => setSlotModal(null)} refreshSlot={refreshSlotModal} />}
            </div>
        </AppLayout>
    );
}
