import { Button } from '@/components/ui/button';
import { SituacaoBadge } from '@/components/ui/SituacaoBadge';
import AdminObservacoesModal from '@/components/waiting-lists/AdminObservacoesModal';
import ObservacoesGeraisModal from '@/components/waiting-lists/ObservacoesGeraisModal';
import PedirChamadaModal from '@/components/waiting-lists/PedirChamadaModal';
import ScheduleModal from '@/components/waiting-lists/ScheduleModal';
import SituacaoInternaModal from '@/components/waiting-lists/SituacaoInternaModal';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, PageProps, router, usePage } from '@inertiajs/react';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

type SlotDisponivel = {
    id: number;
    team_id: number;
    team: { id: number; nome: string };
    sala: string;
    data: string;
    hora_inicio: string;
    hora_fim: string;
    tipo: 'programado' | 'ambulatorio' | 'urgente';
    is_swapped: boolean;
};

type WaitingListItem = {
    id: number;
    num_processo: string;
    prioridade?: string | null;
    posicao_lista?: number | null;
    posicao_patologia?: number | null;
    des_diagnostico?: string | null;
    data_marcacao?: string | null;
    situacao?: string | null;
    situacao_interna?: string | null;
    situacao_color?: string | null;
    contacts?: unknown[];
    observacoes_gerais?: string | null;
    observacoes_secretaria?: string | null;
    admin?: {
        contactado?: boolean | null;
        data_contacto?: string | null;
        contactado_por?: string | null;
        observacoes?: string | null;
    } | null;
    schedule?: {
        slot_id: string | number;
        duracao_estimada: string | number;
        estado: string;
    } | null;
    call?: {
        id?: number;
    } | null;
};

type Filters = {
    num_processo?: string;
    situacao?: string[] | string;
    prioridade?: string;
    estado?: string;
    des_diagnostico?: string;
};

type ContactForm = {
    contactado: boolean;
    data_contacto: string;
    contactado_por: string;
    observacoes: string;
};

type ScheduleForm = {
    slot_id: string;
    duracao_estimada: string;
    estado: string;
};

type ObservacoesGeraisForm = {
    observacoes_secretaria: string;
};

type CallForm = {
    tipo_chamada: string;
    data_pretendida: string;
    observacoes: string;
};

