import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Slot } from '@/types/Slot';
import { Team } from '@/types/Team';
import { Head, router, usePage } from '@inertiajs/react';
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
            <div className="p-6">
                <div className="mb-4 flex justify-between">
                    <h1 className="text-xl font-semibold">Slots Cirúrgicos</h1>

                    <button onClick={openCreate} className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                        Criar Slot
                    </button>
                </div>

                <table className="w-full border">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-3 py-2">Data</th>
                            <th className="px-3 py-2">Início</th>
                            <th className="px-3 py-2">Fim</th>
                            <th className="px-3 py-2">team</th>
                            <th className="px-3 py-2">Sala</th>
                            <th className="px-3 py-2">Ações</th>
                        </tr>
                    </thead>

                    <tbody>
                        {slots.map((slot) => (
                            <tr key={slot.id} className="border-t">
                                <td className="px-3 py-2">{new Date(slot.data).toISOString().split('T')[0]}</td>
                                <td className="px-3 py-2">{slot.hora_inicio}</td>
                                <td className="px-3 py-2">{slot.hora_fim}</td>
                                <td className="px-3 py-2">{slot.team.nome}</td>
                                <td className="px-3 py-2">{slot.sala || '—'}</td>

                                <td className="flex gap-2 px-3 py-2">
                                    <button onClick={() => openEdit(slot)} className="rounded bg-yellow-500 px-3 py-1 text-white hover:bg-yellow-600">
                                        Editar
                                    </button>

                                    <button
                                        onClick={() => router.delete(`/slots/${slot.id}`)}
                                        className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700"
                                    >
                                        Apagar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* MODAL */}
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                        <div className="w-full max-w-lg rounded-xl bg-white p-6">
                            <h2 className="mb-4 text-lg font-semibold">{editing ? 'Editar Slot' : 'Criar Slot'}</h2>

                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    submit();
                                }}
                                className="space-y-4"
                            >
                                {/* DATA */}
                                <input
                                    type="date"
                                    value={form.data}
                                    onChange={(e) => setForm({ ...form, data: e.target.value })}
                                    className="w-full rounded border px-3 py-2"
                                />
                                {errors.data && <p className="text-red-600">{errors.data}</p>}

                                {/* HORAS */}
                                <input
                                    type="time"
                                    value={form.hora_inicio}
                                    onChange={(e) => setForm({ ...form, hora_inicio: e.target.value })}
                                    className="w-full rounded border px-3 py-2"
                                />

                                <input
                                    type="time"
                                    value={form.hora_fim}
                                    onChange={(e) => setForm({ ...form, hora_fim: e.target.value })}
                                    className="w-full rounded border px-3 py-2"
                                />

                                {/* team */}
                                <select
                                    value={form.team_id}
                                    onChange={(e) => setForm({ ...form, team_id: e.target.value })}
                                    className="w-full rounded border px-3 py-2"
                                >
                                    <option value="">Selecione a team</option>
                                    {teams.map((team) => (
                                        <option key={team.id} value={team.id}>
                                            {team.nome}
                                        </option>
                                    ))}
                                </select>

                                {/* SALA */}
                                <input
                                    type="text"
                                    placeholder="Sala"
                                    value={form.sala}
                                    onChange={(e) => setForm({ ...form, sala: e.target.value })}
                                    className="w-full rounded border px-3 py-2"
                                />

                                {/* REPETIÇÃO */}
                                <select
                                    value={form.repeat_type}
                                    onChange={(e) => setForm({ ...form, repeat_type: e.target.value })}
                                    className="w-full rounded border px-3 py-2"
                                >
                                    <option value="none">Não repetir</option>
                                    <option value="daily">Diariamente</option>
                                    <option value="weekly">Semanalmente</option>
                                    <option value="monthly">Mensalmente</option>
                                </select>

                                {/* Até data */}
                                {form.repeat_type !== 'none' && (
                                    <input
                                        type="date"
                                        value={form.repeat_until || ''}
                                        onChange={(e) => setForm({ ...form, repeat_until: e.target.value })}
                                        className="w-full rounded border px-3 py-2"
                                    />
                                )}

                                {/* OBSERVAÇÕES */}
                                <textarea
                                    placeholder="Observações"
                                    value={form.observacoes}
                                    onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                                    className="h-24 w-full rounded border px-3 py-2"
                                />

                                {/* BOTÕES */}
                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="rounded bg-gray-300 px-4 py-2 hover:bg-gray-400"
                                    >
                                        Cancelar
                                    </button>

                                    <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                                        Guardar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
