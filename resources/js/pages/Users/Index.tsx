import AppLayout from '@/layouts/app-layout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

export default function Index() {
    const { users, roles } = usePage().props;

    return (
        <AppLayout breadcrumbs={[{ title: 'Utilizadores', href: '/users' }]}>
            <Head title="Gestão de Utilizadores" />

            <div className="p-6">
                <div className="mb-6 flex justify-between items-center">
                    <h1 className="text-2xl font-semibold">Utilizadores</h1>

                    <Button asChild>
                        <Link href="/users/create">Criar utilizador</Link>
                    </Button>
                </div>

                <table className="w-full border rounded-lg">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-3 text-left">Nome</th>
                            <th className="p-3 text-left">Email</th>
                            <th className="p-3 text-left">Role</th>
                            <th className="p-3 text-right">Ações</th>
                        </tr>
                    </thead>

                    <tbody>
                        {users.data.map((user) => (
                            <tr key={user.id} className="border-t">
                                <td className="p-3">{user.name}</td>
                                <td className="p-3">{user.email}</td>
                                <td className="p-3">
                                    {user.roles.length ? user.roles[0].name : '—'}
                                </td>

                                <td className="p-3 text-right space-x-2">
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={`/users/${user.id}/edit`}>Editar</Link>
                                    </Button>

                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() =>
                                            router.delete(`/users/${user.id}`)
                                        }
                                    >
                                        Apagar
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AppLayout>
    );
}
