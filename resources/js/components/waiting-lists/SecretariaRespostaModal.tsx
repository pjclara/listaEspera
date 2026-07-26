import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function SecretariaRespostaModal({ open, onClose, call, doente }) {
    const [form, setForm] = useState({
        resultado: '',
        data_agendada: '',
        observacoes: '',
    });

    const [loading, setLoading] = useState(false);

    // ⭐ Carregar dados da chamada quando o modal abre
    useEffect(() => {
        if (call) {
            setForm({
                resultado: call.estado_novo ?? '',
                data_agendada: call.data_agendada ? call.data_agendada.substring(0, 10) : '',
                observacoes: call.observacoes_secretaria ?? '',
            });
        }
    }, [call]);

    function update(field, value) {
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
            },
            onError: () => setLoading(false),
        });
    }

    console.log(form)
    if (!open || !call || !doente) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-lg space-y-6 rounded-xl bg-white p-6 shadow-xl">
                <h2 className="text-xl font-semibold">{doente.nome}</h2>

                {/* Dados do pedido */}
                <div className="rounded-lg border bg-gray-50 p-4">
                    <p>
                        <strong>Pedido por:</strong> {call.pedido_por_user?.nome}
                    </p>
                    <p>
                        <strong>Tipo:</strong> {call.tipo_chamada}
                    </p>
                    <p>
                        <strong>Data pretendida:</strong> {call.data_pretendida}
                    </p>
                    <p>
                        <strong>Pedido em:</strong> {call.pedido_em}
                    </p>
                </div>

                <div className="space-y-4">
                    {/* Resultado */}
                    <div>
                        <label className="text-sm text-gray-700">Resultado</label>
                        <select
                            value={form.resultado}
                            onChange={(e) => update('resultado', e.target.value)}
                            className="mt-1 w-full rounded-lg border-gray-300"
                        >
                            <option value="">Selecione...</option>
                            <option value="Agendado">Agendado</option>
                            <option value="VoltaLista">Volta à lista</option>
                            <option value="Recusou">Recusou</option>
                            <option value="Não atende">Não atende</option>
                            <option value="Indisponível">Indisponível</option>
                            <option value="Aceitou Outro Hospital">Aceitou Outro Hospital</option>
                            <option value="Outro">Outro</option>
                        </select>
                    </div>

                    {/* Data de agenda */}
                    {form.resultado === 'Agendado' && (
                        <div>
                            <label className="text-sm text-gray-700">Data de Agenda</label>
                            <input
                                type="date"
                                value={form.data_agendada}
                                onChange={(e) => update('data_agendada', e.target.value)}
                                className="mt-1 w-full rounded-lg border-gray-300"
                            />
                        </div>
                    )}

                    {/* Observações */}
                    <div>
                        <label className="text-sm text-gray-700">Observações</label>
                        <textarea
                            value={form.observacoes}
                            onChange={(e) => update('observacoes', e.target.value)}
                            className="mt-1 h-24 w-full rounded-lg border-gray-300"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <button onClick={onClose} className="rounded-lg bg-gray-200 px-4 py-2 hover:bg-gray-300">
                        Cancelar
                    </button>

                    <button
                        onClick={submit}
                        disabled={loading}
                        className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-60"
                    >
                        {loading ? 'A guardar...' : 'Guardar resposta'}
                    </button>
                </div>
            </div>
        </div>
    );
}
