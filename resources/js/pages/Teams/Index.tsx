import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import CreateTeamModal from './../../components/teams/CreateTeamModal';

export default function TeamsIndex() {
    const { teams } = usePage().props;

    const [showCreate, setShowCreate] = useState(false);
    const [showMembers, setShowMembers] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState(null);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Equipas',
            href: '/teams',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Gestão de Equipas</h1>

                    <button
                        onClick={() => {
                            setSelectedTeam(null);
                            setShowCreate(true);
                        }}
                        className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                    >
                        Nova Equipa
                    </button>
                </div>

                {/* Tabela */}
                <div className="rounded-lg border bg-white">
                    <table className="w-full">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-2 text-left">Nome</th>
                                <th className="px-4 py-2 text-left">Especialidade</th>
                                <th className="px-4 py-2 text-left">Cor</th>
                                <th className="px-4 py-2 text-left">Estado</th>
                                <th className="px-4 py-2 text-left">Ações</th>
                            </tr>
                        </thead>

                        <tbody>
                            {teams.map((team) => (
                                <tr key={team.id} className="border-t">
                                    <td className="px-4 py-2">{team.nome}</td>
                                    <td className="px-4 py-2">{team.especialidade || '—'}</td>

                                    <td className="px-4 py-2">
                                        <span className="inline-block h-4 w-4 rounded" style={{ backgroundColor: team.cor }} />
                                    </td>

                                    <td className="px-4 py-2">
                                        {team.ativa ? (
                                            <span className="font-medium text-green-600">Ativa</span>
                                        ) : (
                                            <span className="font-medium text-red-600">Inativa</span>
                                        )}
                                    </td>

                                    <td className="space-x-2 px-4 py-2">
                                        <button
                                            onClick={() => {
                                                setSelectedTeam(team);
                                                setShowCreate(true);
                                            }}
                                            className="text-blue-600 hover:underline"
                                        >
                                            Editar
                                        </button>

                                        <button
                                            onClick={() => {
                                                setSelectedTeam(team);
                                                setShowMembers(true);
                                            }}
                                            className="text-green-600 hover:underline"
                                        >
                                            Membros
                                        </button>

                                        <button
                                            onClick={() =>
                                                router.delete(`/teams/${team.id}`, {
                                                    preserveScroll: true,
                                                })
                                            }
                                            className="text-red-600 hover:underline"
                                        >
                                            Apagar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Modais */}
                {showCreate && <CreateTeamModal team={selectedTeam} close={() => setShowCreate(false)} />}
            </div>
        </AppLayout>
    );
}
