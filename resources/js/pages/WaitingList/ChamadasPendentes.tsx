import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';

import SecretariaRespostaModal from '@/components/waiting-lists/SecretariaRespostaModal';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';

export default function ChamadasPendentes() {
    const { chamadas, resultados } = usePage().props;

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
        console.log(call);
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
            <div className="mx-auto max-w-6xl space-y-10 py-10">
                <h1 className="text-3xl font-bold text-gray-900">Convocatórias Pendentes</h1>
                <p className="text-gray-600">Pedidos de convocatória feitos pela equipa e ainda sem resposta da secretaria.</p>

                {/* Filtros */}
                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-lg font-semibold">Filtros</h2>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        <div>
                            <label className="text-sm text-gray-700">Tipo de convocatória</label>
                            <select
                                value={filtro.tipo}
                                onChange={(e) => setFiltro({ ...filtro, tipo: e.target.value })}
                                className="mt-1 w-full rounded-lg border-gray-300"
                            >
                                <option value="">Todos</option>
                                <option value="Ambulatorio">Ambulatório</option>
                                <option value="Base">Base</option>
                                <option value="SIGIC">SIGIC</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-sm text-gray-700">Data do pedido</label>
                            <input
                                type="date"
                                value={filtro.data}
                                onChange={(e) => setFiltro({ ...filtro, data: e.target.value })}
                                className="mt-1 w-full rounded-lg border-gray-300"
                            />
                        </div>
                    </div>
                </div>

                {/* Tabela */}
                <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200 text-xs">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-2 text-left text-[10px] font-semibold tracking-wide uppercase">Doente</th>
                                <th className="px-3 py-2 text-left text-[10px] font-semibold tracking-wide uppercase">Tipo</th>
                                <th className="px-3 py-2 text-left text-[10px] font-semibold tracking-wide uppercase">Pedido por</th>
                                <th className="px-3 py-2 text-left text-[10px] font-semibold tracking-wide uppercase">Data pedido</th>
                                <th className="px-3 py-2 text-left text-[10px] font-semibold tracking-wide uppercase">Situação</th>
                                <th className="px-3 py-2 text-left text-[10px] font-semibold tracking-wide uppercase">Ações</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-200 bg-white">
                            {chamadasFiltradas.map((c: any) => {
                                const jaRespondida = !!c.estado_novo || !!c.data_agenda || !!c.observacoes_secretaria;

                                return (
                                    <tr key={c.id}>
                                        <td className="px-3 py-2">
                                            <div className="text-[14px] font-medium">{c.doente.nome}</div>
                                            <div className="text-[14px] text-gray-500">{c.doente.des_diagnostico}</div>
                                        </td>

                                        <td className="px-3 py-2">{c.tipo_chamada}</td>
                                        <td className="px-3 py-2">{c.pedido_por_user?.name}</td>
                                        <td className="px-3 py-2">{c.pedido_em}</td>
                                        <td className="px-3 py-2">{c.estado_novo}</td>

                                        <td className="px-3 py-2">
                                            <button
                                                onClick={() => abrirModal(c)}
                                                className={`rounded px-2 py-1 text-xs text-white transition ${
                                                    jaRespondida ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'
                                                }`}
                                            >
                                                {jaRespondida ? 'Editar' : 'Responder'}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {chamadasFiltradas.length === 0 && <p className="py-6 text-center text-gray-500">Nenhuma chamada pendente encontrada.</p>}
                </div>
            </div>

            <SecretariaRespostaModal open={modalAberto} onClose={fecharModal} call={callSelecionada} doente={doenteSelecionado} resultados={resultados} />
        </AppLayout>
    );
}
