import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Pencil, Plus, Trash2, UserRound, Users as UsersIcon, Eye } from 'lucide-react';

type Role = { id: number; name: string };

type UserRow = {
    id: number;
    name: string;
    email: string;
    roles: Role[];
};

type PaginationLink = { url: string | null; label: string; active: boolean };

export default function Index() {
    const { users } = usePage().props as unknown as {
        users: { data: UserRow[]; links: PaginationLink[] };
    };

    const initials = (name: string) =>
        name
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase())
            .join('');

    return (
        <AppLayout breadcrumbs={[{ title: 'Utilizadores', href: '/users' }]}>
            <Head title="Gestão de Utilizadores" />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <PageHeader
                    title="Utilizadores"
                    description="Gere o acesso de equipas, secretariado e administração à plataforma."
                    icon={<UsersIcon className="size-5" />}
                    actions={
                        <Button asChild>
                            <Link href="/users/create">
                                <Plus className="size-4" />
                                Criar utilizador
                            </Link>
                        </Button>
                    }
                />

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 }}
                    className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
                >
                    {users.data.length === 0 ? (
                        <EmptyState
                            icon={UserRound}
                            title="Ainda não há utilizadores"
                            description="Cria o primeiro utilizador para dar acesso à plataforma."
                            action={
                                <Button asChild size="sm">
                                    <Link href="/users/create">Criar utilizador</Link>
                                </Button>
                            }
                        />
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Utilizador</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.data.map((user, idx) => (
                                    <motion.tr
                                        key={user.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.2, delay: idx * 0.03 }}
                                        className="hover:bg-muted/40 border-b border-border transition-colors last:border-0"
                                    >
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
                                                    {initials(user.name) || <UserRound className="size-4" />}
                                                </div>
                                                <span className="font-medium text-foreground">{user.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">{user.email}</TableCell>
                                        <TableCell>
                                            {user.roles.length ? (
                                                <Badge variant="secondary" className="font-normal capitalize">
                                                    {user.roles[0].name}
                                                </Badge>
                                            ) : (
                                                <span className="text-muted-foreground">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <Button asChild variant="ghost" size="icon" className="size-8" title="Ver">
                                                    <Link href={`/users/${user.id}`}>
                                                        <Eye className="size-4" />
                                                    </Link>
                                                </Button>

                                                <Button asChild variant="ghost" size="icon" className="size-8" title="Editar">
                                                    <Link href={`/users/${user.id}/edit`}>
                                                        <Pencil className="size-4" />
                                                    </Link>
                                                </Button>

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive hover:bg-destructive/10 hover:text-destructive size-8"
                                                    title="Apagar"
                                                    onClick={() => {
                                                        if (confirm(`Apagar o utilizador "${user.name}"?`)) {
                                                            router.delete(`/users/${user.id}`, { preserveScroll: true });
                                                        }
                                                    }}
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </motion.tr>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </motion.div>

                {users.links.length > 3 && (
                    <div className="flex justify-end gap-1.5">
                        {users.links.map((link, i) => (
                            <Button
                                key={i}
                                asChild={!!link.url}
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                disabled={!link.url}
                            >
                                {link.url ? (
                                    <Link href={link.url} dangerouslySetInnerHTML={{ __html: link.label }} />
                                ) : (
                                    <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                )}
                            </Button>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
