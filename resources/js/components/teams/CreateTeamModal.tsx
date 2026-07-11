import { useState } from "react";
import { router, usePage } from "@inertiajs/react";

export default function CreateTeamModal({ team, close }) {
    const { errors } = usePage().props;

    const [form, setForm] = useState({
        nome: team?.nome || "",
        especialidade: team?.especialidade || "",
        cor: team?.cor || "#3b82f6",
        sala_default: team?.sala_default || "",
        ativa: team?.ativa ?? true,
        leader_id: team?.leader_id || "",
    });

    function submit(e) {
        e.preventDefault();

        if (team) {
            router.put(`/teams/${team.id}`, form, {
                preserveScroll: true,
                onSuccess: close,
            });
        } else {
            router.post(`/teams`, form, {
                preserveScroll: true,
                onSuccess: close,
            });
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
                <h2 className="mb-4 text-xl font-semibold">
                    {team ? "Editar Equipa" : "Nova Equipa"}
                </h2>

                <form onSubmit={submit} className="space-y-4">
                    <label className="block">
                        <span className="text-sm text-gray-600">Nome</span>
                        <input
                            value={form.nome}
                            onChange={(e) => setForm({ ...form, nome: e.target.value })}
                            className="w-full rounded border px-3 py-2"
                        />
                        {errors?.nome && <p className="text-red-600">{errors.nome}</p>}
                    </label>

                    <label className="block">
                        <span className="text-sm text-gray-600">Especialidade</span>
                        <input
                            value={form.especialidade}
                            onChange={(e) =>
                                setForm({ ...form, especialidade: e.target.value })
                            }
                            className="w-full rounded border px-3 py-2"
                        />
                    </label>

                    <label className="block">
                        <span className="text-sm text-gray-600">Cor</span>
                        <input
                            type="color"
                            value={form.cor}
                            onChange={(e) => setForm({ ...form, cor: e.target.value })}
                            className="h-10 w-full rounded border px-3 py-2"
                        />
                    </label>

                    <label className="block">
                        <span className="text-sm text-gray-600">Sala padrão</span>
                        <input
                            value={form.sala_default}
                            onChange={(e) =>
                                setForm({ ...form, sala_default: e.target.value })
                            }
                            className="w-full rounded border px-3 py-2"
                        />
                    </label>

                    <label className="block">
                        <span className="text-sm text-gray-600">Estado</span>
                        <select
                            value={form.ativa}
                            onChange={(e) =>
                                setForm({ ...form, ativa: e.target.value === "true" })
                            }
                            className="w-full rounded border px-3 py-2"
                        >
                            <option value="true">Ativa</option>
                            <option value="false">Inativa</option>
                        </select>
                    </label>

                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={close}
                            className="rounded bg-gray-300 px-4 py-2 hover:bg-gray-400"
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                        >
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
