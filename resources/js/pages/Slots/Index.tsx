import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Slot } from '@/types/Slot';
import { Team } from '@/types/Team';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { usePage } from '@inertiajs/react';
import { router } from '@inertiajs/react';


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Slots Cirúrgicos',
        href: '/slots',
    },
];

export default function Index({ slots, equipas }: PageProps<{ slots: Slot[]; equipas: Team[] }>) {
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<null | number>(null);

    const [form, setForm] = useState({
        data: "",
        hora_inicio: "",
        hora_fim: "",
        team_id: "",
        sala: "",
        observacoes: "",
    });

    const { errors } = usePage().props;

    const openCreate = () => {
        setEditing(null);
        setForm({
            data: "",
            hora_inicio: "",
            hora_fim: "",
            team_id: "",
            sala: "",
            observacoes: "",
        });
        setShowModal(true);
    };

    const openEdit = (slot: Slot) => {
        setEditing(slot.id);
        const formattedDate = new Date(slot.data).toISOString().split("T")[0];

        setForm({
            data: formattedDate,
            hora_inicio: slot.hora_inicio,
            hora_fim: slot.hora_fim,
            team_id: slot.team_id,
            sala: slot.sala || "",
            observacoes: slot.observacoes || "",
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
            <div className="flex justify-between mb-4">
                <h1 className="text-xl font-semibold">Slots Cirúrgicos</h1>

                <button
                    onClick={openCreate}
                    className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                    Criar Slot
                </button>
            </div>

            <table className="w-full border">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="px-3 py-2">Data</th>
                        <th className="px-3 py-2">Início</th>
                        <th className="px-3 py-2">Fim</th>
                        <th className="px-3 py-2">Equipa</th>
                        <th className="px-3 py-2">Sala</th>
                        <th className="px-3 py-2">Ações</th>
                    </tr>
                </thead>

                <tbody>
                    {slots.map((slot) => (
                        <tr key={slot.id} className="border-t">
                            <td className="px-3 py-2">{new Date(slot.data).toISOString().split("T")[0]}</td>
                            <td className="px-3 py-2">{slot.hora_inicio}</td>
                            <td className="px-3 py-2">{slot.hora_fim}</td>
                            <td className="px-3 py-2">{slot.team.nome}</td>
                            <td className="px-3 py-2">{slot.sala || "—"}</td>

                            <td className="px-3 py-2 flex gap-2">
                                <button
                                    onClick={() => openEdit(slot)}
                                    className="rounded bg-yellow-500 px-3 py-1 text-white hover:bg-yellow-600"
                                >
                                    Editar
                                </button>

                                <button
                                    onClick={() =>
                                        router.delete(`/slots/${slot.id}`)
                                    }
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
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl w-full max-w-lg">
                        <h2 className="text-lg font-semibold mb-4">
                            {editing ? "Editar Slot" : "Criar Slot"}
                        </h2>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                submit();
                            }}
                            className="space-y-4"
                        >
                            <input
                                type="date"
                                value={form.data}
                                onChange={(e) =>
                                    setForm({ ...form, data: e.target.value })
                                }
                                className="w-full border rounded px-3 py-2"
                            />
                            {errors.data && (
                                <p className="text-red-600">{errors.data}</p>
                            )}

                            <input
                                type="time"
                                value={form.hora_inicio}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        hora_inicio: e.target.value,
                                    })
                                }
                                className="w-full border rounded px-3 py-2"
                            />

                            <input
                                type="time"
                                value={form.hora_fim}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        hora_fim: e.target.value,
                                    })
                                }
                                className="w-full border rounded px-3 py-2"
                            />

                            <select
                                value={form.team_id}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        team_id: e.target.value,
                                    })
                                }
                                className="w-full border rounded px-3 py-2"
                            >
                                <option value="">Selecione a equipa</option>
                                {equipas.map((eq) => (
                                    <option key={eq.id} value={eq.id}>
                                        {eq.nome}
                                    </option>
                                ))}
                            </select>

                            <input
                                type="text"
                                placeholder="Sala"
                                value={form.sala}
                                onChange={(e) =>
                                    setForm({ ...form, sala: e.target.value })
                                }
                                className="w-full border rounded px-3 py-2"
                            />

                            <textarea
                                placeholder="Observações"
                                value={form.observacoes}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        observacoes: e.target.value,
                                    })
                                }
                                className="w-full border rounded px-3 py-2 h-24"
                            />

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
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
