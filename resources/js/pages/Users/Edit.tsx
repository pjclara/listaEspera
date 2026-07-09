import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Edit() {
    const { user, roles } = usePage().props;

    const { data, setData, put, processing } = useForm({
        name: user.name,
        email: user.email,
        role: user.roles[0]?.name || '',
    });

    function submit(e) {
        e.preventDefault();
        put(`/users/${user.id}`);
    }

    return (
        <AppLayout breadcrumbs={[{ title: 'Editar Utilizador', href: `/users/${user.id}/edit` }]}>
            <Head title="Editar Utilizador" />

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
                    <Label>Role</Label>
                    <select
                        className="border rounded p-2 w-full"
                        value={data.role}
                        onChange={(e) => setData('role', e.target.value)}
                    >
                        {roles.map((role) => (
                            <option key={role.id} value={role.name}>
                                {role.name}
                            </option>
                        ))}
                    </select>
                </div>

                <Button disabled={processing}>Guardar</Button>
            </form>
        </AppLayout>
    );
}
