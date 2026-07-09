import { router, usePage } from '@inertiajs/react';

interface AdminObservacoesModalProps {
    open: boolean;
    selected: any;
    form: {
        contactado: boolean;
        data_contacto: string;
        contactado_por: string;
        observacoes: string;
    };
    setForm: React.Dispatch<
        React.SetStateAction<{
            contactado: boolean;
            data_contacto: string;
            contactado_por: string;
            observacoes: string;
        }>
    >;
    onClose: () => void;
}

export default function AdminObservacoesModal({
    open,
    selected,
    form,
    setForm,
    onClose,
}: AdminObservacoesModalProps) {
    const { errors } = usePage().props as any;

    if (!open || !selected) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-lg animate-[fadeIn_0.2s_ease] rounded-xl bg-white p-6 shadow-xl">
                <h2 className="mb-4 text-xl font-semibold">
                    Dados Administrativos — Nº {selected.num_processo}
                </h2>

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
                                onSuccess: () => onClose(),
                            },
                        );
                    }}
                    className="space-y-4"
                >
                    {/* Contactado */}
                    <label className="block">
                        <span className="text-sm text-gray-600">
                            Contactado?
                        </span>

                        <input
                            type="checkbox"
                            checked={form.contactado}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    contactado: e.target.checked,
                                })
                            }
                            className="ml-2"
                        />

                        {errors.contactado && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.contactado}
                            </p>
                        )}
                    </label>

                    {/* Data de contacto */}
                    <label className="block">
                        <span className="text-sm text-gray-600">
                            Data de contacto
                        </span>

                        <input
                            type="date"
                            value={form.data_contacto}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    data_contacto: e.target.value,
                                })
                            }
                            className="w-full rounded border px-3 py-2"
                        />

                        {errors.data_contacto && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.data_contacto}
                            </p>
                        )}
                    </label>

                    {/* Contactado por */}
                    <label className="block">
                        <span className="text-sm text-gray-600">
                            Contactado por
                        </span>

                        <input
                            type="text"
                            value={form.contactado_por}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    contactado_por: e.target.value,
                                })
                            }
                            className="w-full rounded border px-3 py-2"
                        />

                        {errors.contactado_por && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.contactado_por}
                            </p>
                        )}
                    </label>

                    {/* Observações */}
                    <label className="block">
                        <span className="text-sm text-gray-600">
                            Observações
                        </span>

                        <textarea
                            value={form.observacoes}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    observacoes: e.target.value,
                                })
                            }
                            className="h-24 w-full rounded border px-3 py-2"
                        />

                        {errors.observacoes && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.observacoes}
                            </p>
                        )}
                    </label>

                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded bg-gray-300 px-4 py-2 transition hover:bg-gray-400"
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            className="rounded bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
                        >
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}