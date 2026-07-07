import AppLayout from '@/layouts/app-layout';
import { Head, Link, PageProps, router } from '@inertiajs/react';
import { useState } from 'react';

import { usePage } from '@inertiajs/react';

export default function Index({
    waitingLists,
    filters,
    situacaoOptions,
    estadoOptions,
    equipaOptions,
    slotsDisponiveis,
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
    const [situacao, setSituacao] = useState(safeFilters.situacao ?? '');
    const [estado, setEstado] = useState(safeFilters.estado ?? '');

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
    const isEditingSchedule = !!selectedSchedule?.schedule;

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

    const closeScheduleModal = () => {
        setShowScheduleModal(false);
        setSelectedSchedule(null);
    };

    const updateSituacao = (newSituacao: string) => {
        setSituacao(newSituacao);

        router.get(
            '/waiting-lists',
            {
                num_processo: numProcesso,
                situacao: newSituacao,
                estado: estado,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const updateEstado = (newEstado: string) => {
        setEstado(newEstado);

        router.get(
            '/waiting-lists',
            {
                num_processo: numProcesso,
                situacao: situacao,
                estado: newEstado,
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

    return (
        <AppLayout>
            <Head title="Lista de Espera" />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight">Lista de Espera</h1>

                    <Link href="/waiting-list/import" className="rounded-lg bg-blue-600 px-4 py-2 text-white shadow transition hover:bg-blue-700">
                        Importar Excel
                    </Link>
                </div>

                {/* FILTROS */}
                <div className="flex gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow">
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
                        <label className="mb-1 text-sm text-gray-600">Situação</label>
                        <select value={situacao} onChange={(e) => updateSituacao(e.target.value)} className="rounded border px-3 py-2">
                            <option value="">Todas</option>
                            {situacaoOptionsState.map((option) => (
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

                    <button onClick={applyFilters} className="self-end rounded bg-blue-600 px-4 py-2 text-white shadow transition hover:bg-blue-700">
                        Filtrar
                    </button>
                </div>

                {/* TABELA */}
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow">
                    <table className="w-full border-collapse">
                        <thead className="sticky top-0 z-10 bg-gray-50">
                            <tr className="text-left text-sm font-medium text-gray-600">
                                <th className="px-4 py-3">ID</th>
                                <th className="px-4 py-3">Nº Processo</th>
                                <th className="px-4 py-3">Diagnóstico</th>
                                <th className="px-4 py-3">Estado</th>
                                <th className="px-4 py-3">Situação</th>
                            </tr>
                        </thead>

                        <tbody className="text-sm text-gray-700">
                            {waitingLists.data.map((i: any, idx: number) => (
                                <tr key={i.id} className={`transition hover:bg-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                    <td className="px-4 py-3 font-medium text-gray-900">{i.id}</td>
                                    <td className="px-4 py-3">{i.num_processo}</td>
                                    <td className="px-4 py-3">{i.des_diagnostico}</td>
                                    <td className="px-4 py-3">{i.estado}</td>
                                    <td className="px-4 py-3">{i.situacao}</td>

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
            {showModal && selected !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-lg animate-[fadeIn_0.2s_ease] rounded-xl bg-white p-6 shadow-xl">
                        <h2 className="mb-4 text-xl font-semibold">Dados Administrativos — Nº {selected.num_processo}</h2>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                router.post(
                                    `/waiting-lists/${selected.id}/admin`,
                                    {
                                        contactado: form.contactado,
                                        data_contacto: form.data_contacto,
                                        contactado_por: form.contactado_por,
                                        observacoes: form.observacoes,
                                    },
                                    {
                                        preserveScroll: true,
                                        onSuccess: () => closeModal(),
                                    },
                                );
                            }}
                            className="space-y-4"
                        >
                            {/* Contactado */}
                            <label className="block">
                                <span className="text-sm text-gray-600">Contactado?</span>
                                <input
                                    type="checkbox"
                                    checked={!!form.contactado}
                                    onChange={(e) => setForm({ ...form, contactado: e.target.checked })}
                                    className="ml-2"
                                />
                                {errors.contactado && <p className="mt-1 text-sm text-red-600">{errors.contactado}</p>}
                            </label>

                            {/* Data contacto */}
                            <label className="block">
                                <span className="text-sm text-gray-600">Data de contacto</span>
                                <input
                                    type="date"
                                    value={form.data_contacto || ''}
                                    onChange={(e) => setForm({ ...form, data_contacto: e.target.value })}
                                    className="w-full rounded border px-3 py-2"
                                />
                                {errors.data_contacto && <p className="mt-1 text-sm text-red-600">{errors.data_contacto}</p>}
                            </label>

                            {/* Contactado por */}
                            <label className="block">
                                <span className="text-sm text-gray-600">Contactado por</span>
                                <input
                                    type="text"
                                    value={form.contactado_por || ''}
                                    onChange={(e) => setForm({ ...form, contactado_por: e.target.value })}
                                    className="w-full rounded border px-3 py-2"
                                />
                                {errors.contactado_por && <p className="mt-1 text-sm text-red-600">{errors.contactado_por}</p>}
                            </label>

                            {/* Observações */}
                            <label className="block">
                                <span className="text-sm text-gray-600">Observações</span>
                                <textarea
                                    value={form.observacoes || ''}
                                    onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                                    className="h-24 w-full rounded border px-3 py-2"
                                />
                                {errors.observacoes && <p className="mt-1 text-sm text-red-600">{errors.observacoes}</p>}
                            </label>

                            <div className="mt-6 flex justify-end gap-3">
                                <button type="button" onClick={closeModal} className="rounded bg-gray-300 px-4 py-2 transition hover:bg-gray-400">
                                    Cancelar
                                </button>

                                <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700">
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {showScheduleModal && selectedSchedule && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-lg animate-[fadeIn_0.2s_ease] rounded-xl bg-white p-6 shadow-xl">
                        <h2 className="mb-4 text-xl font-semibold">
                            {selectedSchedule.schedule ? 'Editar Agendamento' : `Agendar — Nº ${selectedSchedule.num_processo}`}
                        </h2>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();

                                if (selectedSchedule.schedule) {
                                    router.put(
                                        `/waiting-lists/${selectedSchedule.id}/schedule/${selectedSchedule.schedule.id}`,
                                        {
                                            slot_id: scheduleForm.slot_id,
                                            duracao_estimada: scheduleForm.duracao_estimada,
                                            estado: 'agendado',
                                        },
                                        {
                                            preserveScroll: true,
                                            onSuccess: () => closeScheduleModal(),
                                        },
                                    );
                                } else {
                                    router.post(
                                        `/waiting-lists/${selectedSchedule.id}/schedule`,
                                        {
                                            slot_id: scheduleForm.slot_id,
                                            duracao_estimada: scheduleForm.duracao_estimada,
                                            estado: 'agendado',
                                        },
                                        {
                                            preserveScroll: true,
                                            onSuccess: () => closeScheduleModal(),
                                        },
                                    );
                                }
                            }}
                            className="space-y-4"
                        >
                            {/* Slot */}
                            <label className="block">
                                <span className="text-sm text-gray-600">Slot disponível</span>
                                <select
                                    value={scheduleForm.slot_id || ''}
                                    onChange={(e) => setScheduleForm({ ...scheduleForm, slot_id: e.target.value })}
                                    className="w-full rounded border px-3 py-2"
                                >
                                    <option value="">Selecione um slot</option>

                                    {slotsDisponiveis.map((slot) => (
                                        <option key={slot.id} value={slot.id}>
                                            {new Date(slot.data).toLocaleDateString()} — {slot.hora_inicio} — Equipa {slot.team.nome}
                                        </option>
                                    ))}
                                </select>

                                {errors.slot_id && <p className="mt-1 text-sm text-red-600">{errors.slot_id}</p>}
                            </label>

                            {/* Duração estimada */}
                            <label className="block">
                                <span className="text-sm text-gray-600">Duração estimada (minutos)</span>
                                <input
                                    type="number"
                                    min="1"
                                    value={scheduleForm.duracao_estimada || ''}
                                    onChange={(e) =>
                                        setScheduleForm({
                                            ...scheduleForm,
                                            duracao_estimada: e.target.value,
                                        })
                                    }
                                    className="w-full rounded border px-3 py-2"
                                />
                                {errors.duracao_estimada && <p className="mt-1 text-sm text-red-600">{errors.duracao_estimada}</p>}
                            </label>

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={closeScheduleModal}
                                    className="rounded bg-gray-300 px-4 py-2 transition hover:bg-gray-400"
                                >
                                    Cancelar
                                </button>

                                <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700">
                                    {selectedSchedule.schedule ? 'Guardar Alterações' : 'Guardar Agendamento'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
