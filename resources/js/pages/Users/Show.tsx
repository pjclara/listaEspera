import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Pencil, UserRound, UsersRound } from 'lucide-react';

type Role = { id: number; name: string };
type Team = { id: number; nome: string };
type UserDetail = { id: number; name: string; email: string; roles: Role[]; team: Team | null };

export default function Show() {
    const { user } = usePage().props as unknown as { user: UserDetail };

    const initials = user.name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('');

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Utilizadores', href: '/users' },
                { title: user.name, href: `/users/${user.id}` },
            ]}
        >
            <Head title={`Utilizador: ${user.name}`} />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                    <Card className="max-w-xl overflow-hidden">
                        <div className="bg-gradient-to-br from-primary/90 to-primary/60 h-20" />
                        <CardContent className="relative -mt-10 pb-6">
                            <div className="flex items-end justify-between">
                                <div className="bg-card text-primary flex size-20 items-center justify-center rounded-2xl border-4 border-card text-2xl font-semibold shadow-lg">
                                    {initials || <UserRound className="size-8" />}
                                </div>
                                <Button asChild size="sm">
                                    <Link href={`/users/${user.id}/edit`}>
                                        <Pencil className="size-4" />
                                        Editar
                                    </Link>
                                </Button>
                            </div>

                            <h1 className="mt-4 text-xl font-semibold text-foreground">{user.name}</h1>

                            <div className="text-muted-foreground mt-1 flex items-center gap-1.5 text-sm">
                                <Mail className="size-3.5" />
                                {user.email}
                            </div>

                            <div className="mt-5 flex flex-wrap items-center gap-2">
                                {user.roles.length ? (
                                    user.roles.map((role) => (
                                        <Badge key={role.id} className="capitalize">
                                            {role.name}
                                        </Badge>
                                    ))
                                ) : (
                                    <Badge variant="outline">Sem role</Badge>
                                )}

                                <Badge variant="secondary" className="gap-1.5 font-normal">
                                    <UsersRound className="size-3" />
                                    {user.team ? user.team.nome : 'Sem equipa'}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <Button asChild variant="ghost" className="w-fit">
                    <Link href="/users">
                        <ArrowLeft className="size-4" />
                        Voltar à lista
                    </Link>
                </Button>
            </div>
        </AppLayout>
    );
}
