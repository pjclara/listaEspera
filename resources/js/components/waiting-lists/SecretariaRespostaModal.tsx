import { useState } from "react";
import { router } from "@inertiajs/react";

interface Props {
    open: boolean;
    onClose: () => void;
    call: any | null;
    doente: any | null;
}

export default function SecretariaRespostaModal({ open, onClose, call, doente }: Props) {
    const [form, setForm] = useState({
        resultado: "",
        data_agenda: "",
        observacoes: "",
    });

    const [loading, setLoading] = useState(false);

    function update(field: string, value: any) {
        setForm((prev) => ({ ...prev, [field]: value }));
    }

    function submit() {
        if (!call) return;

        setLoading(true);

        router.post(`/waiting-list/chamada/${call.id}/resposta`, form, {
            preserveScroll: true,
            onSuccess: () => {
                setLoading(false);
                onClose();
                setForm({
                    resultado: "",
                    data_agenda: "",
                    observacoes: "",
                });
            },
            onError: () => setLoading(false),
        });
    }

    if (!open || !call || !doente) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg space-y-6">

                <h2 className="text-xl font-semibold">
                    Resposta da Secretaria — {doente.nome_clinico}
                </h2>

                {/* Dados do pedido */}
                <div className="bg-gray-50 p-4 rounded-lg border">
                    <p><strong>Pedido por:</strong> {call.pedido_por_user?.nome}</p>
                    <p><strong>Tipo:</strong> {call.tipo_chamada}</p>
                    <p><strong>Data pretendida:</strong> {call.data_pretendida}</p>
                    <p><strong>Pedido em:</strong> {call.pedido_em}</p>
                </div>

                <div className="space-y-4">
                    {/* Resultado */}
                    <div>
                        <label className="text-sm text-gray-700">Resultado</label>
                        <select
                            value={form.resultado}
                            onChange={(e) => update("resultado", e.target.value)}
                            className="mt-1 w-full rounded-lg border-gray-300"
                        >
                            <option value="">Selecione...</option>
                            <option value="Agendado">Agendado</option>
                            <option value="VoltaLista">Volta à lista</option>
                            <option value="Recusou">Recusou</option>
                            <option value="NA">Não atende</option>
                            <option value="Indisponível">Indisponível</option>
                        </select>
                    </div>

                    {/* Data de agenda se for agendado */}
                    {form.resultado === "Agendado" && (
                        <div>
                            <label className="text-sm text-gray-700">Data de Agenda</label>
                            <input
                                type="date"
                                value={form.data_agenda}
                                onChange={(e) => update("data_agenda", e.target.value)}
                                className="mt-1 w-full rounded-lg border-gray-300"
                            />
                        </div>
                    )}

                    {/* Observações */}
                    <div>
                        <label className="text-sm text-gray-700">Observações</label>
                        <textarea
                            value={form.observacoes}
                            onChange={(e) => update("observacoes", e.target.value)}
                            className="mt-1 w-full rounded-lg border-gray-300 h-24"
                        />
                    </div>
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
                        disabled={loading}
                        className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
                    >
                        {loading ? "A guardar..." : "Guardar resposta"}
                    </button>
                </div>
            </div>
        </div>
    );
}
