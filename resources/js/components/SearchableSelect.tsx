import { useState, useEffect, useRef } from "react";

export function SearchableSelect({ value, onChange, options }) {
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    // --- FECHAR AO CLICAR FORA ---
    useEffect(() => {
        function handleClickOutside(e) {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // --- FECHAR COM ESC ---
    useEffect(() => {
        function handleEsc(e) {
            if (e.key === "Escape") setOpen(false);
        }

        document.addEventListener("keydown", handleEsc);
        return () => document.removeEventListener("keydown", handleEsc);
    }, []);

    // --- FILTRAR ---
    const filtered = options.filter((w) =>
        `${w.num_processo} ${w.des_diagnostico}`
            .toLowerCase()
            .includes(query.toLowerCase())
    );

    // --- LABEL DO ITEM SELECIONADO ---
    const selectedItem = options.find((o) => o.id === Number(value));

    return (
        <div ref={ref} className="relative">
            {/* INPUT */}
            <input
                type="text"
                value={
                    selectedItem
                        ? `${selectedItem.num_processo} — ${selectedItem.des_diagnostico}`
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

            {/* DROPDOWN */}
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
                                setOpen(false); // FECHA AO CLICAR
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
