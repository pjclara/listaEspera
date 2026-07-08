import { useState } from "react";

export function SearchableSelect({ value, onChange, options }) {
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);

    const filtered = options.filter((w) =>
        `${w.num_processo} ${w.des_diagnostico}`
            .toLowerCase()
            .includes(query.toLowerCase())
    );

    return (
        <div className="relative">
            {/* Input de pesquisa */}
            <input
                type="text"
                value={
                    value
                        ? options.find((o) => o.id === Number(value))?.num_processo +
                          " — " +
                          options.find((o) => o.id === Number(value))?.des_diagnostico
                        : query
                }
                onChange={(e) => {
                    setQuery(e.target.value);
                    setOpen(true);
                    onChange(""); // limpar seleção
                }}
                onFocus={() => setOpen(true)}
                className="w-full rounded border px-3 py-2"
                placeholder="Pesquisar doente..."
            />

            {/* Dropdown */}
            {open && (
                <div className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded border bg-white shadow-lg">
                    {filtered.length === 0 && (
                        <div className="px-3 py-2 text-sm text-gray-500">
                            Nenhum resultado
                        </div>
                    )}

                    {filtered.map((w) => (
                        <div
                            key={w.id}
                            onClick={() => {
                                onChange(w.id);
                                setQuery("");
                                setOpen(false);
                            }}
                            className="cursor-pointer px-3 py-2 hover:bg-gray-100"
                        >
                            <div className="font-medium">{w.num_processo}</div>
                            <div className="text-sm text-gray-600">
                                {w.des_diagnostico}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
