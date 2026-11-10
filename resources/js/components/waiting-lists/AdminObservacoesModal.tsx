import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { router, usePage } from '@inertiajs/react';

interface AdminObservacoesModalProps {
    open: boolean;
    selected: any;
    form: {
        contactado: boolean;
        data_contacto: string;
        contactado_por: string;
        observacoes: string;
        contact_result: string;
    };
    setForm: React.Dispatch<
        React.SetStateAction<{
            contactado: boolean;
            data_contacto: string;
            contactado_por: string;
            observacoes: string;
            contact_result: string;
        }>
    >;
    errors?: any;
    onClose: () => void;
    permissions: string[];
}

const RESULT_OPTIONS = [
    { value: 'nao_atendeu', label: 'Não atendeu' },
    { value: 'nao_quer_operar', label: 'Não quer ser operado' },
    { value: 'quer_operar_mais_tarde', label: 'Quer ser operado mais tarde' },
    { value: 'outra_instituicao', label: 'Vai ser operado noutra instituição' },
    { value: 'quer_operar', label: 'Aceita ser operado' },
    { value: 'outro', label: 'Outro' },
];

export default function AdminObservacoesModal({ open, selected, form, setForm, onClose, permissions }: AdminObservacoesModalProps) {
    const { errors } = usePage().props as any;

    if (!selected) return null;

    const canEdit = permissions.includes('waiting_list.manage');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        router.post(
            `/waiting-lists/${selected.id}/admin`,
            {
                data_contacto: form.data_contacto,
                contactado_por: form.contactado_por,
                observacoes: form.observacoes,
                contact_result: form.contact_result,
            },
            {
                preserveScroll: true,
                onSuccess: () => onClose(),
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Dados Administrativos — Nº {selected.num_processo}</DialogTitle>
                </DialogHeader>

                {canEdit && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid gap-2">
                            <Label>Resultado do contacto</Label>
                            <Select value={form.contact_result} onValueChange={(value) => setForm({ ...form, contact_result: value })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione…" />
                                </SelectTrigger>
                                <SelectContent>
                                    {RESULT_OPTIONS.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.contact_result && <p className="text-destructive text-sm">{errors.contact_result}</p>}
                        </div>

                        <div className="grid gap-2">
                            <Label>Data de contacto</Label>
                            <Input
                                type="date"
                                value={form.data_contacto}
                                onChange={(e) => setForm({ ...form, data_contacto: e.target.value })}
                            />
                            {errors.data_contacto && <p className="text-destructive text-sm">{errors.data_contacto}</p>}
                        </div>

                        <div className="grid gap-2">
                            <Label>Contactado por</Label>
                            <Input
                                type="text"
                                value={form.contactado_por}
                                onChange={(e) => setForm({ ...form, contactado_por: e.target.value })}
                            />
                            {errors.contactado_por && <p className="text-destructive text-sm">{errors.contactado_por}</p>}
                        </div>

                        <div className="grid gap-2">
                            <Label>Observações</Label>
                            <Textarea value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} className="h-24" />
                            {errors.observacoes && <p className="text-destructive text-sm">{errors.observacoes}</p>}
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit">Guardar</Button>
                        </div>
                    </form>
                )}

                <div className="border-border mt-2 border-t pt-4">
                    <h3 className="text-foreground mb-3 text-sm font-semibold">Histórico de contactos</h3>

                    {selected.contacts.length === 0 && <p className="text-muted-foreground text-sm">Sem contactos registados.</p>}

                    <div className="max-h-60 space-y-3 overflow-y-auto">
                        {selected.contacts.map((c) => (
                            <div key={c.id} className="bg-muted/50 rounded-lg border border-border p-3">
                                <div className="text-sm text-foreground">
                                    <strong>{c.data_contacto}</strong> — {c.contact_result.replace('_', ' ')}
                                </div>

                                <div className="text-muted-foreground text-xs">Contactado por: {c.contactado_por}</div>

                                {c.observacoes && <div className="text-muted-foreground mt-1 text-xs">{c.observacoes}</div>}
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 flex justify-end">
                        <Button type="button" variant="secondary" onClick={onClose}>
                            Fechar
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
