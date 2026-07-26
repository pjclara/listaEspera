
interface SituacaoBadgeProps {
    label?: string | null;
    color?: string | null; // classe tailwind vinda do backend
    className?: string;
}

const colorMap: Record<string, string> = {
    'bg-blue-600': '#2563eb',
    'bg-yellow-600': '#ca8a04',
    'bg-red-600': '#dc2626',
    'bg-gray-600': '#4b5563',
    'bg-orange-600': '#ea580c',
    'bg-purple-600': '#7c3aed',
    'bg-slate-600': '#475569',
};


export function SituacaoBadge({ label, color, className = "" }: SituacaoBadgeProps) {
    const text = label?.trim() || '-';
    const backgroundColor = color ? colorMap[color] : colorMap['bg-slate-600'];

    return (
        <span
            className={`flex w-full items-center justify-center rounded px-2 py-1 text-xs font-medium text-white ${color} ${className}`}

            style={{ backgroundColor }}
        >
            {text}
        </span>
    );
}
