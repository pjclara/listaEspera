import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Pencil, Plus, Trash2, Users, UsersRound } from 'lucide-react';
import { useState } from 'react';
import CreateTeamModal from './../../components/teams/CreateTeamModal';

type Team = {
    id: number;
    nome: string;
    cor?: string;
    ativa?: boolean;
    leader_id?: number | string;
    sala_default?: string;
};

export default function TeamsIndex() {
    const { teams } = usePage().props as unknown as { teams: Team[] };

    const [showCreate, setShowCreate] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Equipas', href: '/teams' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestão de Equipas" />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <PageHeader
                    title="Equipas"
                    description="Organiza as equipas cirúrgicas e respetivas salas padrão."
                    icon={<UsersRound className="size-5" />}
                    actions={
                        <Button
                            onClick={() => {
                                setSelectedTeam(null);
                                setShowCreate(true);
                            }}
                        >
                            <Plus className="size-4" />
                            Nova Equipa
                        </Button>
                    }
                />

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 }}
                    className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
                >
                    {teams.length === 0 ? (
                        <EmptyState
                            icon={Users}
                            title="Ainda não há equipas"
                            description="Cria a primeira equipa cirúrgica para começar a organizar a agenda."
                            action={
                                <Button size="sm" onClick={() => setShowCreate(true)}>
                                    Nova Equipa
                                </Button>
                            }
                        />
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nome</TableHead>
                                    <TableHead>Sala padrão</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {teams.map((team, idx) => (
                                    <motion.tr
                                        key={team.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.2, delay: idx * 0.03 }}
                                        className="hover:bg-muted/40 border-b border-border transition-colors last:border-0"
                                    >
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <span
                                                    className="inline-block size-3 shrink-0 rounded-full ring-2 ring-offset-1 ring-offset-card"
                                                    style={{ backgroundColor: team.cor, boxShadow: `0 0 0 2px ${team.cor}33` }}
                                                />
                                                <span className="font-medium text-foreground">{team.nome}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">{team.sala_default || '—'}</TableCell>
                                        <TableCell>
                                            {team.ativa ? (
                                                <Badge className="bg-success text-success-foreground hover:bg-success/90">Ativa</Badge>
                                            ) : (
                                                <Badge variant="destructive">Inativa</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-8"
                                                    title="Editar"
                                                    onClick={() => {
                                                        setSelectedTeam(team);
                                                        setShowCreate(true);
                                                    }}
                                                >
                                                    <Pencil className="size-4" />
                                                </Button>

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive hover:bg-destructive/10 hover:text-destructive size-8"
                                                    title="Apagar"
                                                    onClick={() => {
                                                        if (confirm(`Apagar a equipa "${team.nome}"?`)) {
                                                            router.delete(`/teams/${team.id}`, { preserveScroll: true });
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
            </div>

            {showCreate && <CreateTeamModal team={selectedTeam} close={() => setShowCreate(false)} />}
        </AppLayout>
    );
}