export default function Index({
    waitingLists,
    filters,
    situacaoOptions,
    estadoOptions,
    equipaOptions,
    slotsDisponiveis,
    prioridadeOptionsState,
    permissions,
    resultados,
}: PageProps<{
    waitingLists: {
        data: WaitingListItem[];
        current_page: number;
        last_page: number;
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
    };
    filters: Filters;
    situacaoOptions: string[];
    estadoOptions: string[];
    equipaOptions: { id: number; nome: string }[];
    slotsDisponiveis: SlotDisponivel[];
    prioridadeOptionsState: string[];
    permissions: string[];
    resultados: string[];
}>) {
    const safeFilters = filters ?? {};

    const initialSituacao = useMemo(() => {
        if (Array.isArray(safeFilters.situacao)) {
            return safeFilters.situacao;
        }

        if (typeof safeFilters.situacao === 'string' && safeFilters.situacao !== '') {
            return [safeFilters.situacao];
        }

        return [];
    }, [safeFilters.situacao]);

    const [numProcesso, setNumProcesso] = useState(safeFilters.num_processo ?? '');
    const [situacao, setSituacao] = useState<string[]>(initialSituacao);
    const [showSituacaoDropdown, setShowSituacaoDropdown] = useState(false);
    const [prioridade, setPrioridade] = useState(safeFilters.prioridade ?? '');
    const [estado, setEstado] = useState(safeFilters.estado ?? '');
    const [desDiagnostico, setDesDiagnostico] = useState(safeFilters.des_diagnostico ?? '');

    const [showContactModal, setShowContactModal] = useState(false);
    const [selectedContact, setSelectedContact] = useState<WaitingListItem | null>(null);
    const [contactForm, setContactForm] = useState<ContactForm>({
        contactado: false,
        data_contacto: '',
        contactado_por: '',
        observacoes: '',
    });

    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState<WaitingListItem | null>(null);
    const [scheduleForm, setScheduleForm] = useState<ScheduleForm>({
        slot_id: '',
        duracao_estimada: '',
        estado: '',
    });

    const [showObservacoesGeraisModal, setShowObservacoesGeraisModal] = useState(false);
    const [selectedObservacoes, setSelectedObservacoes] = useState<WaitingListItem | null>(null);
    const [observacoesGeraisForm, setObservacoesGeraisForm] = useState<ObservacoesGeraisForm>({
        observacoes_secretaria: '',
    });

    const [doenteSelecionado, setDoenteSelecionado] = useState<string | null>(null);

    const { errors } = usePage().props as { errors: Record<string, string> };

    useEffect(() => {
        setSituacao(initialSituacao);
    }, [initialSituacao]);

    const filterParams = () => ({
        num_processo: numProcesso,
        situacao,
        estado,
        des_diagnostico: desDiagnostico,
        prioridade,
    });

    const applyFilters = () => {
        router.get('/waiting-lists', filterParams(), {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const resetFilters = () => {
        setNumProcesso('');
        setSituacao([]);
        setPrioridade('');
        setEstado('');
        setDesDiagnostico('');

        router.get(
            '/waiting-lists',
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const exportExcel = () => {
        const params = new URLSearchParams();

        if (numProcesso) params.set('num_processo', numProcesso);
        if (estado) params.set('estado', estado);
        if (desDiagnostico) params.set('des_diagnostico', desDiagnostico);
        if (prioridade) params.set('prioridade', prioridade);

        situacao.forEach((item) => params.append('situacao[]', item));

        window.location.href = `${route('waiting.export')}?${params.toString()}`;
    };

    const closeContactModal = () => {
        setShowContactModal(false);
        setSelectedContact(null);
    };

    const closeScheduleModal = () => {
        setShowScheduleModal(false);
        setSelectedSchedule(null);
    };

    const openObservacoesGeraisModal = (item: WaitingListItem) => {
        setSelectedObservacoes(item);
        setObservacoesGeraisForm({
            observacoes_secretaria: item.observacoes_secretaria ?? '',
        });
        setShowObservacoesGeraisModal(true);
    };

    const closeObservacoesGeraisModal = () => {
        setShowObservacoesGeraisModal(false);
        setSelectedObservacoes(null);
    };

    const [modalAberto, setModalAberto] = useState(false);

    function modalAbertoPedirChamadaModal(doente: any) {
        setDoenteSelecionado(doente);
        setModalAberto(true);
    }

    function fecharModalPedirChamadaModal() {
        setModalAberto(false);
        setDoenteSelecionado(null);
    }

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Lista de Espera',
            href: '/waiting-lists',
        },
    ];

    const [colunasVisiveis, setColunasVisiveis] = useState({
        prioridade: false,
        posicao_lista: false,
        posicao_patologia: false,
        des_diagnostico: true,
        data_marcacao: true,
        situacao: true,
        situacao_interna: true,
        observacoes: true,
        convocar: true,
    });

    const [modalSituacao, setModalSituacao] = useState(false);
    const [doenteSituacao, setDoenteSituacao] = useState(null);

    function abrirModalSituacao(doente: any) {
        setDoenteSituacao(doente);
        setModalSituacao(true);
    }

    function fecharModalSituacao() {
        setModalSituacao(false);
        setDoenteSituacao(null);
    }

    const copiar = async (texto) => {
        await navigator.clipboard.writeText(texto);
        toast.success('Copiado!');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Lista de Espera" />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight">Lista de Espera</h1>

                    {permissions.includes('waiting_list.import') && (
                        <Link href="/waiting-list/import" className="rounded-lg bg-blue-600 px-4 py-2 text-white shadow transition hover:bg-blue-700">
                            Importar Excel
                        </Link>
                    )}
                </div>

                <div className="flex flex-wrap items-end gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow">
                    <div className="flex flex-col">
                        <label className="mb-1 text-sm text-gray-600">Nº Processo</label>
                        <input
                            type="text"
                            value={numProcesso}
                            onChange={(e) => setNumProcesso(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') applyFilters();
                            }}
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
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') applyFilters();
                            }}
                            className="rounded border px-3 py-2"
                            placeholder="Ex: Diagnóstico"
                        />
                    </div>

                    <div className="relative flex min-w-[220px] flex-col">
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
                                {situacaoOptions.map((option) => {
                                    const checked = situacao.includes(option);

                                    return (
                                        <label key={option} className="flex cursor-pointer items-center gap-2 px-3 py-2 hover:bg-gray-100">
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() => {
                                                    setSituacao((current) => (checked ? current.filter((s) => s !== option) : [...current, option]));
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
                        <select value={prioridade} onChange={(e) => setPrioridade(e.target.value)} className="rounded border px-3 py-2">
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
                        <select value={estado} onChange={(e) => setEstado(e.target.value)} className="rounded border px-3 py-2">
                            <option value="">Todos</option>
                            {estadoOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={applyFilters}
                            className="rounded bg-blue-600 px-4 py-2 text-white shadow transition hover:bg-blue-700"
                        >
                            Filtrar
                        </button>

                        <button
                            type="button"
                            onClick={resetFilters}
                            className="rounded bg-gray-200 px-4 py-2 text-gray-800 shadow transition hover:bg-gray-300"
                        >
                            Limpar
                        </button>

                        <button
                            type="button"
                            onClick={exportExcel}
                            className="rounded bg-green-600 px-4 py-2 text-white shadow transition hover:bg-green-700"
                        >
                            Exportar Excel
                        </button>
                    </div>
                </div>

                <div className="mb-4 flex flex-wrap gap-4 rounded-lg bg-gray-100 p-4">
                    {Object.keys(colunasVisiveis).map((col) => (
                        <label key={col} className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={colunasVisiveis[col]}
                                onChange={() =>
                                    setColunasVisiveis({
                                        ...colunasVisiveis,
                                        [col]: !colunasVisiveis[col],
                                    })
                                }
                                className="rounded"
                            />
                            {col.replace(/_/g, ' ').toUpperCase()}
                        </label>
                    ))}
                </div>

                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead className="sticky top-0 z-10 bg-gray-50">
                                <tr className="text-left text-sm font-medium text-gray-600">
                                    <th className="px-4 py-3">Nº Lista</th>
                                    <th className="px-4 py-3">Nº Processo</th>
                                    {colunasVisiveis.prioridade && <th className="px-4 py-3">Prioridade</th>}
                                    {colunasVisiveis.posicao_lista && <th className="px-4 py-3">P. Absoluta</th>}
                                    {colunasVisiveis.posicao_patologia && <th className="px-4 py-3">P. Relativa</th>}
                                    {colunasVisiveis.des_diagnostico && <th className="px-4 py-3">Diagnóstico</th>}
                                    {colunasVisiveis.data_marcacao && <th className="px-4 py-3">Data LE</th>}
                                    {colunasVisiveis.situacao && <th className="px-4 py-3">Situação</th>}
                                    {colunasVisiveis.situacao_interna && <th className="px-4 py-3">Situação Interna</th>}
                                    {colunasVisiveis.observacoes && <th className="px-4 py-3">Observações</th>}
                                    {colunasVisiveis.convocar && <th className="px-4 py-3 text-right">Convocar</th>}
                                </tr>
                            </thead>
                            <tbody className="text-sm text-gray-700">
                                {waitingLists.data.map((i, idx) => (
                                    <Fragment key={i.id}>
                                        <tr className={`transition hover:bg-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                            <td className="px-4 py-3 font-medium text-gray-900">{i.id}</td>

                                            <td
                                                className="cursor-pointer px-4 py-3 text-center hover:bg-gray-300"
                                                title="Clique para copiar"
                                                onClick={() => copiar(i.num_processo)}
                                            >
                                                {i.num_processo}
                                            </td>

                                            {colunasVisiveis.prioridade && <td className="px-4 py-3">{i.prioridade ?? '—'}</td>}

                                            {colunasVisiveis.posicao_lista && <td className="px-4 py-3">{i.posicao_lista ?? '—'}</td>}

                                            {colunasVisiveis.posicao_patologia && <td className="px-4 py-3">{i.posicao_patologia ?? '—'}</td>}

                                            {colunasVisiveis.des_diagnostico && <td className="px-4 py-3">{i.des_diagnostico ?? '—'}</td>}

                                            {colunasVisiveis.data_marcacao && (
                                                <td className="px-4 py-3">
                                                    {i.data_marcacao ? new Date(i.data_marcacao).toLocaleDateString('pt-PT') : '—'}
                                                </td>
                                            )}

                                            {colunasVisiveis.situacao && <td className="px-4 py-3">{i.situacao ?? '—'}</td>}

                                            {colunasVisiveis.situacao_interna && (
                                                <td className="cursor-pointer px-4 py-3 hover:bg-gray-100" onClick={() => abrirModalSituacao(i)}>
                                                    <SituacaoBadge label={i.situacao_interna} color={i.situacao_color} />
                                                </td>
                                            )}

                                            {colunasVisiveis.observacoes && (
                                                <td className="px-4 py-3">
                                                    <Button
                                                        type="button"
                                                        onClick={() => openObservacoesGeraisModal(i)}
                                                        variant={i.observacoes_secretaria ? 'observacoesPreenchidas' : 'observacoes'}
                                                        size="sm"
                                                        className="cursor-pointer"
                                                    >
                                                        Observações
                                                    </Button>
                                                </td>
                                            )}

                                            {colunasVisiveis.convocar && (
                                                <td className="px-4 py-3 text-right">
                                                    <Button
                                                        onClick={() => modalAbertoPedirChamadaModal(i.id)}
                                                        disabled={i.situacao_interna != 'Ativo'}
                                                        title={i.call?.id ? 'Já existe uma chamada pendente' : 'Convocar'}
                                                        variant={i.call?.id ? 'convocado' : 'convocar'}
                                                        size="sm"
                                                        className="cursor-pointer"
                                                    >
                                                        {i.call?.id ? 'Convocado' : 'Convocar'}
                                                    </Button>
                                                </td>
                                            )}
                                        </tr>
                                        {(i.observacoes_gerais || i.observacoes_secretaria) && (
                                            <tr className="bg-gray-500">
                                                <td colSpan={12} className="px-4 py-2 text-white">
                                                    <div className="whitespace-pre-wrap">
                                                        {i.observacoes_gerais} {i.observacoes_secretaria}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </Fragment>
                                ))}

                                {waitingLists.data.length === 0 && (
                                    <tr>
                                        <td colSpan={12} className="px-4 py-8 text-center text-gray-500">
                                            Não existem registos para os filtros seleccionados.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-sm text-gray-600">
                        Página {waitingLists.current_page} de {waitingLists.last_page}
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {waitingLists.links.map((link, idx) => (
                            <Link
                                key={idx}
                                href={link.url ?? '#'}
                                preserveScroll
                                preserveState
                                data={filterParams()}
                                className={`rounded border px-3 py-2 text-sm transition ${
                                    link.active
                                        ? 'border-blue-600 bg-blue-600 text-white'
                                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100'
                                } ${!link.url ? 'cursor-not-allowed opacity-40' : ''}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <AdminObservacoesModal
                open={showContactModal}
                selected={selectedContact}
                form={contactForm}
                setForm={setContactForm}
                errors={errors}
                onClose={closeContactModal}
                permissions={permissions}
            />

            <ScheduleModal
                open={showScheduleModal}
                selected={selectedSchedule}
                scheduleForm={scheduleForm}
                setScheduleForm={setScheduleForm}
                slotsDisponiveis={slotsDisponiveis}
                onClose={closeScheduleModal}
                permissions={permissions}
            />

            <ObservacoesGeraisModal
                open={showObservacoesGeraisModal}
                selected={selectedObservacoes}
                form={observacoesGeraisForm}
                setForm={setObservacoesGeraisForm}
                errors={errors}
                onClose={closeObservacoesGeraisModal}
            />
            <PedirChamadaModal open={modalAbertoPedirChamadaModal} onClose={fecharModalPedirChamadaModal} doente={doenteSelecionado} />

            <SituacaoInternaModal open={modalSituacao} onClose={fecharModalSituacao} doente={doenteSituacao} resultados={resultados} />
        </AppLayout>
    );
}
