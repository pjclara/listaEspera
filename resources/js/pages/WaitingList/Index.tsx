import AdminObservacoesModal from '@/components/waiting-lists/AdminObservacoesModal';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, PageProps, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

import ScheduleModal from '@/components/waiting-lists/ScheduleModal';
import { BreadcrumbItem } from '@/types';
import { usePage } from '@inertiajs/react';

export default function Index({
    waitingLists,
    filters,
    situacaoOptions,
    estadoOptions,
    equipaOptions,
    slotsDisponiveis,
    prioridadeOptionsState,
}: PageProps<{
    waitingLists: any;
    filters: any;
    situacaoOptions: string[];
    estadoOptions: string[];
    equipaOptions: { id: number; nome: string }[];
    slotsDisponiveis: {
        id: number;
        team_id: number;
        team: { id: number; nome: string };
        sala: string;
        data: string;
        hora_inicio: string;
        hora_fim: string;
        tipo: 'programado' | 'ambulatorio' | 'urgente';
        is_swapped: boolean;
    }[];
}>) {
    const safeFilters = filters ?? {};

    const [numProcesso, setNumProcesso] = useState(safeFilters.num_processo ?? '');
    const [situacao, setSituacao] = useState(Array.isArray(safeFilters.situacao) ? safeFilters.situacao : []);
    const [showSituacaoDropdown, setShowSituacaoDropdown] = useState(false);
    const [prioridade, setPrioridade] = useState(safeFilters.prioridade ?? '');

    const [estado, setEstado] = useState(safeFilters.estado ?? '');
    //des_diagnostico
    const [desDiagnostico, setDesDiagnostico] = useState(safeFilters.des_diagnostico ?? '');

    const situacaoOptionsState = situacaoOptions ?? [];
    const estadoOptionsState = estadoOptions ?? [];

    const [showModal, setShowModal] = useState(false);
    const [selected, setSelected] = useState<any>(null);

    const { errors } = usePage().props;

    const [form, setForm] = useState({
        contactado: false,
        data_contacto: '',
        contactado_por: '',
        observacoes: '',
    });

    useEffect(() => {
        if (typeof safeFilters.situacao === 'string') {
            setSituacao([safeFilters.situacao]);
        }
    }, []);

    const openModal = (item: any) => {
        setSelected(item);

        // format data
        const formattedData = item.admin?.data_contacto ? new Date(item.admin.data_contacto).toISOString().split('T')[0] : '';

        setForm({
            contactado: item.admin?.contactado ?? false,
            data_contacto: formattedData,
            contactado_por: item.admin?.contactado_por ?? '',
            observacoes: item.admin?.observacoes ?? '',
        });

        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelected(null);
    };

    const applyFilters = () => {
        router.get(
            '/waiting-lists',
            {
                num_processo: numProcesso,
                situacao: situacao,
                estado: estado,
                des_diagnostico: desDiagnostico,
                prioridade: prioridade,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [scheduleForm, setScheduleForm] = useState({
        slot_id: '',
        duracao_estimada: '',
    });
    const [selectedSchedule, setSelectedSchedule] = useState(null);

    const openScheduleModal = (item: any) => {
        setSelectedSchedule(item);

        if (item.schedule) {
            // modo edição
            setScheduleForm({
                slot_id: item.schedule.slot_id,
                duracao_estimada: item.schedule.duracao_estimada,
            });
        } else {
            // modo criação
            setScheduleForm({
                slot_id: '',
                duracao_estimada: '',
            });
        }

        setShowScheduleModal(true);
    };

    useEffect(() => {
        if (typeof safeFilters.situacao === 'string') {
            setSituacao([safeFilters.situacao]);
        }
    }, []);

    const closeScheduleModal = () => {
        setShowScheduleModal(false);
        setSelectedSchedule(null);
    };

    const updateEstado = (newEstado: string) => {
        setEstado(newEstado);

        router.get(
            '/waiting-lists',
            {
                num_processo: numProcesso,
                situacao: situacao,
                estado: newEstado,
                des_diagnostico: desDiagnostico,
                prioridade: prioridade,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    // quando situacao muda, atualizar a lista
    useEffect(() => {
        router.get(
            '/waiting-lists',
            {
                num_processo: numProcesso,
                situacao,
                estado,
                des_diagnostico: desDiagnostico,
                prioridade,
            },
            {
                preserveState: true,
                preserveScroll: true,
                only: ['waitingLists'], // <- nome da prop que recebes no Inertia
            },
        );
    }, [situacao, estado, prioridade, numProcesso, desDiagnostico]);

    const updatePrioridade = (newSituacao: string) => {
        setPrioridade(newSituacao);

        router.get(
            '/waiting-lists',
            {
                num_processo: numProcesso,
                situacao: situacao,
                estado: estado,
                des_diagnostico: desDiagnostico,
                prioridade: newSituacao,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const hasAdminData = (item: any) => {
        const admin = item.admin;

        if (!admin) return false;

        return admin.contactado || admin.data_contacto || admin.contactado_por || admin.observacoes;
    };

    const exportExcel = () => {
        const params = new URLSearchParams({
            num_processo: numProcesso,
            estado: estado,
            des_diagnostico: desDiagnostico,
        });
        situacao.forEach((item) => params.append('situacao[]', item));
        window.location.href = route('waiting.export') + '?' + params.toString();
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Lista de Espera',
            href: '/waiting-lists',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Lista de Espera" />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight">Lista de Espera</h1>

                    <Link href="/waiting-list/import" className="rounded-lg bg-blue-600 px-4 py-2 text-white shadow transition hover:bg-blue-700">
                        Importar Excel
                    </Link>
                </div>

                {/* FILTROS */}
                <div className="flex flex-wrap items-end gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow">
                    <div className="flex flex-col">
                        <label className="mb-1 text-sm text-gray-600">Nº Processo</label>
                        <input
                            type="text"
                            value={numProcesso}
                            onChange={(e) => setNumProcesso(e.target.value)}
                            className="rounded border px-3 py-2"
                            placeholder="Ex: 12345"
                        />
                    </div>

                    <div className="flex flex-col">
                        <label className="mb-1 text-sm text-gray-600">Descrição Diagnóstico</label>
                        <input
                            type="text"
                            value={desDiagnostico}
                            onChange={(e) => setDesDiagnostico(e.target.value)}
                            className="rounded border px-3 py-2"
                            placeholder="Ex: Diagnóstico"
                        />
                    </div>

                    <div className="relative flex flex-col">
                        <label className="mb-1 block text-sm text-gray-600">Situação</label>

                        <button
                            type="button"
                            onClick={() => setShowSituacaoDropdown((prev) => !prev)}
                            className="w-full rounded border px-3 py-2 text-left"
                        >
                            {situacao.length === 0 ? (
                                <span className="text-gray-500">Todas</span>
                            ) : (
                                <div className="flex flex-wrap gap-1">
                                    {situacao.map((s) => (
                                        <span key={s} className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-700">
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </button>

                        {showSituacaoDropdown && (
                            <div className="absolute top-full left-0 z-50 mt-1 w-full rounded border bg-white shadow">
                                {situacaoOptionsState.map((option) => {
                                    const checked = situacao.includes(option);

                                    return (
                                        <label key={option} className="flex cursor-pointer items-center gap-2 px-3 py-2 hover:bg-gray-100">
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() => {
                                                    if (checked) {
                                                        setSituacao(situacao.filter((s) => s !== option));
                                                    } else {
                                                        setSituacao([...situacao, option]);
                                                    }
                                                }}
                                            />
                                            {option}
                                        </label>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col">
                        <label className="mb-1 text-sm text-gray-600">Prioridade</label>
                        <select value={prioridade} onChange={(e) => updatePrioridade(e.target.value)} className="rounded border px-3 py-2">
                            <option value="">Todas</option>
                            {prioridadeOptionsState.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col">
                        <label className="mb-1 text-sm text-gray-600">Estado</label>
                        <select value={estado} onChange={(e) => updateEstado(e.target.value)} className="rounded border px-3 py-2">
                            <option value="">Todos</option>
                            {estadoOptionsState.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col justify-end">
                        <button onClick={applyFilters} className="rounded bg-blue-600 px-4 py-2 text-white shadow transition hover:bg-blue-700">
                            Filtrar
                        </button>
                    </div>

                    <div className="flex flex-col justify-end">
                        <button onClick={exportExcel} className="rounded bg-green-600 px-4 py-2 text-white shadow transition hover:bg-green-700">
                            Exportar Excel
                        </button>
                    </div>
                </div>

                {/* TABELA */}
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow">
                    <table className="w-full border-collapse">
                        <thead className="sticky top-0 z-10 bg-gray-50">
                            <tr className="text-left text-sm font-medium text-gray-600">
                                <th className="px-4 py-3">ID</th>
                                <th className="px-4 py-3">Nº Processo</th>
                                <th className="px-4 py-3">Prioridade</th>
                                <th className="px-4 py-3">P. Absoluta</th>
                                <th className="px-4 py-3">P. Relativa</th>
                                <th className="px-4 py-3">Diagnóstico</th>
                                <th className="px-4 py-3">Data LE</th>
                                <th className="px-4 py-3">Situação</th>
                                <th className="px-4 py-3">Contactos</th>
                            </tr>
                        </thead>

                        <tbody className="text-sm text-gray-700">
                            {waitingLists.data.map((i: any, idx: number) => (
                                <tr key={i.id} className={`transition hover:bg-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                    <td className="px-4 py-3 font-medium text-gray-900">{i.id}</td>
                                    <td className="px-4 py-3">{i.num_processo}</td>
                                    <td className="px-4 py-3">{i.prioridade}</td>
                                    <td className="px-4 py-3">{i.posicao_lista ?? '—'}</td>
                                    <td className="px-4 py-3">{i.posicao_patologia ?? '—'}</td>
                                    <td className="px-4 py-3">{i.des_diagnostico}</td>
                                    <td className="px-4 py-3">{new Date(i.data_marcacao).toLocaleDateString()}</td>
                                    <td className="px-4 py-3">{i.situacao}</td>
                                    <td className="px-4 py-3">{i.contacts?.length ?? 0}</td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => openModal(i)}
                                            className={`rounded px-3 py-1 text-sm text-white transition ${
                                                hasAdminData(i) ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-700 hover:bg-gray-800'
                                            }`}
                                        >
                                            Observações
                                        </button>
                                    </td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => openScheduleModal(i)}
                                            className={`rounded px-3 py-1 text-sm text-white transition ${i.schedule ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} `}
                                        >
                                            Agendar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* PAGINAÇÃO */}
                <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                        Página {waitingLists.current_page} de {waitingLists.last_page}
                    </div>

                    <div className="flex gap-2">
                        {waitingLists.links.map((link: any, idx: number) => (
                            <Link
                                key={idx}
                                href={link.url ?? '#'}
                                preserveScroll
                                preserveState
                                className={`rounded border px-3 py-2 text-sm transition ${
                                    link.active
                                        ? 'border-blue-600 bg-blue-600 text-white'
                                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100'
                                } ${!link.url && 'cursor-not-allowed opacity-40'}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                </div>
            </div>
            <AdminObservacoesModal open={showModal} selected={selected} form={form} setForm={setForm} errors={errors} onClose={closeModal} />
            <ScheduleModal
                open={showScheduleModal}
                selected={selectedSchedule}
                scheduleForm={scheduleForm}
                setScheduleForm={setScheduleForm}
                slotsDisponiveis={slotsDisponiveis}
                onClose={closeScheduleModal}
            />
        </AppLayout>
    );
}
