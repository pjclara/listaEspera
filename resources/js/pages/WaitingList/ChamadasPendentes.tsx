import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import SecretariaRespostaModal from '@/components/waiting-lists/SecretariaRespostaModal';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { motion } from 'framer-motion';
import { CheckCircle2, PhoneCall } from 'lucide-react';

export default function ChamadasPendentes() {
    const { chamadas, resultados } = usePage().props as any;

    const [filtro, setFiltro] = useState({
        tipo: '',
        data: '',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
    ];

    const chamadasFiltradas = chamadas.filter((c: any) => {
        if (filtro.tipo && c.tipo_chamada !== filtro.tipo) return false;
        if (filtro.data && c.pedido_em.slice(0, 10) !== filtro.data) return false;
        return true;
    });

    const [modalAberto, setModalAberto] = useState(false);
    const [callSelecionada, setCallSelecionada] = useState(null);
    const [doenteSelecionado, setDoenteSelecionado] = useState(null);

    function abrirModal(call: any) {
        setCallSelecionada(call);
        setDoenteSelecionado(call.doente);
        setModalAberto(true);
    }

    function fecharModal() {
        setModalAberto(false);
        setCallSelecionada(null);
        setDoenteSelecionado(null);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Convocatórias" />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <PageHeader
                    title="Convocatórias Pendentes"
                    description="Pedidos de convocatória feitos pela equipa e ainda sem resposta da secretaria."
                    icon={<PhoneCall className="size-5" />}
                />

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 }}
                    className="rounded-xl border border-border bg-card p-5 shadow-sm"
                >
                    <h2 className="mb-4 text-sm font-semibold text-foreground">Filtros</h2>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div>
                            <label className="text-muted-foreground mb-1 block text-sm">Tipo de convocatória</label>
                            <select
                                value={filtro.tipo}
                                onChange={(e) => setFiltro({ ...filtro, tipo: e.target.value })}
                                className="border-input bg-background focus:ring-ring w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
                            >
                                <option value="">Todos</option>
                                <option value="Ambulatorio">Ambulatório</option>
                                <option value="Base">Base</option>
                                <option value="SIGIC">SIGIC</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-muted-foreground mb-1 block text-sm">Data do pedido</label>
                            <input
                                type="date"
                                value={filtro.data}
                                onChange={(e) => setFiltro({ ...filtro, data: e.target.value })}
                                className="border-input bg-background focus:ring-ring w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
                            />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
                >
                    {chamadasFiltradas.length === 0 ? (
                        <EmptyState
                            icon={CheckCircle2}
                            title="Nenhuma chamada pendente"
                            description="Não há convocatórias à espera de resposta da secretaria para os filtros selecionados."
                        />
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Doente</TableHead>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead>Pedido por</TableHead>
                                    <TableHead>Data pedido</TableHead>
                                    <TableHead>Situação</TableHead>
                                    <TableHead>Ações</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {chamadasFiltradas.map((c: any, idx: number) => {
                                    const jaRespondida = !!c.estado_novo || !!c.data_agenda || !!c.observacoes_secretaria;

                                    return (
                                        <motion.tr
                                            key={c.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.2, delay: idx * 0.03 }}
                                            className="hover:bg-muted/40 border-b border-border transition-colors last:border-0"
                                        >
                                            <TableCell>
                                                <div className="font-medium text-foreground">{c.doente.nome}</div>
                                                <div className="text-muted-foreground text-xs">{c.doente.des_diagnostico}</div>
                                            </TableCell>

                                            <TableCell className="text-muted-foreground">{c.tipo_chamada}</TableCell>
                                            <TableCell className="text-muted-foreground">{c.pedido_por_user?.name}</TableCell>
                                            <TableCell className="text-muted-foreground">{c.pedido_em}</TableCell>
                                            <TableCell>
                                                {c.estado_novo ? (
                                                    <Badge variant="secondary" className="font-normal">
                                                        {c.estado_novo}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-muted-foreground">—</span>
                                                )}
                                            </TableCell>

                                            <TableCell>
                                                <button
                                                    onClick={() => abrirModal(c)}
                                                    className={`rounded-lg px-3 py-1.5 text-xs font-medium text-white shadow-sm transition ${
                                                        jaRespondida ? 'bg-primary hover:bg-primary/90' : 'bg-success hover:bg-success/90'
                                                    }`}
                                                >
                                                    {jaRespondida ? 'Editar' : 'Responder'}
                                                </button>
                                            </TableCell>
                                        </motion.tr>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </motion.div>
            </div>

            <SecretariaRespostaModal open={modalAberto} onClose={fecharModal} call={callSelecionada} doente={doenteSelecionado} resultados={resultados} />
        </AppLayout>
    );
}
