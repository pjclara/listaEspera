import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/ui/page-header';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { LoaderCircle, UserPlus } from 'lucide-react';
import { FormEventHandler } from 'react';

type Role = { id: number; name: string };
type Team = { id: number; nome: string };

export default function Create() {
    const { roles, teams } = usePage().props as unknown as { roles: Role[]; teams: Team[] };

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        role: '',
        team_id: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/users');
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Utilizadores', href: '/users' }, { title: 'Criar Utilizador', href: '/users/create' }]}>
            <Head title="Criar Utilizador" />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <PageHeader title="Criar utilizador" description="Dá acesso a um novo membro da equipa." icon={<UserPlus className="size-5" />} />

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}>
                    <Card className="max-w-lg">
                        <CardHeader>
                            <CardTitle className="text-base">Dados do utilizador</CardTitle>
                            <CardDescription>Define o nome, email, password e nível de acesso.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="space-y-5">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Nome</Label>
                                    <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} autoFocus />
                                    {errors.name && <p className="text-destructive text-sm">{errors.name}</p>}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                                    {errors.email && <p className="text-destructive text-sm">{errors.email}</p>}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                    />
                                    {errors.password && <p className="text-destructive text-sm">{errors.password}</p>}
                                </div>

                                <div className="grid gap-2">
                                    <Label>Role</Label>
                                    <Select value={data.role} onValueChange={(value) => setData('role', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione uma role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {roles.map((role) => (
                                                <SelectItem key={role.id} value={role.name}>
                                                    {role.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.role && <p className="text-destructive text-sm">{errors.role}</p>}
                                </div>

                                <div className="grid gap-2">
                                    <Label>Equipa</Label>
                                    <Select value={data.team_id} onValueChange={(value) => setData('team_id', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sem equipa" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {teams.map((team) => (
                                                <SelectItem key={team.id} value={String(team.id)}>
                                                    {team.nome}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.team_id && <p className="text-destructive text-sm">{errors.team_id}</p>}
                                </div>

                                <div className="flex items-center gap-2 pt-2">
                                    <Button type="submit" disabled={processing}>
                                        {processing && <LoaderCircle className="size-4 animate-spin" />}
                                        Criar utilizador
                                    </Button>
                                    <Button type="button" variant="ghost" asChild>
                                        <Link href="/users">Cancelar</Link>
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </AppLayout>
    );
}
