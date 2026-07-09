import { router } from '@inertiajs/react';

export default function ObservacoesGeraisModal({
    open,
    selected,
    form,
    setForm,
    errors = {},
    onClose,
}) {
    if (!open || !selected) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
                <h2 className="mb-4 text-xl font-semibold">
                    Observações Gerais — Nº {selected.num_processo}
                </h2>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();

                        router.put(
                            `/waiting-lists/${selected.id}/observacoes-gerais`,
                            {
                                observacoes_gerais: form.observacoes_gerais,
                            },
                            {
                                preserveScroll: true,
                                onSuccess: () => onClose(),
                            },
                        );
                    }}
                    className="space-y-4"
                >
                    <label className="block">
                        <span className="text-sm text-gray-600">
                            Observações gerais
                        </span>

                        <textarea
                            value={form.observacoes_gerais}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    observacoes_gerais: e.target.value,
                                })
                            }
                            className="h-32 w-full rounded border px-3 py-2"
                        />

                        {errors.observacoes_gerais && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.observacoes_gerais}
                            </p>
                        )}
                    </label>

                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
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
