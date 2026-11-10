import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/ui/page-header';
import AppLayout from '@/layouts/app-layout';
import { router, useForm, usePage } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Key, Plus, ShieldCheck, Trash2 } from 'lucide-react';
import type { FormEvent } from 'react';

export default function RolesPermissionsIndex() {
    const { roles, permissions } = usePage().props as {
        roles: Array<{ id: number; name: string; permissions: Array<{ id: number; name: string }> }>;
        permissions: Array<{ id: number; name: string }>;
    };

    const createRoleForm = useForm({
        name: '',
        permissions: [] as string[],
    });

    const createPermissionForm = useForm({
        name: '',
    });

    const togglePermission = (current: string[], permissionName: string) => {
        return current.includes(permissionName) ? current.filter((p) => p !== permissionName) : [...current, permissionName];
    };

    const submitCreateRole = (e: FormEvent) => {
        e.preventDefault();
        createRoleForm.post('/access-control/roles', {
            preserveScroll: true,
            onSuccess: () => createRoleForm.reset('name', 'permissions'),
        });
    };

    const submitCreatePermission = (e: FormEvent) => {
        e.preventDefault();
        createPermissionForm.post('/access-control/permissions', {
            preserveScroll: true,
            onSuccess: () => createPermissionForm.reset('name'),
        });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Roles & Permissões', href: '/access-control' }]}>
            <Head title="Gestão de Roles e Permissões" />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <PageHeader
                    title="Roles & Permissões"
                    description="Define os níveis de acesso e o que cada role pode fazer na plataforma."
                    icon={<ShieldCheck className="size-5" />}
                />

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Criar Role</CardTitle>
                                <CardDescription>Define um novo nível de acesso e as permissões associadas.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={submitCreateRole} className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label>Nome da role</Label>
                                        <Input
                                            value={createRoleForm.data.name}
                                            onChange={(e) => createRoleForm.setData('name', e.target.value)}
                                            placeholder="ex: gestor_agenda"
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label>Permissões</Label>
                                        <div className="bg-muted/40 max-h-48 space-y-2 overflow-y-auto rounded-lg border border-border p-3">
                                            {permissions.map((permission) => (
                                                <label key={permission.id} className="flex items-center gap-2 text-sm">
                                                    <Checkbox
                                                        checked={createRoleForm.data.permissions.includes(permission.name)}
                                                        onCheckedChange={() =>
                                                            createRoleForm.setData(
                                                                'permissions',
                                                                togglePermission(createRoleForm.data.permissions, permission.name),
                                                            )
                                                        }
                                                    />
                                                    <span className="text-foreground">{permission.name}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <Button disabled={createRoleForm.processing}>
                                        <Plus className="size-4" />
                                        Criar role
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Criar Permissão</CardTitle>
                                <CardDescription>Adiciona uma nova permissão granular ao sistema.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={submitCreatePermission} className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label>Nome da permissão</Label>
                                        <Input
                                            value={createPermissionForm.data.name}
                                            onChange={(e) => createPermissionForm.setData('name', e.target.value)}
                                            placeholder="ex: agenda.approve"
                                        />
                                    </div>

                                    <Button disabled={createPermissionForm.processing}>
                                        <Plus className="size-4" />
                                        Criar permissão
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15 }}>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Roles existentes</CardTitle>
                            <CardDescription>Gere as permissões atribuídas a cada role.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {roles.length === 0 ? (
                                <EmptyState icon={ShieldCheck} title="Ainda não há roles" description="Cria a primeira role acima." />
                            ) : (
                                <div className="space-y-4">
                                    {roles.map((role, idx) => {
                                        const currentPermissions = role.permissions.map((p) => p.name);

                                        return (
                                            <RoleRow
                                                key={role.id}
                                                role={role}
                                                permissions={permissions}
                                                currentPermissions={currentPermissions}
                                                index={idx}
                                            />
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Permissões existentes</CardTitle>
                            <CardDescription>Lista de todas as permissões granulares do sistema.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {permissions.length === 0 ? (
                                <EmptyState icon={Key} title="Ainda não há permissões" description="Cria a primeira permissão acima." />
                            ) : (
                                <div className="space-y-2">
                                    {permissions.map((permission) => (
                                        <PermissionRow key={permission.id} permission={permission} />
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </AppLayout>
    );
}

function RoleRow({
    role,
    permissions,
    currentPermissions,
    index,
}: {
    role: { id: number; name: string };
    permissions: Array<{ id: number; name: string }>;
    currentPermissions: string[];
    index: number;
}) {
    const form = useForm({
        name: role.name,
        permissions: currentPermissions,
    });

    const togglePermission = (permissionName: string) => {
        form.setData(
            'permissions',
            form.data.permissions.includes(permissionName)
                ? form.data.permissions.filter((p) => p !== permissionName)
                : [...form.data.permissions, permissionName],
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, delay: index * 0.04 }}
            className="rounded-lg border border-border bg-muted/30 p-4"
        >
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    form.put(`/access-control/roles/${role.id}`, { preserveScroll: true });
                }}
                className="space-y-3"
            >
                <div className="flex items-center gap-2">
                    <Input value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} />
                    <Button type="submit" size="sm" disabled={form.processing}>
                        Guardar
                    </Button>
                    <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive size-9 shrink-0"
                        title="Apagar"
                        onClick={() => router.delete(`/access-control/roles/${role.id}`, { preserveScroll: true })}
                    >
                        <Trash2 className="size-4" />
                    </Button>
                </div>

                <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
                    {permissions.map((permission) => (
                        <label key={permission.id} className="flex items-center gap-2 text-sm">
                            <Checkbox
                                checked={form.data.permissions.includes(permission.name)}
                                onCheckedChange={() => togglePermission(permission.name)}
                            />
                            <span className="text-foreground">{permission.name}</span>
                        </label>
                    ))}
                </div>
            </form>
        </motion.div>
    );
}

function PermissionRow({ permission }: { permission: { id: number; name: string } }) {
    const form = useForm({ name: permission.name });

    return (
        <div className="flex items-center gap-2 rounded-lg border border-border p-2">
            <Input value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} />
            <Button size="sm" onClick={() => form.put(`/access-control/permissions/${permission.id}`, { preserveScroll: true })} disabled={form.processing}>
                Guardar
            </Button>
            <Button
                size="icon"
                variant="ghost"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive size-9 shrink-0"
                title="Apagar"
                onClick={() => router.delete(`/access-control/permissions/${permission.id}`, { preserveScroll: true })}
            >
                <Trash2 className="size-4" />
            </Button>
        </div>
    );
}
