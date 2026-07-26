import { useState, useEffect } from "react";
import { router } from "@inertiajs/react";

export default function SituacaoInternaModal({ open, onClose, doente, resultados }) {
    const [situacao, setSituacao] = useState("");

    useEffect(() => {
        if (doente) {
            setSituacao(doente.situacao_interna ?? "");
        }
    }, [doente]);

    function submit() {
        router.post(`/waiting-list/${doente.id}/situacao-interna`, {
            situacao_interna: situacao,
        }, {
            onSuccess: onClose,
        });
    }

    if (!open || !doente) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md space-y-6">

                <h2 className="text-xl font-semibold">
                    Alterar situação interna
                </h2>

                <p className="text-gray-600">{doente.nome}</p>

                <div>
                    <label className="text-sm text-gray-700">Situação interna</label>
                    <select
                        value={situacao}
                        onChange={(e) => setSituacao(e.target.value)}
                        className="mt-1 w-full rounded-lg border-gray-300"
                    >
                        <option value="">Selecione...</option>

                        {resultados.map((opt) => (
                            <option key={opt} value={opt}>
                                {opt}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex justify-end gap-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                    >
                        Cancelar
                    </button>

                    <button
                        onClick={submit}
                        className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                    >
                        Guardar
                    </button>
                </div>
            </div>
        </div>
    );
}
