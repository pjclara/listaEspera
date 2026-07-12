import AppLayout from '@/layouts/app-layout';
import { Head, useForm, Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Create() {
    const { roles, teams } = usePage().props;

    const { data, setData, post, processing } = useForm({
        name: '',
        email: '',
        password: '',
        role: '',
        team_id: '',
    });

    function submit(e) {
        e.preventDefault();
        post('/users');
    }

    return (
        <AppLayout breadcrumbs={[{ title: 'Criar Utilizador', href: '/users/create' }]}>
            <Head title="Criar Utilizador" />

            <form onSubmit={submit} className="p-6 max-w-lg space-y-6">
                <div>
                    <Label>Nome</Label>
                    <Input value={data.name} onChange={(e) => setData('name', e.target.value)} />
                </div>

                <div>
                    <Label>Email</Label>
                    <Input value={data.email} onChange={(e) => setData('email', e.target.value)} />
                </div>

                <div>
                    <Label>Password</Label>
                    <Input type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} />
                </div>

                <div>
                    <Label>Role</Label>
                    <select
                        className="border rounded p-2 w-full"
                        value={data.role}
                        onChange={(e) => setData('role', e.target.value)}
                    >
                        <option value="">Selecione…</option>
                        {roles.map((role) => (
                            <option key={role.id} value={role.name}>
                                {role.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <Label>Equipa</Label>
                    <select
                        className="border rounded p-2 w-full"
                        value={data.team_id}
                        onChange={(e) => setData('team_id', e.target.value)}
                    >
                        <option value="">Sem equipa</option>
                        {teams.map((team) => (
                            <option key={team.id} value={team.id}>
                                {team.nome}
                            </option>
                        ))}
                    </select>
                </div>

                <Button disabled={processing}>Criar</Button>
            </form>
        </AppLayout>
    );
}
