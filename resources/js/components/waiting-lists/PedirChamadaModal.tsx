import { useState } from "react";
import { router } from "@inertiajs/react";
import { toast } from "sonner";

interface Props {
    open: boolean;
    onClose: () => void;
    doente: any | null;
}

export default function PedirChamadaModal({ open, onClose, doente }: Props) {
    const [form, setForm] = useState({
        tipo_chamada: "",
        data_pretendida: "",
        observacoes: "",
    });

    const [loading, setLoading] = useState(false);

    function update(field: string, value: any) {
        setForm((prev) => ({ ...prev, [field]: value }));
    }

    function submit() {
        if (!doente) return;

        setLoading(true);

        router.post(`/waiting-list/${doente}/pedir-chamada`, form, {
            preserveScroll: true,
            onSuccess: () => {
                setLoading(false);
                onClose();
                setForm({
                    tipo_chamada: "",
                    data_pretendida: "",
                    observacoes: "",
                });
                toast.success('asdas')
            },
            onError: () => setLoading(false),
        });
    }

    if (!open || !doente) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg space-y-6">

                <h2 className="text-xl font-semibold">
                    Pedir Chamada para {doente}
                </h2>

                <div className="space-y-4">
                    {/* Tipo de chamada */}
                    <div>
                        <label className="text-sm text-gray-700">Tipo de chamada</label>
                        <select
                            value={form.tipo_chamada}
                            onChange={(e) => update("tipo_chamada", e.target.value)}
                            className="mt-1 w-full rounded-lg border-gray-300"
                        >
                            <option value="">Selecione...</option>
                            <option value="Ambulatorio">Ambulatório</option>
                            <option value="Base">Base</option>
                            <option value="SIGIC">SIGIC</option>
                        </select>
                    </div>

                    {/* Data pretendida */}
                    <div>
                        <label className="text-sm text-gray-700">Data pretendida</label>
                        <input
                            type="date"
                            value={form.data_pretendida}
                            onChange={(e) => update("data_pretendida", e.target.value)}
                            className="mt-1 w-full rounded-lg border-gray-300"
                        />
                    </div>

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
                        className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                    >
                        {loading ? "A enviar..." : "Enviar pedido"}
                    </button>
                </div>
            </div>
        </div>
    );
}
