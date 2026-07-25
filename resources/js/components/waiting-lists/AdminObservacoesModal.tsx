import { router, usePage } from '@inertiajs/react';

interface AdminObservacoesModalProps {
    open: boolean;
    selected: any;
    form: {
        contactado: boolean;
        data_contacto: string;
        contactado_por: string;
        observacoes: string;
        contact_result: string;
    };
    setForm: React.Dispatch<
        React.SetStateAction<{
            contactado: boolean;
            data_contacto: string;
            contactado_por: string;
            observacoes: string;
            contact_result: string;
        }>
    >;
    errors?: any;
    onClose: () => void;
    permissions: string[];
}

export default function AdminObservacoesModal({ open, selected, form, setForm, onClose, permissions }: AdminObservacoesModalProps) {
    const { errors } = usePage().props as any;

    if (!open || !selected) return null;

    const canEdit = permissions.includes('waiting_list.admin');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        router.post(
            `/waiting-lists/${selected.id}/admin`,
            {
                data_contacto: form.data_contacto,
                contactado_por: form.contactado_por,
                observacoes: form.observacoes,
                contact_result: form.contact_result,
            },
            {
                preserveScroll: true,
                onSuccess: () => onClose(),
            },
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-lg animate-[fadeIn_0.2s_ease] rounded-xl bg-white p-6 shadow-xl">
                <h2 className="mb-4 text-xl font-semibold">Dados Administrativos — Nº {selected.num_processo}</h2>

                {/* FORMULÁRIO (apenas se tiver permissão) */}
                {canEdit && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Resultado do contacto */}
                        <label className="block">
                            <span className="text-sm text-gray-600">Resultado do contacto</span>

                            <select
                                value={form.contact_result}
                                onChange={(e) => setForm({ ...form, contact_result: e.target.value })}
                                className="w-full rounded border px-3 py-2"
                            >
                                <option value="">Selecione…</option>
                                <option value="nao_atendeu">Não atendeu</option>
                                <option value="nao_quer_operar">Não quer ser operado</option>
                                <option value="quer_operar_mais_tarde">Quer ser operado mais tarde</option>
                                <option value="outra_instituicao">Vai ser operado noutra instituição</option>
                                <option value="quer_operar">Aceita ser operado</option>
                                <option value="outro">Outro</option>
                            </select>

                            {errors.contact_result && <p className="mt-1 text-sm text-red-600">{errors.contact_result}</p>}
                        </label>

                        {/* Data de contacto */}
                        <label className="block">
                            <span className="text-sm text-gray-600">Data de contacto</span>

                            <input
                                type="date"
                                value={form.data_contacto}
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
                                value={form.contactado_por}
                                onChange={(e) => setForm({ ...form, contactado_por: e.target.value })}
                                className="w-full rounded border px-3 py-2"
                            />

                            {errors.contactado_por && <p className="mt-1 text-sm text-red-600">{errors.contactado_por}</p>}
                        </label>

                        {/* Observações */}
                        <label className="block">
                            <span className="text-sm text-gray-600">Observações</span>

                            <textarea
                                value={form.observacoes}
                                onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                                className="h-24 w-full rounded border px-3 py-2"
                            />

                            {errors.observacoes && <p className="mt-1 text-sm text-red-600">{errors.observacoes}</p>}
                        </label>

                        <div className="mt-6 flex justify-end gap-3">
                            <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700">
                                Guardar
                            </button>
                        </div>
                    </form>
                )}

                {/* HISTÓRICO */}
                <div className="mt-6 border-t pt-4">
                    <h3 className="mb-2 text-lg font-semibold">Histórico de contactos</h3>

                    {selected.contacts.length === 0 && <p className="text-sm text-gray-500">Sem contactos registados.</p>}

                    {selected.contacts.map((c) => (
                        <div key={c.id} className="mb-3 rounded border bg-gray-50 p-3">
                            <div className="text-sm">
                                <strong>{c.data_contacto}</strong> — {c.contact_result.replace('_', ' ')}
                            </div>

                            <div className="text-xs text-gray-600">Contactado por: {c.contactado_por}</div>

                            {c.observacoes && <div className="mt-1 text-xs text-gray-600">{c.observacoes}</div>}
                        </div>
                    ))}

                    <div className="mt-4 flex justify-end">
                        <button type="button" onClick={onClose} className="rounded bg-gray-300 px-4 py-2 transition hover:bg-gray-400">
                            Fechar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
