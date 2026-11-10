import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { router } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function SecretariaRespostaModal({ open, onClose, call, doente, resultados }) {
    const [form, setForm] = useState({
        resultado: '',
        data_agendada: '',
        observacoes: '',
    });

    const [loading, setLoading] = useState(false);

    // ⭐ Carregar dados da chamada quando o modal abre
    useEffect(() => {
        if (call) {
            setForm({
                resultado: call.estado_novo ?? '',
                data_agendada: call.data_agendada ? call.data_agendada.substring(0, 10) : '',
                observacoes: call.observacoes_secretaria ?? '',
            });
        }
    }, [call]);

    function update(field, value) {
        setForm((prev) => ({ ...prev, [field]: value }));
    }

    function submit() {
        if (!call) return;

        setLoading(true);

        router.post(`/waiting-list/chamada/${call.id}/resposta`, form, {
            preserveScroll: true,
            onSuccess: () => {
                setLoading(false);
                onClose();
            },
            onError: () => setLoading(false),
        });
    }

    if (!call || !doente) return null;

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{doente.nome}</DialogTitle>
                </DialogHeader>

                {/* Dados do pedido */}
                <div className="bg-muted/50 space-y-1 rounded-lg border border-border p-4 text-sm">
                    <p>
                        <strong className="text-foreground">Pedido por:</strong> <span className="text-muted-foreground">{call.pedido_por_user?.nome}</span>
                    </p>
                    <p>
                        <strong className="text-foreground">Tipo:</strong> <span className="text-muted-foreground">{call.tipo_chamada}</span>
                    </p>
                    <p>
                        <strong className="text-foreground">Data pretendida:</strong> <span className="text-muted-foreground">{call.data_pretendida}</span>
                    </p>
                    <p>
                        <strong className="text-foreground">Pedido em:</strong> <span className="text-muted-foreground">{call.pedido_em}</span>
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="grid gap-2">
                        <Label>Resultado</Label>
                        <Select value={form.resultado} onValueChange={(value) => update('resultado', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                                {resultados.map((r: string) => (
                                    <SelectItem key={r} value={r}>
                                        {r}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {form.resultado === 'Agendado' && (
                        <div className="grid gap-2">
                            <Label>Data de Agenda</Label>
                            <input
                                type="date"
                                value={form.data_agendada}
                                onChange={(e) => update('data_agendada', e.target.value)}
                                className="border-input bg-background focus:ring-ring w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
                            />
                        </div>
                    )}

                    <div className="grid gap-2">
                        <Label>Observações</Label>
                        <Textarea value={form.observacoes} onChange={(e) => update('observacoes', e.target.value)} className="h-24" />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <Button variant="ghost" onClick={onClose}>
                        Cancelar
                    </Button>

                    <Button onClick={submit} disabled={loading} className="bg-success text-success-foreground hover:bg-success/90">
                        {loading && <LoaderCircle className="size-4 animate-spin" />}
                        {loading ? 'A guardar...' : 'Guardar resposta'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
