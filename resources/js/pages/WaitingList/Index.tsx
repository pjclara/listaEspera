import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, PageProps } from '@inertiajs/react';
import { Link } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Lista de Espera',
        href: '/waiting-lists',
    },
];

export default function Index({ waitingLists }: PageProps<{ waitingLists: any }>) {
    return (
        <AppLayout>
            <Head title="Lista de Espera" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <h1 className="mb-4 text-xl font-bold">Lista de Espera</h1>
                <Link href="/waiting-list/import" className="rounded bg-blue-600 px-4 py-2 text-white">
                    Importar Excel
                </Link>
                <table className="w-full bg-white shadow">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Diagnóstico</th>
                            <th>Procedimento</th>
                            <th>Estado</th>
                            <th>Equipa</th>
                        </tr>
                    </thead>
                    <tbody>
                        {waitingLists.data.map((i: any) => (
                            <tr key={i.id}>
                                <td>{i.id}</td>
                                <td>{i.diagnostico_desc}</td>
                                <td>{i.procedimento_pcs}</td>
                                <td>{i.estado}</td>
                                <td>{i.equipa_id}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AppLayout>
    );
}
