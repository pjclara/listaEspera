import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';

import SecretariaRespostaModal from '@/components/waiting-lists/SecretariaRespostaModal';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';

export default function ChamadasPendentes() {
    const { chamadas } = usePage().props;

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
            <Head title="Chamadas" />
            <div className="mx-auto max-w-6xl space-y-10 py-10">
                <h1 className="text-3xl font-bold text-gray-900">Chamadas Pendentes</h1>
                <p className="text-gray-600">Pedidos de chamada feitos pela equipa e ainda sem resposta da secretaria.</p>

                {/* Filtros */}
                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-lg font-semibold">Filtros</h2>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        <div>
                            <label className="text-sm text-gray-700">Tipo de chamada</label>
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

                {/* Contadores */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                        <p className="text-sm text-gray-500">Total pendentes</p>
                        <p className="text-3xl font-bold">{chamadasFiltradas.length}</p>
                    </div>

                    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                        <p className="text-sm text-gray-500">Ambulatório</p>
                        <p className="text-3xl font-bold">{chamadasFiltradas.filter((c: any) => c.tipo_chamada === 'Ambulatorio').length}</p>
                    </div>

                    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                        <p className="text-sm text-gray-500">Base / SIGIC</p>
                        <p className="text-3xl font-bold">
                            {chamadasFiltradas.filter((c: any) => ['Base', 'SIGIC'].includes(c.tipo_chamada)).length}
                        </p>
                    </div>
                </div>

                {/* Tabela */}
                <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doente</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pedido por</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data pedido</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-200 bg-white">
                            {chamadasFiltradas.map((c: any) => (
                                <tr key={c.id}>
                                    <td className="px-6 py-4">
                                        <div className="font-semibold">{c.doente.nome_clinico}</div>
                                        <div className="text-sm text-gray-500">{c.doente.des_diagnostico}</div>
                                    </td>

                                    <td className="px-6 py-4">{c.tipo_chamada}</td>

                                    <td className="px-6 py-4">{c.pedido_por_user?.name}</td>

                                    <td className="px-6 py-4">{c.pedido_em}</td>

                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => abrirModal(c)}
                                            className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                                        >
                                            Responder
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {chamadasFiltradas.length === 0 && <p className="py-6 text-center text-gray-500">Nenhuma chamada pendente encontrada.</p>}
                </div>
            </div>

            <SecretariaRespostaModal open={modalAberto} onClose={fecharModal} call={callSelecionada} doente={doenteSelecionado} />
        </AppLayout>
    );
}
